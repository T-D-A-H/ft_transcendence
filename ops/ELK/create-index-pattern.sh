#!/bin/bash
# Create Kibana Index Pattern for Logstash logs
# This script can be run at any time to create/recreate the index pattern

set -e

KIBANA_URL="http://localhost:5601"

echo "Creating Kibana index pattern"

# Check if Kibana is running and ready
echo "Waiting for Kibana..."
MAX_ATTEMPTS=60
ATTEMPT=0

while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
    STATUS=$(curl -s "$KIBANA_URL/api/status" 2>/dev/null | grep -o '"state":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ "$STATUS" = "green" ]; then
        echo "Kibana ready"
        break
    elif [ -n "$STATUS" ]; then
        echo "Kibana status: $STATUS ($ATTEMPT/$MAX_ATTEMPTS)"
    else
        echo "Waiting for Kibana response ($ATTEMPT/$MAX_ATTEMPTS)"
    fi
    ATTEMPT=$((ATTEMPT + 1))
    sleep 2
done

if [ $ATTEMPT -eq $MAX_ATTEMPTS ]; then
    echo "Warning: Kibana timeout, attempting index pattern creation"
fi

# Check if Elasticsearch has data
INDEX_COUNT=$(curl -s "http://localhost:9200/_cat/indices/logstash-*?h=index" 2>/dev/null | wc -l)

if [ "$INDEX_COUNT" -eq 0 ]; then
    echo "No logstash indices found (logs not yet ingested)"
else
    echo "Found $INDEX_COUNT logstash index(es)"
fi

# Create index pattern using Kibana 7.x saved_objects API
echo "Creating index pattern logstash-*"

# For Kibana 7.x, use the saved_objects API with index-pattern type
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$KIBANA_URL/api/saved_objects/index-pattern/logstash-*" \
  -H 'kbn-xsrf: true' \
  -H 'Content-Type: application/json' \
  -d '{
    "attributes": {
      "title": "logstash-*",
      "timeFieldName": "@timestamp"
    }
  }' 2>/dev/null)

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
    echo "Index pattern created (ID: logstash-*, @timestamp)"
elif [ "$HTTP_CODE" = "409" ]; then
    echo "Index pattern already exists (ID: logstash-*, @timestamp)"
else
    if echo "$BODY" | grep -q "Conflict"; then
        echo "Index pattern already exists"
    else
        echo "Warning: HTTP $HTTP_CODE - index pattern may exist or will be auto-created"
    fi
fi
