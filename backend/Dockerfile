FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache sqlite

COPY package*.json ./
RUN npm install fastify sqlite3 @fastify/websocket bcryptjs fastify-jwt nodemailer

COPY . .

COPY entrypoint-backend.sh /app/entrypoint-backend.sh
RUN chmod +x /app/entrypoint-backend.sh

EXPOSE 3000

ENTRYPOINT ["/app/entrypoint-backend.sh"]