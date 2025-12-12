#!/bin/bash

set -e

# Load .env data
if [ -f /ops/.env ]; then
    echo "Loading environment variables from /ops/.env"
    export $(grep -v '^#' /ops/.env | xargs)
fi

# Set default values
GRAFANA_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
GRAFANA_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
PROMETHEUS_PORT=${PROMETHEUS_PORT:-9090}
GRAFANA_PORT=${GRAFANA_PORT:-3001}

echo "Starting monitoring services..."

# Prometheus config
if [ ! -f /app/prometheus/prometheus.yml ]; then
    cat > /app/prometheus/prometheus.yml <<EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'backend'
    static_configs:
      - targets: ['backend:3000']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF
fi

# Start Prometheus on 9000
echo "Starting Prometheus on port 9090..."
/app/prometheus/prometheus \
    --config.file=/app/prometheus/prometheus.yml \
    --storage.tsdb.path=/app/data/prometheus \
    --web.console.libraries=/app/prometheus/console_libraries \
    --web.console.templates=/app/prometheus/consoles \
    --web.enable-lifecycle &

PROMETHEUS_PID=$!

sleep 5

# Grafana config
mkdir -p /app/grafana/conf

cat > /app/grafana/conf/defaults.ini <<EOF
[server]
http_port = ${GRAFANA_PORT}
protocol = http

[paths]
data = /app/data/grafana
logs = /app/logs
plugins = /app/grafana/plugins
provisioning = /app/grafana/provisioning

[analytics]
reporting_enabled = false

[security]
admin_user = ${GRAFANA_ADMIN_USER}
admin_password = ${GRAFANA_ADMIN_PASSWORD}
EOF

# Create Grafana directories
mkdir -p /app/grafana/provisioning/datasources
mkdir -p /app/grafana/provisioning/dashboards

# Create Prometheus datasource
cat > /app/grafana/provisioning/datasources/prometheus.yml <<EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://localhost:${PROMETHEUS_PORT}
    isDefault: true
    editable: true
EOF

# Start Grafana
echo "Starting Grafana on port ${GRAFANA_PORT}..."
/app/grafana/bin/grafana-server \
    --homepath=/app/grafana \
    --config=/app/grafana/conf/defaults.ini &

GRAFANA_PID=$!

echo "Monitoring services started!"
echo "Prometheus: http://localhost:${PROMETHEUS_PORT}"
echo "Grafana: http://localhost:${GRAFANA_PORT} (${GRAFANA_ADMIN_USER}/${GRAFANA_ADMIN_PASSWORD})"

wait $PROMETHEUS_PID $GRAFANA_PID
