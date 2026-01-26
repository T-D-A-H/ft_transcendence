
# run devops modules
all: elk monitoring

# Run ELK stack (Elasticsearch, Logstash, Kibana)
elk:
	cd ELK && docker compose -f ELK.yaml up -d

# Run monitoring stack (Prometheus, Grafana)
monitoring:
	cd monitoring && docker compose -f monitoring.yaml up -d

clean: clean-elk clean-monitoring

fclean: clean
	cd ELK && docker compose -f ELK.yaml down -v --rmi all
	cd monitoring && docker compose -f monitoring.yaml down -v --rmi all
	docker system prune -f

clean-elk:
	cd ELK && docker compose -f ELK.yaml down -v

clean-monitoring:
	cd monitoring && docker compose -f monitoring.yaml down -v

.PHONY: all elk monitoring clean fclean clean-elk clean-monitoring
