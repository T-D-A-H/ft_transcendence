#!/bin/sh
set -eu

DB_FILE="/data/database.sqlite"
SQL_SEED="/app/database.sql"

mkdir -p /data

if [ ! -f "$DB_FILE" ]; then
    echo "Initializing SQLite database from database.sql..."
    sqlite3 "$DB_FILE" < "$SQL_SEED"
fi

echo "Starting sqlite-web..."
exec sqlite_web "$DB_FILE" -H 0.0.0.0 -p 8080 --read-only