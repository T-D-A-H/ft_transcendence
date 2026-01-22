FROM nginx:alpine

# Copiar configuración Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Generar certificado autofirmado
RUN apk add --no-cache openssl \
    && openssl req -x509 -newkey rsa:4096 \
       -keyout /etc/ssl/private/key.pem \
       -out /etc/ssl/certs/cert.pem \
       -days 365 -nodes \
       -subj "/CN=localhost"

EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]