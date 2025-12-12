#!/bin/bash
set -eu

echo "Starting Elasticsearch..."

# Set configuration
export ES_JAVA_OPTS="${ES_JAVA_OPTS:--Xms512m -Xmx512m}"

# Elasticsearch config
cat > ${ES_HOME}/config/elasticsearch.yml <<EOF
cluster.name: ft-transcendencer-cluster
node.name: ft-elasticsearch
network.host: 0.0.0.0
discovery.type: single-node
xpack.security.enabled: false
xpack.monitoring.collection.enabled: true
path.data: /app/data
path.logs: /app/logs
EOF

exec ${ES_HOME}/bin/elasticsearch
