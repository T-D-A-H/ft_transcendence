const sqlite = require("sqlite3").verbose();

const DB_PATH = "/data/database.sqlite";
const db = new sqlite.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Error connecting to database:", err.message);
    } else {
        console.log("Connected to SQLite database successfully");
        db.get("SELECT name FROM sqlite_master WHERE type='table'", (err, row) => {
            if (err) {
                console.error("Error checking tables:", err.message);
            } else if (row) {
                console.log("Database tables are ready");
            } else {
                console.log("No tables found in database");
            }
        });
    }
});

module.exports = db;