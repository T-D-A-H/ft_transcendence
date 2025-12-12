FROM alpine:3.18

ENV LS_VERSION=8.9.0
ENV LS_HOME=/app/logstash
ENV LS_JAVA_HOME=/usr/lib/jvm/java-17-openjdk

RUN apk add --no-cache openjdk17-jre bash curl && \
    addgroup -S logstash && \
    adduser -S -G logstash logstash && \
    mkdir -p ${LS_HOME} /app/pipeline /app/config && \
    cd /tmp && \
    curl -L -O https://artifacts.elastic.co/downloads/logstash/logstash-${LS_VERSION}-linux-x86_64.tar.gz && \
    tar -xzf logstash-${LS_VERSION}-linux-x86_64.tar.gz -C ${LS_HOME} --strip-components=1 && \
    rm logstash-${LS_VERSION}-linux-x86_64.tar.gz && \
    chown -R logstash:logstash /app

WORKDIR /app

COPY entrypoint-logstash.sh /app/entrypoint-logstash.sh
RUN chmod +x /app/entrypoint-logstash.sh

USER logstash

EXPOSE 5000 9600

ENTRYPOINT ["/app/entrypoint-logstash.sh"]