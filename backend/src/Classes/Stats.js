const LOGGER = require("../LOGGER.js");

class Stats {
    constructor(stats = {}) {
        this.local_played = stats.local_played || 0;
        this.local_won = stats.local_won || 0;
        this.online_played = stats.online_played || 0;
        this.online_won = stats.online_won || 0;
        this.tournaments_played = stats.tournaments_played || 0;
        this.tournaments_won = stats.tournaments_won || 0;
        this.ai_played = stats.ai_played || 0;
        this.ai_won = stats.ai_won || 0;
    }

        

}