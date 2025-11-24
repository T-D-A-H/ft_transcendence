FROM node:18-alpine

WORKDIR /app

# Instalar dependencias primero (mejor práctica)
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

RUN npm install @fastify/websocket

EXPOSE 3000

CMD ["npm", "start"]