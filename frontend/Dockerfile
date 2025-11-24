FROM nginx:alpine

COPY package*.json ./

# Instalar dependencias para compilar TypeScript
RUN apk add --update nodejs npm && \
    npm install && \
    npm install -D typescript && \
    npm install -D -g tailwindcss && \
    npm install -D -g postcss && \
    npm install -D -g autoprefixer

# Copiar todo el proyecto
COPY . /app/

# Compilar TypeScript
RUN cd /app/game && npx tsc

# Ejecutar tailwindcss para convertir a css con flag --minify que comprime el texto css
RUN cd /app/game && npx tailwindcss -i ./styles/input.css -o ./styles/tailwind.css --minify 

# Copiar configuración nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Borrar archivo temporal
RUN cd /app && rm ./game/styles/input.css

# Mover solo lo necesario a la carpeta de nginx
RUN cp -r /app/* /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]