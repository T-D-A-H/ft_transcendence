FROM alpine:3.18

ENV ES_VERSION=8.9.0
ENV ES_HOME=/app/elasticsearch
ENV ES_JAVA_HOME=/usr/lib/jvm/java-17-openjdk

RUN apk add --no-cache openjdk17-jre bash curl && \
    addgroup -S elasticsearch && \
    adduser -S -G elasticsearch elasticsearch && \
    mkdir -p ${ES_HOME} /app/data /app/logs && \
    cd /tmp && \
    curl -L -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-${ES_VERSION}-linux-x86_64.tar.gz && \
    tar -xzf elasticsearch-${ES_VERSION}-linux-x86_64.tar.gz -C ${ES_HOME} --strip-components=1 && \
    rm elasticsearch-${ES_VERSION}-linux-x86_64.tar.gz && \
    chown -R elasticsearch:elasticsearch /app

WORKDIR /app

COPY entrypoint-elasticsearch.sh /app/entrypoint-elasticsearch.sh
RUN chmod +x /app/entrypoint-elasticsearch.sh

USER elasticsearch

EXPOSE 9200 9300

ENTRYPOINT ["/app/entrypoint-elasticsearch.sh"] 