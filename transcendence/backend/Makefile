# Makefile for Transcendence project

# Variables
COMPOSE_FILE := docker-compose_backend.yml

# Targets
.PHONY: all build run fclean

all: build run

build:
	docker compose -f $(COMPOSE_FILE) build

run:
	docker compose -f $(COMPOSE_FILE) up

fclean:
	docker compose -f $(COMPOSE_FILE) down --rmi all -v
