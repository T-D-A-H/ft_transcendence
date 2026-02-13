const LOGGER = require("../LOGGER.js");

class UserStats {
    constructor(stats = {}) {
        this.local_played = stats.local_played || 0;
        this.local_won = stats.local_won || 0;
        this.online_played = stats.online_played || 0;
        this.online_won = stats.online_won || 0;
        this.tournaments_played = stats.tournaments_played || 0;
        this.tournaments_won = stats.tournaments_won || 0;
        this.ai_played = stats.ai_played || 0;
        this.ai_won = stats.ai_won || 0;

        this.matches= stats.matches || 0;
        this.win_rate= stats.win_rate || 0;
        this.current_streak= stats.current_streak || 0;
        this.best_streak= stats.best_streak || 0;
        this.total_wins = stats.total_wins || 0;
    }

    // --- LOCAL ---
    get local_played() { return this._local_played; }
    set local_played(value) { 
        if (value < 0) return; // Validación básica
        this._local_played = value; 
    }

    get local_won() { return this._local_won; }
    set local_won(value) { 
        if (value < 0) return;
        this._local_won = value; 
    }

    // --- ONLINE ---
    get online_played() { return this._online_played; }
    set online_played(value) { 
        if (value < 0) return;
        this._online_played = value; 
    }

    get online_won() { return this._online_won; }
    set online_won(value) { 
        if (value < 0) return;
        this._online_won = value; 
    }

    // --- TOURNAMENTS ---
    get tournaments_played() { return this._tournaments_played; }
    set tournaments_played(value) { 
        if (value < 0) return;
        this._tournaments_played = value; 
    }

    get tournaments_won() { return this._tournaments_won; }
    set tournaments_won(value) { 
        if (value < 0) return;
        this._tournaments_won = value; 
    }

    // --- AI ---
    get ai_played() { return this._ai_played; }
    set ai_played(value) { 
        if (value < 0) return;
        this._ai_played = value; 
    }

    get ai_won() { return this._ai_won; }
    set ai_won(value) { 
        if (value < 0) return;
        this._ai_won = value; 
    }

    // --- GENERAL STATS ---

    get matches() { return this._matches; }
    set matches(value) { 
        if (value < 0) return;
        this._matches = value; 
    }

    get win_rate() { return this._win_rate; }
    set win_rate(value) { 
        if (value < 0) return;
        this._win_rate = value; 
    }

    get current_streak() { return this._current_streak; }
    set current_streak(value) { 
        if (value < 0) return;
        this._current_streak = value; 
    }

    get best_streak() { return this._best_streak; }
    set best_streak(value) { 
        if (value < 0) return;
        this._best_streak = value; 
    }

    get total_wins() { return this._total_wins; }
    set total_wins(value) { 
        if (value < 0) return;
        this._total_wins = value; 
    }

}

module.exports = UserStats;