const sqlite = require("sqlite3").verbose();
const LOGGER = require("./LOGGER.js");

const DB_PATH = "/data/database.sqlite";
const db = new sqlite.Database(DB_PATH, (err) => {

    if (err) {
        LOGGER(502, "DataBase", "sqlite", "Error connecting to database: " + err.message);
        console.error("Error connecting to database:", err.message);
    }
    else {

        LOGGER(200, "DataBase", "sqlite", "Connected to SQLite database successfully");
        db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
            if (err) {

                LOGGER(502, "DataBase", "sqlite", "Error checking tables");
                console.error("Error checking tables:", err.message);
            } else if (row) {

                LOGGER(200, "DataBase", "sqlite", "Database tables are ready");
            } else {

                LOGGER(502, "DataBase", "sqlite", "No tables found in database");
            }
        });
    }
});

module.exports = db;