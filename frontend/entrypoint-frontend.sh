#!/bin/sh
set -e

echo "Recompiling frontend..."


SRC_DIR="/app/game"
BUILD_DIR="$SRC_DIR/public"
NGINX_ROOT="/usr/share/nginx/html"
NGINX_GAME_DIR="$NGINX_ROOT/game"

cd "$SRC_DIR"

rm -rf "$BUILD_DIR"


npx tsc --outDir "$BUILD_DIR"


npx tailwindcss -i ./styles/input.css -o ./styles/tailwind.css --minify


rm -rf "$NGINX_GAME_DIR"/*
mkdir -p "$NGINX_GAME_DIR"


cp index.html "$NGINX_GAME_DIR/index.html"
[ -d "$BUILD_DIR" ] && cp -r "$BUILD_DIR" "$NGINX_GAME_DIR/public/"
[ -d styles ] && cp -r styles "$NGINX_GAME_DIR/"
[ -d assets ] && cp -r assets "$NGINX_GAME_DIR/"

rm -rf "$BUILD_DIR"

echo "Frontend recompiled successfully."