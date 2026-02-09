#!/bin/bash
# Script to set up Elasticsearch built-in user passwords
# Run this if Elasticsearch is already running but passwords need to be reset

set -e

# Load environment variables from .env file
ENV_FILE="$(dirname "$0")/../.env"
if [ -f "$ENV_FILE" ]; then
    echo "Loading environment variables from .env..."
    while IFS= read -r line || [ -n "$line" ]; do
        # Remove carriage return (Windows line endings)
        line=$(echo "$line" | tr -d '\r')
        # Skip comments and empty lines
        if [[ ! "$line" =~ ^# && -n "$line" ]]; then
            export "$line"
        fi
    done < "$ENV_FILE"
else
    echo "ERROR: .env file not found at $ENV_FILE"
    exit 1
fi

# Check if Elasticsearch container is running
if ! docker ps --filter "name=ft_elasticsearch" --filter "status=running" --format "{{.Names}}" | grep -q ft_elasticsearch; then
    echo "ERROR: Elasticsearch container is not running"
    echo "Start it with: cd ops/ELK && docker compose --env-file ../.env -f ELK.yaml up -d elasticsearch"
    exit 1
fi

# Wait for Elasticsearch to be ready
echo "Waiting for Elasticsearch"
MAX_ATTEMPTS=30
attempt=0
elasticsearch_ready=false

while [ $attempt -lt $MAX_ATTEMPTS ]; do
    if curl -s -u "elastic:$ELASTIC_PASSWORD" http://localhost:9200/_cluster/health >/dev/null 2>&1; then
        elasticsearch_ready=true
        echo "Elasticsearch ready"
        break
    fi
    
    attempt=$((attempt + 1))
    echo "Attempt $attempt/$MAX_ATTEMPTS"
    sleep 2
done

if [ "$elasticsearch_ready" = false ]; then
    echo "ERROR: Elasticsearch is not responding"
    echo "Check logs with: docker logs ft_elasticsearch"
    exit 1
fi

# Set up built-in user passwords
echo "Setting up built-in user passwords"

# Use Elasticsearch API to set passwords
echo "Setting kibana_system password"
curl -s -X POST "http://localhost:9200/_security/user/kibana_system/_password" \
    -u "elastic:$ELASTIC_PASSWORD" \
    -H "Content-Type: application/json" \
    -d "{\"password\":\"$KIBANA_SYSTEM_PASSWORD\"}" >/dev/null

echo "Setting logstash_system password"
curl -s -X POST "http://localhost:9200/_security/user/logstash_system/_password" \
    -u "elastic:$ELASTIC_PASSWORD" \
    -H "Content-Type: application/json" \
    -d "{\"password\":\"$LOGSTASH_SYSTEM_PASSWORD\"}" >/dev/null
