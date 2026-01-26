#!/bin/bash

set -e

CERTS_DIR="$(cd "$(dirname "$0")" && pwd)"
CA_DIR="$CERTS_DIR/ca"
ES_DIR="$CERTS_DIR/elasticsearch"
KIBANA_DIR="$CERTS_DIR/kibana"
LOGSTASH_DIR="$CERTS_DIR/logstash"

echo "Generating certificates in: $CERTS_DIR"

echo "1. Generating CA certificate..."
openssl genrsa -out "$CA_DIR/ca.key" 4096
openssl req -new -x509 -days 3650 -key "$CA_DIR/ca.key" -out "$CA_DIR/ca.crt" \
  -subj "/C=US/ST=State/L=City/O=Organization/OU=IT/CN=Elastic-CA"

chmod 600 "$CA_DIR/ca.key"
chmod 644 "$CA_DIR/ca.crt"

echo "2. Generating Elasticsearch certificate..."
openssl genrsa -out "$ES_DIR/elasticsearch.key" 2048

cat > "$ES_DIR/elasticsearch.cnf" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
OU = IT
CN = elasticsearch

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = elasticsearch
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

openssl req -new -key "$ES_DIR/elasticsearch.key" -out "$ES_DIR/elasticsearch.csr" \
  -config "$ES_DIR/elasticsearch.cnf"

openssl x509 -req -days 3650 \
  -in "$ES_DIR/elasticsearch.csr" \
  -CA "$CA_DIR/ca.crt" \
  -CAkey "$CA_DIR/ca.key" \
  -CAcreateserial \
  -out "$ES_DIR/elasticsearch.crt" \
  -extensions v3_req \
  -extfile "$ES_DIR/elasticsearch.cnf"

chmod 600 "$ES_DIR/elasticsearch.key"
chmod 644 "$ES_DIR/elasticsearch.crt"
rm "$ES_DIR/elasticsearch.csr" "$ES_DIR/elasticsearch.cnf"

echo "3. Generating Kibana certificate..."
openssl genrsa -out "$KIBANA_DIR/kibana.key" 2048

cat > "$KIBANA_DIR/kibana.cnf" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
OU = IT
CN = kibana

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = kibana
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

openssl req -new -key "$KIBANA_DIR/kibana.key" -out "$KIBANA_DIR/kibana.csr" \
  -config "$KIBANA_DIR/kibana.cnf"

openssl x509 -req -days 3650 \
  -in "$KIBANA_DIR/kibana.csr" \
  -CA "$CA_DIR/ca.crt" \
  -CAkey "$CA_DIR/ca.key" \
  -CAcreateserial \
  -out "$KIBANA_DIR/kibana.crt" \
  -extensions v3_req \
  -extfile "$KIBANA_DIR/kibana.cnf"

chmod 600 "$KIBANA_DIR/kibana.key"
chmod 644 "$KIBANA_DIR/kibana.crt"
rm "$KIBANA_DIR/kibana.csr" "$KIBANA_DIR/kibana.cnf"

echo "4. Generating Logstash certificate..."
openssl genrsa -out "$LOGSTASH_DIR/logstash.key" 2048

cat > "$LOGSTASH_DIR/logstash.cnf" <<EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
OU = IT
CN = logstash

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = logstash
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF

openssl req -new -key "$LOGSTASH_DIR/logstash.key" -out "$LOGSTASH_DIR/logstash.csr" \
  -config "$LOGSTASH_DIR/logstash.cnf"

openssl x509 -req -days 3650 \
  -in "$LOGSTASH_DIR/logstash.csr" \
  -CA "$CA_DIR/ca.crt" \
  -CAkey "$CA_DIR/ca.key" \
  -CAcreateserial \
  -out "$LOGSTASH_DIR/logstash.crt" \
  -extensions v3_req \
  -extfile "$LOGSTASH_DIR/logstash.cnf"

chmod 600 "$LOGSTASH_DIR/logstash.key"
chmod 644 "$LOGSTASH_DIR/logstash.crt"
rm "$LOGSTASH_DIR/logstash.csr" "$LOGSTASH_DIR/logstash.cnf"

echo ""
echo "✓ Certificate generation complete!"
echo ""
echo "Generated files:"
echo "  CA:             $CA_DIR/ca.crt (public), $CA_DIR/ca.key (private)"
echo "  Elasticsearch:  $ES_DIR/elasticsearch.crt, $ES_DIR/elasticsearch.key"
echo "  Kibana:         $KIBANA_DIR/kibana.crt, $KIBANA_DIR/kibana.key"
echo "  Logstash:       $LOGSTASH_DIR/logstash.crt, $LOGSTASH_DIR/logstash.key"
echo ""
echo "IMPORTANT: Keep *.key files secure and private!"
