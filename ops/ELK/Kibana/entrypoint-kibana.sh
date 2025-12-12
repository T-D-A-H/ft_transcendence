#!/bin/bash
set -eu

echo "Waiting for Elasticsearch to be ready..."
while ! curl -s http://elasticsearch:9200/_cluster/health > /dev/null 2>&1; do
    sleep 2
done

echo "Starting Kibana..."

# Kibana config
cat > ${KIBANA_HOME}/config/kibana.yml <<EOF
server.host: "0.0.0.0"
server.port: 5601
server.name: "ft-kibana"
elasticsearch.hosts: ["http://elasticsearch:9200"]
monitoring.ui.container.elasticsearch.enabled: true
path.data: /app/data
EOF

exec ${KIBANA_HOME}/bin/kibana
