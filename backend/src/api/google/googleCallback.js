const User = require("../../Classes/User.js");

function googleCallback(userManager, fastify, db, setTokenCookie) {
    return async function (req, reply) {
        try {
            // Obtener token OAuth2
            const token = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(req);

            const userInfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: `Bearer ${token.token.access_token}` }
            }).then(res => res.json());

            console.log("Google user info:", userInfo);

            // Buscar usuario por email o por oauth_id
            let user = await new Promise((resolve, reject) => {
                db.get(`
                    SELECT id, username, display_name, email, password, twofa, oauth_provider, oauth_id
                    FROM users
                    WHERE email = ? OR oauth_id = ?
                `, [userInfo.email, userInfo.id], (err, row) => {
                    if (err) return reject(err);
                    resolve(row);
                });
            });

            let userId;
            let finalUsername = "";
            if (!user) {
                // Crear usuario nuevo
                const baseName = userInfo.given_name || userInfo.name || "User";
                const cleanName = baseName.replace(/\s+/g, '');
                const randomSuffix = Math.floor(1000 + Math.random() * 9000);
                const uniqueUsername = `${cleanName}_${randomSuffix}`;
                finalUsername = uniqueUsername;
                userId = await new Promise((resolve, reject) => {
                    db.run(
                        `INSERT INTO users (username, display_name, email, password, twofa, oauth_provider, oauth_id)
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                        [
                            uniqueUsername,
                            userInfo.email.split('@')[0],
                            userInfo.email,
                            '',
                            'skip',
                            'google',
                            userInfo.id
                        ],
                        function (err) {
                            if (err) return reject(err);
                            resolve(this.lastID);
                        }
                    );
                })
                await new Promise((resolve) => {
                    db.run("INSERT OR IGNORE INTO stats (user_id) VALUES (?)", [userId], (err) => {
                        if (err) console.error("Error creating stats for Google user:", err);
                        resolve();
                    });
                });
            }
            else if (user.oauth_provider === "google" && user.oauth_id === userInfo.id) {
                userId = user.id;
                finalUsername = user.username;
            }
            else {
                // Email existe pero NO está registrado con Google
                return reply.redirect('/?error_google=email_exists_different_provider');
            }

            const statsRow = await new Promise((resolve, reject) => {
                db.get("SELECT * FROM stats WHERE user_id = ?", [userId], (err, row) => {
                    err ? reject(err) : resolve(row);
                });
            });

            const userStatsData = {
                local_played: statsRow?.local_played || 0,
                local_won: statsRow?.local_won || 0,
                online_played: statsRow?.online_played || 0,
                online_won: statsRow?.online_won || 0,
                tournaments_played: statsRow?.tournaments_played || 0,
                tournaments_won: statsRow?.tournaments_won || 0,
                ai_played: statsRow?.ai_played || 0,
                ai_won: statsRow?.ai_won || 0,
                matches: statsRow?.matches || 0,
                total_wins: statsRow?.total_wins || 0,
                win_rate: statsRow?.win_rate || 0,
                current_streak: statsRow?.current_streak || 0,
                best_streak: statsRow?.best_streak || 0
            };

            // UserManager
            let player = userManager.getUserByID(userId);
            if (!player) {
                player = new User({
                    id: userId,
                    username: finalUsername,
                    display_name: userInfo.email.split('@')[0],
                    socket: null,
                    stats: userStatsData  // ← ahora sí
                });
                userManager.addUser(player);
            }

            if (userManager.loginUser(userId) === false) {
                return reply.redirect('/?error_google=user_login');
            }

            // Crear JWT
            const jwtToken = fastify.jwt.sign(
                {
                    id: userId,
                    display_name: userInfo.email.split('@')[0]
                },
                { expiresIn: "7d" }
            );

            // Cookie
            setTokenCookie(reply, jwtToken);

            // Listo
            reply.redirect(`/`);

        } catch (err) {
            console.error("Google OAuth error:", err);
            reply.redirect(`/?oauth_error=server_error`);
        }
    };
}

module.exports = googleCallback;
