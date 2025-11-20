FROM node:18-slim

WORKDIR /app

# Copiar package.json primero para cachear dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install && npm install -g typescript

# Copiar código fuente
COPY . .

RUN npx tsc

# Exponer puerto para el servidor de desarrollo
EXPOSE 4000

# Comando para servir archivos estáticos
CMD ["npx", "http-server", ".", "-p", "4000", "-c-1"]


