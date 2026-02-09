# ELK Stack Configuration

---

## Current Setup (Development Mode)

**Security Status: DISABLED**

This ELK stack is configured for development with X-Pack security disabled for simplicity.

### Configuration Details

- **Elasticsearch**: HTTP without authentication (`xpack.security.enabled: false`)
- **Kibana**: Direct connection to Elasticsearch without authentication
- **Logstash**: Basic log processing and forwarding

### Access Points

- **Kibana**: http://localhost:5601 (no authentication required)
- **Elasticsearch**: http://localhost:9200 (no authentication required)
- **Logstash HTTP**: http://localhost:8080

### Network Configuration

Services are accessible on localhost for development purposes.

---

## Usage

1. Start the stack: `make elk-init`
2. Access Kibana at http://localhost:5601
3. Create a data view in Kibana
4. Add logs to `ops/ELK/Logstash/logs/`
5. View logs in Kibana Discover
