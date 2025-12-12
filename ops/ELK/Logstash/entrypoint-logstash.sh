#!/bin/bash
set -eu

echo "Waiting for Elasticsearch to be ready..."
while ! curl -s http://elasticsearch:9200/_cluster/health > /dev/null 2>&1; do
    sleep 2
done

echo "Starting Logstash..."

# Logstash config | Create default pipeline if does not exist
if [ ! -f /app/pipeline/logstash.conf ]; then
    echo "Creating default pipeline configuration..."
    cat > /app/pipeline/logstash.conf <<EOF
input {
  tcp {
    port => 5000
    codec => json
  }
}

output {
  elasticsearch {
    hosts => ["http://elasticsearch:9200"]
    index => "ft-transcendencer-%{+YYYY.MM.dd}"
  }
  stdout { codec => rubydebug }
}
EOF
fi

exec ${LS_HOME}/bin/logstash -f /app/pipeline/logstash.conf
