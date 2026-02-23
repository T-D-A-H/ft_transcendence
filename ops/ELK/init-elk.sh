#!/bin/bash
# Initialize ELK stack
# This script starts the ELK stack in the correct order

set -e

echo "Initializing ELK stack"

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

# Clean up any existing containers
echo "Cleaning up existing ELK containers..."
cd "$(dirname "$0")"
docker compose --env-file ../.env -f ELK.yaml down -v 2>/dev/null || true

# Build all images first
echo "Building Docker images..."
docker compose --env-file ../.env -f ELK.yaml build

# Start Elasticsearch first

echo "Starting Elasticsearch"
docker compose --env-file ../.env -f ELK.yaml up -d elasticsearch

# Fix permissions for elasticsearch.yml automatically
echo "Fixing permissions for elasticsearch.yml..."
docker exec ft_elasticsearch chown elasticsearch:elasticsearch /usr/share/elasticsearch/config/elasticsearch.yml 2>/dev/null || true
docker exec ft_elasticsearch chmod 660 /usr/share/elasticsearch/config/elasticsearch.yml 2>/dev/null || true

# Wait for Elasticsearch to be ready (no max count)
echo "Waiting for Elasticsearch..."
ELASTICSEARCH_URL="http://localhost:9200"
until curl -sf "$ELASTICSEARCH_URL" > /dev/null 2>&1; do
    sleep 2
done
echo "Elasticsearch ready"

# Start Kibana and Logstash
echo "Starting Kibana and Logstash"
docker compose --env-file ../.env -f ELK.yaml up -d kibana logstash

echo "Waiting for Kibana"

KIBANA_URL="http://localhost:5601"
echo "Waiting for Kibana..."
until curl -s "$KIBANA_URL/api/status" > /dev/null 2>&1; do
    sleep 2
done
echo "Kibana ready"

# Create Kibana index pattern automatically using dedicated script
echo "Creating index pattern using create-index-pattern.sh"
chmod +x ./create-index-pattern.sh
bash ./create-index-pattern.sh

# Display status
echo ""
echo "ELK stack initialized"
echo ""
docker ps --filter "name=ft_elasticsearch" --filter "name=ft_kibana" --filter "name=ft_logstash" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Elasticsearch: http://localhost:9200"
echo "Kibana:        http://localhost:5601/app/discover"
echo "Logs directory: ops/ELK/Logstash/logs/"