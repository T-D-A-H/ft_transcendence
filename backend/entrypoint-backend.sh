#!/bin/sh
set -eu

DB_FILE="/data/database.sqlite"

echo "Waiting for database to be initialized..."
while [ ! -f "$DB_FILE" ]; do
    sleep 1
done

echo "Starting backend server..."
exec node src/server.js