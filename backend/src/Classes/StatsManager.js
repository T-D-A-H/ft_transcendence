const LOGGER = require("../LOGGER.js");

// ═══════════════════════════════════════════════════════════
// STATS MANAGER - Gestión modular de estadísticas de partidas
// Regla: ganador suma played + won + total_wins + streak
//        perdedor suma SOLO played, streak se resetea
// ═══════════════════════════════════════════════════════════

class StatsManager {

    constructor(db) {
        this.db = db;
    }

    // ─────────────────────────────────────────────
    // MÉTODO PRINCIPAL - llamar al final de cada partida
    // ─────────────────────────────────────────────

    handleMatchEnd(matchType, winnerUser, loserUser) {
        if (matchType === "online") {
            this._handleOnline(winnerUser, loserUser);
        } else if (matchType === "tournament") {
            this._handleTournamentRound(winnerUser, loserUser);
        } else if (matchType === "2player") {
            this._handleLocal(winnerUser, loserUser);
        } else if (matchType.startsWith("ai")) {
            this._handleAI(winnerUser, loserUser);
        }
    }

    // Llamar solo cuando alguien GANA el torneo completo (no cada ronda)
    handleTournamentWin(winnerUser) {
        this._updateMemory(winnerUser, { tournaments_won: 1 });
        this._updateDB(winnerUser.getId(), `
            UPDATE stats SET tournaments_won = tournaments_won + 1
            WHERE user_id = ?
        `);
        LOGGER(200, "StatsManager", "handleTournamentWin",
            `${winnerUser.getUsername()} won a tournament`);
    }

    // ─────────────────────────────────────────────
    // ONLINE
    // ─────────────────────────────────────────────

    _handleOnline(winnerUser, loserUser) {
        // GANADOR: todo sube
        this._updateMemory(winnerUser, {
            matches: 1,
            online_played: 1,
            online_won: 1,
            total_wins: 1,
            streak: true
        });
        this._updateDB(winnerUser.getId(), `
            UPDATE stats SET
                matches         = matches + 1,
                online_played   = online_played + 1,
                online_won      = online_won + 1,
                total_wins      = total_wins + 1,
                current_streak  = current_streak + 1,
                best_streak     = MAX(best_streak, current_streak + 1)
            WHERE user_id = ?
        `);

        // PERDEDOR: solo played, streak a 0
        this._updateMemory(loserUser, {
            matches: 1,
            online_played: 1,
            streak: false  // resetear streak
        });
        this._updateDB(loserUser.getId(), `
            UPDATE stats SET
                matches        = matches + 1,
                online_played  = online_played + 1,
                current_streak = 0
            WHERE user_id = ?
        `);

        LOGGER(200, "StatsManager", "_handleOnline",
            `W:${winnerUser.getUsername()} L:${loserUser.getUsername()}`);
    }

    // ─────────────────────────────────────────────
    // TORNEO - ronda individual (no el torneo completo)
    // ─────────────────────────────────────────────

    _handleTournamentRound(winnerUser, loserUser) {
        // GANADOR de la ronda: matches sube, streak sube
        // (tournaments_won solo sube al ganar el torneo completo en stopTournament)
        this._updateMemory(winnerUser, {
            matches: 1,
            total_wins: 1,
            streak: true
        });
        this._updateDB(winnerUser.getId(), `
            UPDATE stats SET
                matches        = matches + 1,
                total_wins     = total_wins + 1,
                current_streak = current_streak + 1,
                best_streak    = MAX(best_streak, current_streak + 1)
            WHERE user_id = ?
        `);

        // PERDEDOR de la ronda: solo matches, streak a 0
        this._updateMemory(loserUser, {
            matches: 1,
            streak: false
        });
        this._updateDB(loserUser.getId(), `
            UPDATE stats SET
                matches        = matches + 1,
                current_streak = 0
            WHERE user_id = ?
        `);

        LOGGER(200, "StatsManager", "_handleTournamentRound",
            `W:${winnerUser.getUsername()} L:${loserUser.getUsername()}`);
    }

    // ─────────────────────────────────────────────
    // LOCAL (2player)
    // ─────────────────────────────────────────────

    _handleLocal(realUser, scores) {
        // En local solo hay 1 usuario real, scores = [p1score, p2score]
        const userWon = scores[1] > scores[0]; // p2 es el "guest"
        
        this._updateMemory(realUser, {
            matches: 1,
            local_played: 1,
            local_won: userWon ? 1 : 0
        });

        this._updateDB(realUser.getId(), `
            UPDATE stats SET
                matches      = matches + 1,
                local_played = local_played + 1
                ${userWon ? ", local_won = local_won + 1" : ""}
            WHERE user_id = ?
        `);

        LOGGER(200, "StatsManager", "_handleLocal",
            `${realUser.getUsername()} ${userWon ? "won" : "lost"} local`);

        return userWon;
    }

    // ─────────────────────────────────────────────
    // AI
    // ─────────────────────────────────────────────

    _handleAI(realUser, scores) {
        const userWon = scores[1] > scores[0];

        this._updateMemory(realUser, {
            matches: 1,
            local_played: 1,
            local_won: userWon ? 1 : 0
        });
        this._updateDB(realUser.getId(), `
            UPDATE stats SET
                matches   = matches + 1,
                local_played = local_played + 1
                ${userWon ? ", local_won = local_won + 1" : ""}
            WHERE user_id = ?
        `);

        LOGGER(200, "StatsManager", "_handleAI",
            `${realUser.getUsername()} ${userWon ? "beat" : "lost to"} AI`);

        return userWon;
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    _updateMemory(user, delta) {
        if (!user || !user.stats) return;
        const s = user.stats;

        if (delta.matches)        s.matches        = (s.matches || 0)        + delta.matches;
        if (delta.online_played)  s.online_played  = (s.online_played || 0)  + delta.online_played;
        if (delta.online_won)     s.online_won     = (s.online_won || 0)     + delta.online_won;
        if (delta.local_played)   s.local_played   = (s.local_played || 0)   + delta.local_played;
        if (delta.local_won)      s.local_won      = (s.local_won || 0)      + delta.local_won;
        if (delta.ai_played)      s.ai_played      = (s.ai_played || 0)      + delta.ai_played;
        if (delta.ai_won)         s.ai_won         = (s.ai_won || 0)         + delta.ai_won;
        if (delta.total_wins)     s.total_wins     = (s.total_wins || 0)     + delta.total_wins;
        if (delta.tournaments_won) s.tournaments_won = (s.tournaments_won || 0) + delta.tournaments_won;

        // streak
        if (delta.streak === true) {
            s.current_streak = (s.current_streak || 0) + 1;
            if (s.current_streak > (s.best_streak || 0)) {
                s.best_streak = s.current_streak;
            }
        } else if (delta.streak === false) {
            s.current_streak = 0;
        }
    }

    _updateDB(userId, query) {
        if (!this.db) return;
        this.db.run(query.trim(), [userId], (err) => {
            if (err) console.error(`[StatsManager] DB error for user ${userId}:`, err.message);
        });
    }
}

module.exports = StatsManager;