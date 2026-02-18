module.exports = async function getMatchHistoryFromDB(userManager, userId) {
    return new Promise((resolve, reject) => {
        if (!userManager.db) return resolve([]);
        
        const query = `
            SELECT m.id, m.score_p1, m.score_p2, m.winner_id, m.game_mode, m.played_at, m.player1_id,
                   u1.display_name as p1_name, u2.display_name as p2_name
            FROM matches m
            LEFT JOIN users u1 ON m.player1_id = u1.id
            LEFT JOIN users u2 ON m.player2_id = u2.id
            WHERE m.player1_id = ? OR m.player2_id = ?
            ORDER BY m.played_at DESC LIMIT 20
        `;
        
        userManager.db.all(query, [userId, userId], (err, rows) => {
            if (err) return reject(err);
            
            const history = rows.map(row => {
                const isP1 = (row.player1_id === userId);
                let result = "loss";
                
                if (row.winner_id === userId) result = "win";
                else if (row.game_mode === "local" && isP1 && row.score_p1 > row.score_p2) result = "win";
                let opponent = "Unknown";
                if (isP1) {
                     if (row.p2_name) opponent = row.p2_name;
                     else if (row.game_mode === "local") opponent = "Guest";
                     else if (row.game_mode.includes("ai")) opponent = "AI";
                } else {
                    opponent = row.p1_name || "Unknown";
                }
                return {
                    id: row.id,
                    result: result,
                    opponent: opponent,
                    userScore: isP1 ? row.score_p1 : row.score_p2,
                    opponentScore: isP1 ? row.score_p2 : row.score_p1,
                    mode: row.game_mode,
                    timestamp: new Date(row.played_at).getTime()
                };
            });
            resolve(history);
        });
    });
}