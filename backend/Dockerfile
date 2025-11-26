FROM node:18-alpine

WORKDIR /app

# Instalar SQLite
RUN apk add --no-cache sqlite

COPY package*.json ./
RUN npm install fastify sqlite3 @fastify/websocket bcryptjs

COPY . .

# Copiar el archivo SQL de semilla
COPY .database.sql /app/.database.sql

# Crear directorio /data y base de datos si no existe
RUN mkdir -p /data && \
    if [ ! -f /data/database.sqlite ]; then \
        echo "Creando base de datos desde .database.sql..." && \
        sqlite3 /data/database.sqlite < /app/.database.sql; \
    fi

EXPOSE 3000

CMD ["node", "src/server.js"]