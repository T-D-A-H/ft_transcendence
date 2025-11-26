const sqlite = require("sqlite3").verbose();
const fs = require("fs");

const DB_PATH = "/data/database.sqlite";
const db = new sqlite.Database(DB_PATH);

// Ejecutar SQL inicial si existe
if (fs.existsSync(DB_PATH)) {
  const sql = fs.readFileSync(DB_PATH, "utf8");
  db.exec(sql, (err) => {
    if (err) console.error("Seed SQL falló:", err);
    else console.log("Seed SQL cargado OK");
  });
}

module.exports = db;
