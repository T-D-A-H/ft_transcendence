FROM node:18-slim

WORKDIR /app

COPY . .

RUN npm install && npm install @fastify/websocket

# Mantener como root para evitar problemas de permisos
USER root

EXPOSE 3000

CMD ["npm", "start"]