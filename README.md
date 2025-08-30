# 🍽️ Trouve Ta Table

> Plateforme moderne de gestion de tables et réservations

## 🚀 Déploiement Production (Railway)

1. Fork ce repo
2. Connectez à Railway
3. Ajoutez PostgreSQL
4. Variables d'env : `APP_KEY`, `JWT_SECRET`
5. Deploy automatique !

## 💻 Développement Local (Docker)

```bash
# Configuration
cp .env.docker.exemple .env.docker
# Éditer .env.docker avec tes valeurs

# Lancement
npm run docker:dev

# Voir les logs
npm run docker:logs

# Arrêter
npm run docker:down
```

## 🛠️ Stack

- **Backend**: AdonisJS + PostgreSQL + Redis
- **Frontend**: React + TypeScript + Vite
- **Dev**: Docker Compose
- **Prod**: Railway

## ⚙️ URLs Locales

- Frontend: http://localhost
- API: http://localhost:3333
- Base: localhost:5432
