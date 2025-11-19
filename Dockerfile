FROM node:18-slim

WORKDIR /app

# Copiamos package.json y package-lock.json
COPY package*.json ./

# Instalar TODO (backend depende de Swagger)
RUN npm install && npm install @fastify/websocket

# Copiamos el resto del proyecto
COPY . .

EXPOSE 3000

CMD ["npm", "start"]
