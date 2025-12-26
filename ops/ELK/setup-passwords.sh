#!/bin/bash
# Script to set up Elasticsearch built-in user passwords after first start

set -e

echo "Waiting for Elasticsearch to be ready..."
until curl -s --cacert /usr/share/elasticsearch/config/certs/ca/ca.crt -u "elastic:changeme" https://localhost:9200 > /dev/null 2>&1; do
  sleep 5
  echo "Still waiting for Elasticsearch..."
done

echo "Elasticsearch is ready. Setting up built-in user passwords..."

# Reset passwords for built-in users (change 'changeme' to your desired password)
docker exec ft_elasticsearch /usr/share/elasticsearch/bin/elasticsearch-reset-password -u elastic -i <<EOF
changeme
changeme
EOF

docker exec ft_elasticsearch /usr/share/elasticsearch/bin/elasticsearch-reset-password -u kibana_system -i <<EOF
changeme
changeme
EOF

docker exec ft_elasticsearch /usr/share/elasticsearch/bin/elasticsearch-reset-password -u logstash_system -i <<EOF
changeme
changeme
EOF

echo ""
echo "Built-in user passwords configured!"
echo ""
echo "Default passwords (CHANGE THESE IN PRODUCTION):"
echo "  elastic:         changeme"
echo "  kibana_system:   changeme"
echo "  logstash_system: changeme"
echo ""
echo "You also need to create a 'logstash_writer' user with appropriate roles."
echo "Access Kibana at: https://localhost:5601"
echo "Login with: elastic / changeme"
