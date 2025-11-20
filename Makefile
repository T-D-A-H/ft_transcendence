.PHONY: build run clean restart logs down up dev

# Configuración para campus 42
DOCKER_RUNTIME?=docker
DOCKER_CONTEXT?=/sgoinfre/$(USER)/docker

# Establecer contexto de Docker si es necesario
# setup-runtime:
# 	@mkdir -p $(DOCKER_CONTEXT)
# 	@echo "Docker context: $(DOCKER_CONTEXT)"

# Comandos principales
build:
	$(DOCKER_RUNTIME)-compose build

up: build
	$(DOCKER_RUNTIME)-compose up -d

up-dev: build
	$(DOCKER_RUNTIME)-compose up

down:
	$(DOCKER_RUNTIME)-compose down

clean:
	$(DOCKER_RUNTIME)-compose down -v
	$(DOCKER_RUNTIME) system prune -f

# Solo reinicia, no reconstruye
restart: down up

logs:
	$(DOCKER_RUNTIME)-compose logs -f

rf:
	$(DOCKER_RUNTIME)-compose build --no-cache frontend
	$(DOCKER_RUNTIME)-compose up -d --force-recreate frontend

# Rebuild solo backend  
rb:
	$(DOCKER_RUNTIME)-compose build --no-cache backend
	$(DOCKER_RUNTIME)-compose up -d --force-recreate backend

rall: rf rb # Cuando cambias frontend + backend

# Comandos de desarrollo (sin Docker)
dev-backend:
	cd backend && npm start

dev-frontend:
	cd frontend && npx http-server src/public -p 4000

# Cuando cambias configuraciones globales
rebuild:
	$(DOCKER_RUNTIME)-compose build --no-cache
	$(DOCKER_RUNTIME)-compose up -d