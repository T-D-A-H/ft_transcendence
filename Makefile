
IMAGE_NAME=ft_transcendencer
CONTAINER_NAME=ft
PORT=3000


.PHONY: build run clean restart logs

build:
	docker build -t $(IMAGE_NAME) .

run: build
	-docker rm -f $(CONTAINER_NAME)
	docker run -it --rm --name $(CONTAINER_NAME) -p $(PORT):3000 $(IMAGE_NAME)

clean:
	-docker rm -f $(CONTAINER_NAME)

restart: clean run

logs:
	docker logs -f $(CONTAINER_NAME)
