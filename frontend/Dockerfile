FROM node:18-slim

WORKDIR /app

# Copiar package.json primero para cachear dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY . .

# Exponer puerto para el servidor de desarrollo
EXPOSE 4000

# Comando para servir archivos estáticos
CMD ["npx", "http-server", ".", "-p", "4000", "-c-1"]

