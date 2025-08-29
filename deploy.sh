#!/bin/bash

echo "🚀 Déploiement Trouve Ta Table sur VPS 31.97.155.246"
echo "=================================================="

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Installation..."
    sudo apt update
    sudo apt install -y docker.io docker-compose-plugin
    sudo usermod -aG docker $USER
    echo "✅ Docker installé. Redémarrez votre session SSH."
    exit 1
fi

# Arrêter les anciens conteneurs s'ils existent
echo "🛑 Arrêt des anciens conteneurs..."
docker compose down -v 2>/dev/null || true

# Nettoyer Docker
echo "🧹 Nettoyage Docker..."
docker system prune -f

# Construire et démarrer les conteneurs
echo "🏗️ Construction et démarrage des conteneurs..."
docker compose -f docker-compose.yml --env-file .env.docker.production up --build -d

# Attendre que l'API soit prête
echo "⏳ Attente du démarrage de l'API..."
sleep 30

# Exécuter les migrations
echo "📊 Exécution des migrations..."
docker compose exec -T api sh -c "node ace migration:run"

# Exécuter les seeds
echo "🌱 Ajout des données de test..."
docker compose exec -T api sh -c "node ace db:seed"

# Vérifier l'état des conteneurs
echo "🔍 État des conteneurs:"
docker compose ps

# Test de santé
echo "🩺 Test de santé..."
curl -f http://31.97.155.246:3333/health && echo "✅ API OK" || echo "❌ Problème API"

echo ""
echo "🎉 Déploiement terminé !"
echo "📱 Frontend: http://31.97.155.246"
echo "🔧 API: http://31.97.155.246:3333"
echo "🩺 Health: http://31.97.155.246:3333/health"
echo ""
