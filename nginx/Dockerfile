FROM nginx:alpine

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx leerá los archivos desde /usr/share/nginx/html, que estará montado como volumen

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]