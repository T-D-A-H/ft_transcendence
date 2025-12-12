FROM alpine:3.18

ENV PROMETHEUS_VERSION=2.48.0
ENV GRAFANA_VERSION=10.2.2
ENV PROMETHEUS_HOME=/app/prometheus
ENV GRAFANA_HOME=/app/grafana

RUN apk add --no-cache bash curl tar gzip libc6-compat && \
    addgroup -S monitoring && \
    adduser -S -G monitoring monitoring && \
    mkdir -p ${PROMETHEUS_HOME} ${GRAFANA_HOME} /app/data/prometheus /app/data/grafana /app/logs && \
    cd /tmp && \
    curl -L -O https://github.com/prometheus/prometheus/releases/download/v${PROMETHEUS_VERSION}/prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz && \
    tar -xzf prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz -C ${PROMETHEUS_HOME} --strip-components=1 && \
    rm prometheus-${PROMETHEUS_VERSION}.linux-amd64.tar.gz && \
    curl -L -O https://dl.grafana.com/oss/release/grafana-${GRAFANA_VERSION}.linux-amd64.tar.gz && \
    tar -xzf grafana-${GRAFANA_VERSION}.linux-amd64.tar.gz -C ${GRAFANA_HOME} --strip-components=1 && \
    rm grafana-${GRAFANA_VERSION}.linux-amd64.tar.gz && \
    chown -R monitoring:monitoring /app

WORKDIR /app

COPY entrypoint-monitoring.sh /app/entrypoint-monitoring.sh
RUN chmod +x /app/entrypoint-monitoring.sh

USER monitoring

EXPOSE 9090 3001

ENTRYPOINT ["/app/entrypoint-monitoring.sh"]
