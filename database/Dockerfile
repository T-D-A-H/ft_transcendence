FROM python:3.9-alpine

RUN apk add --no-cache sqlite && \
    pip install --no-cache-dir sqlite-web

WORKDIR /app

COPY database.sql /app/database.sql

COPY entrypoint-database.sh /usr/local/bin/entrypoint-database.sh
RUN chmod +x /usr/local/bin/entrypoint-database.sh

EXPOSE 8080

ENTRYPOINT ["/usr/local/bin/entrypoint-database.sh"]