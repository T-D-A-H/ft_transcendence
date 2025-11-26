FROM python:3.9-alpine

# Instalar dependencias y sqlite-web
RUN apk add --no-cache sqlite && \
    pip install --no-cache-dir sqlite-web

WORKDIR /data

# Exponer puerto para sqlite-web
EXPOSE 8080

# Comando para ejecutar sqlite-web con la base de datos compartida
CMD ["sqlite_web", "/data/database.sqlite", "-H", "0.0.0.0", "-p", "8080", "--read-only"]