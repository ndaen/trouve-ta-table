#!make
.PHONY: help dev prod down logs clean migrate seed setup-dev

# Variables
include .env.docker
export


help: ## Afficher l'aide
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $1, $2}'

down: ## Arrêter tous les conteneurs
	docker compose down

down-v: ## Arrêter et supprimer les volumes
	docker compose down -v

logs: ## Voir tous les logs
	docker compose logs -f

logs-api: ## Voir les logs de l'API
	docker compose logs -f api

logs-web: ## Voir les logs du frontend
	docker compose logs -f web

logs-db: ## Voir les logs de la base de données
	docker compose logs -f postgres

clean: ## Nettoyer Docker (images, conteneurs non utilisés)
	docker system prune -f
	docker volume prune -f

shell-api: ## Shell dans le conteneur API
	docker compose exec api sh -c "cd packages/ttt-api && sh"

run-migrations: ## Exécuter les migrations de la base de données
	docker compose exec api sh -c "cd packages/ttt-api && node ace migration:run"

run-seeder: ## Exécuter les seeders de la base de données
	docker compose exec api sh -c "cd packages/ttt-api && node ace db:seed"

shell-db: ## Shell dans PostgreSQL
	POSTGRES_USER = env | grep POSTGRES_USER | cut -d'=' -f2
	POSTGRES_DB = env | grep POSTGRES_DB | cut -d'=' -f2
	docker compose exec postgres psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

backup-db: ## Sauvegarder la base de données
	POSTGRES_USER = env | grep POSTGRES_USER | cut -d'=' -f2
	POSTGRES_DB = env | grep POSTGRES_DB | cut -d'=' -f2
	docker compose exec postgres pg_dump -U $(POSTGRES_USER) $(POSTGRES_DB) > backup_$(shell date +%Y%m%d_%H%M%S).sql

status: ## Voir le statut des conteneurs
	docker compose ps