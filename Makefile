# ----------------------------------------------------------

D_COMPOSE     = docker compose
D_VOLUME      = docker volume
D_EXEC        = docker exec
D_SYSTEM      = docker system
D_STOP        = docker compose stop
D_RUN		  = docker run
DETTACHED     = -d
REMOVE_ORPH   = --remove-orphans
NO_CACHE      = --no-cache

# ----------------------------------------------------------

BACK_SERVICE      = backend
BACK_CONTAINER    = ft_backend

DB_BACK_VOLUME    = ft_transcendence_db_data:/data

DATABASE_SERVICE   = database
DATABASE_CONTAINER = ft_database

FRONT_SERVICE     = frontend
FRONT_CONTAINER   = ft_frontend
FRONT_SCRIPT      = /usr/local/bin/entrypoint-frontend.sh

NGINX_SERVICE     = nginx
NGINX_CONTAINER   = ft_nginx

# ----------------------------------------------------------

all: build up

build: # Construir imagenes y borrar huerfanos
	$(D_COMPOSE) build $(NO_CACHE)

up: # Ejecutar contenedores dettached
	$(D_COMPOSE) up $(DETTACHED) $(REMOVE_ORPH)
	$(D_EXEC) $(DETTACHED) $(FRONT_CONTAINER) sh $(FRONT_SCRIPT)

up-logs:  # Ejecutar contenedores con LOGS
	$(D_COMPOSE) up $(REMOVE_ORPH)

down: #Tirar contenedores y borrar volumenes
	$(D_COMPOSE) down -v --remove-orphans

fclean: down #Borrar builds antiguos y borrar volumenes
	$(D_SYSTEM) prune -a -f --volumes

re: fclean all

# ----------------------------------------------------------

rf: # refresca el frontend por si hay cambios en src/
	$(D_COMPOSE) up $(DETTACHED) $(FRONT_SERVICE)
	$(D_EXEC) $(FRONT_CONTAINER) sh $(FRONT_SCRIPT)

rn:
	$(D_COMPOSE) restart $(NGINX_SERVICE)

rfn: rf rn

rb: # refresca el backend nodejs server por si hay cambios en src/
	$(D_COMPOSE) up $(DETTACHED) $(BACK_SERVICE)
	$(D_COMPOSE) restart $(BACK_SERVICE)

rd: # resetea la base de datos a 0 sin construir imagen
	$(D_STOP) $(BACK_SERVICE) $(DATABASE_SERVICE)
	$(D_RUN) --rm -v $(DB_BACK_VOLUME) alpine sh -c 'rm -f /data/database.sqlite || true'
	$(D_COMPOSE) restart $(DATABASE_SERVICE) $(BACK_SERVICE)

rdb: rd rb

rall: rfn rd # Recompilar backend, database, frontend, nginx , borrar volumenes y ejecutar scripts

# ----------------------------------------------------------

logs: # ver LOGS
	$(D_COMPOSE) logs -f

vols: # Nombrar volumenes
	$(D_VOLUME) ls

enter-frontend: # Entrar contenedor frontend
	$(D_EXEC) -it $(FRONT_CONTAINER) sh

enter-backend: # Entrar contenedor backend
	$(D_EXEC) -it $(BACK_CONTAINER) sh

enter-nginx: # Entrar contenedor nginx
	$(D_EXEC) -it $(NGINX_CONTAINER) sh

enter-database:  # Entrar contenedor database
	$(D_EXEC) -it $(DATABASE_CONTAINER) sh

# ----------------------------------------------------------