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
COPY ./game /usr/share/nginx/html/game
COPY ./login /usr/share/nginx/html/login
COPY ./register /usr/share/nginx/html/register
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Compilar TypeScript
RUN cd /usr/share/nginx/html/game && npx tsc --outDir ./public
RUN cd /usr/share/nginx/html/login && npx tsc --outDir ./public
RUN cd /usr/share/nginx/html/register && npx tsc --outDir ./public

# Ejecutar tailwindcss para convertir a css con flag --minify que comprime el texto css
RUN cd game && npx tailwindcss -i ./styles/input.css -o ./styles/tailwind.css --minify 
# Borrar archivo temporal
RUN rm -f game/styles/input.css
# Borrar index preterminado de nginx
RUN rm -f /usr/share/nginx/html/index.html


EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]