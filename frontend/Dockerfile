FROM node:18-alpine

WORKDIR /app

# Copiar package.json y dependencias
COPY package*.json ./
RUN npm install
RUN npm install -D typescript tailwindcss postcss autoprefixer

# Copiar el proyecto completo
COPY . .

# Compilar TypeScript para cada proyecto
RUN cd game && npx tsc --outDir ./public
RUN cd login && npx tsc --outDir ./public  
RUN cd register && npx tsc --outDir ./public

# Compilar Tailwind para game 
RUN cd game && npx tailwindcss -i ./styles/input.css -o ./styles/tailwind.css --minify;

# CREAR ESTRUCTURA CORRECTA PARA NGINX
RUN mkdir -p /app/dist && \
    # Crear subdirectorios para cada aplicación
    mkdir -p /app/dist/game /app/dist/login /app/dist/register && \
    # Copy Html
    cp game/index.html /app/dist/game/index.html && \
    cp login/login.html /app/dist/login/login.html && \ 
    cp register/register.html /app/dist/register/register.html && \ 
    # Copy Ts
    cp -r game/public /app/dist/game/public/ && \
    cp -r login/public /app/dist/login/public/ && \
    cp -r register/public /app/dist/register/public/ && \
    # Copy assets
    cp -r game/styles /app/dist/game/ && \
    cp -r game/assets /app/dist/game/

# El contenedor se queda en pausa
CMD ["tail", "-f", "/dev/null"]