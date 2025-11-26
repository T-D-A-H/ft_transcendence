DOCKER_RUNTIME?=docker
NO_CACHE=--no-cache

RED   := \033[0;31m
BLUE  := \033[0;34m
GREEN := \033[0;32m
NC    := \033[0m


all: # Crear contenedores y levantar
	$(DOCKER_RUNTIME)-compose build $(NO_CACHE)
	$(DOCKER_RUNTIME)-compose up -d


build: #Crear contenedores
	$(DOCKER_RUNTIME)-compose build $(NO_CACHE)


up: # Levantar - dettached
	$(DOCKER_RUNTIME)-compose up -d


up-logs: build # Levantar - attached
	$(DOCKER_RUNTIME)-compose up


down: # Parar contenedores
	$(DOCKER_RUNTIME)-compose down --remove-orphans
# 	docker volume rm ft_transcendencer_db_data
# 	docker volume rm ft_transcendencer_front_build

fclean: down # Parar contenedores y eliminar objetos
	$(DOCKER_RUNTIME) system prune -f

re: fclean all # Parar contenedores, eliminar objetos, Crear contenedores, Levantarlos

logs: # ver LOGS
	$(DOCKER_RUNTIME)-compose logs -f


rf: # restartea solo el frontend
	$(DOCKER_RUNTIME)-compose build $(NO_CACHE) frontend
	$(DOCKER_RUNTIME)-compose up -d --force-recreate frontend


rb: # restartea solo el backend
	$(DOCKER_RUNTIME)-compose build $(NO_CACHE) backend
	$(DOCKER_RUNTIME)-compose up -d --force-recreate backend

rdb: # restartea solo el data base
	$(DOCKER_RUNTIME)-compose build $(NO_CACHE) database
	$(DOCKER_RUNTIME)-compose up -d --force-recreate database

rn: # restartea solo el data base
	$(DOCKER_RUNTIME)-compose build $(NO_CACHE) nginx
	$(DOCKER_RUNTIME)-compose up -d --force-recreate nginx

rfn:
	docker stop ft_nginx ft_frontend
	docker rm ft_nginx ft_frontend
	docker volume rm ft_transcendencer_front_build
	make rf
	make rn

rbd:
	docker stop ft_database ft_backend
	docker rm ft_database ft_backend
	docker volume rm ft_transcendencer_db_data
	make rb
	make rdb

rall: rf rb rdb rn # restartea el frontend y backend

enter-backend: # Meterse a contenedor backend
	docker exec -it ft_backend bash

enter-frontend: # Meterse a contenedor frontend
	docker exec -it ft_frontend bash

vols:
	docker volume ls  

rebuild: # Reconstruye todo - Cuando cambias configuraciones globales
	$(DOCKER_RUNTIME)-compose build $(NO_CACHE)
	$(DOCKER_RUNTIME)-compose up -d

status:
	@services=$$(docker compose ps --format '{{.Service}} {{.State}}') ; \
	if [ -z "$$services" ]; then \
		printf "[+] ${RED}Running 0/0${NC}\n"; \
	else \
		total=$$(echo "$$services" | wc -l) ; \
		running=$$(echo "$$services" | grep -c 'running') ; \
		printf "[+] ${BLUE}Running %s/%s${NC}\n" "$$running" "$$total" ; \
		echo "$$services" | while read svc state ; do \
			if [ "$$state" = "running" ]; then \
				printf " ${GREEN}✔${NC} Container %-15s ${GREEN}Running${NC}\n" "$$svc" ; \
			else \
				printf " ${RED}✘${NC} Container %-15s %s\n" "$$svc" "$$state" ; \
			fi ; \
		done \
	fi

.PHONY: all build up up-logs status down fclean re logs rf \
	rb rall enter-backend enter-fronted rebuild
