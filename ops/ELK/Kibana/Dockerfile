FROM alpine:3.18

ENV KIBANA_VERSION=8.9.0
ENV KIBANA_HOME=/app/kibana

RUN apk add --no-cache nodejs npm bash curl && \
    addgroup -S kibana && \
    adduser -S -G kibana kibana && \
    mkdir -p ${KIBANA_HOME} /app/data && \
    cd /tmp && \
    curl -L -O https://artifacts.elastic.co/downloads/kibana/kibana-${KIBANA_VERSION}-linux-x86_64.tar.gz && \
    tar -xzf kibana-${KIBANA_VERSION}-linux-x86_64.tar.gz -C ${KIBANA_HOME} --strip-components=1 && \
    rm kibana-${KIBANA_VERSION}-linux-x86_64.tar.gz && \
    chown -R kibana:kibana /app

WORKDIR /app

COPY entrypoint-kibana.sh /app/entrypoint-kibana.sh
RUN chmod +x /app/entrypoint-kibana.sh

USER kibana

EXPOSE 5601

ENTRYPOINT ["/app/entrypoint-kibana.sh"]