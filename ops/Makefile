
# run devops modules
all: elk monitoring

# Check and setup .env file if needed
check-env:
	@if [ ! -f .env ]; then \
		echo "Creating .env from template..." && \
		cp ELK/.env.template .env && \
		echo ".env file created. Please review /ops/.env and customize if needed."; \
	else \
		echo ".env file exists at /ops/.env"; \
	fi

# Initialize and run ELK stack with template data (recommended first time)
elk-init: check-env
	@echo "Initializing ELK stack with templates..."
	@powershell -ExecutionPolicy Bypass -File ELK/init-elk.ps1

# Run ELK stack (Elasticsearch, Logstash, Kibana)
elk: check-env
	cd ELK && docker compose --env-file ../.env -f ELK.yaml up -d

# Run monitoring stack (Prometheus, Grafana)
monitoring: check-env
	cd monitoring && docker compose --env-file ../.env -f monitoring.yaml up -d

clean: clean-elk clean-monitoring

fclean: clean
	cd ELK && docker compose --env-file ../.env -f ELK.yaml down -v --rmi all
	cd monitoring && docker compose --env-file ../.env -f monitoring.yaml down -v --rmi all
	docker system prune -f

clean-elk:
	cd ELK && docker compose --env-file ../.env -f ELK.yaml down -v

clean-monitoring:
	cd monitoring && docker compose --env-file ../.env -f monitoring.yaml down -v

.PHONY: all elk elk-init monitoring clean fclean clean-elk clean-monitoring check-env
