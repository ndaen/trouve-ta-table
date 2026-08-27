# Trouve Ta Table 🍽️

> *Le plan de table pour votre mariage*

---

## 📖 À Propos du Projet

**Trouve Ta Table** est un outil de plan de table pour mariages. Un couple prépare
son plan (tables, invités, placement) avant le jour J.

### ✨ Fonctionnalités Principales
- 🔐 **Authentification par session** (cookie de session, `sessionGuard` AdonisJS)
- 🗂️ **Gestion de projets** : chaque compte gère ses propres projets de mariage
- 🪑 **Gestion des tables** : capacité, type d'événement
- 👥 **Gestion des invités** : ajout, édition, assignation aux tables
- 🛡️ **Autorisations centralisées** : un compte ne peut accéder qu'à ses propres
  projets, tables et invités (Bouncer policy)
- ✅ **Validation des données** côté API (VineJS)
- 🎟️ **Quota d'invités** par projet, appliqué côté serveur

---

## 🛠️ Stack Technique

### 🚀 **Backend (API)**
- 🟢 **AdonisJS 6** - Framework Node.js avec TypeScript
- 🐘 **PostgreSQL 16** - Base de données relationnelle
- 🍪 **Authentification par session** (cookie), via le `sessionGuard` d'AdonisJS
- 📊 **Lucid ORM** - Mapping objet-relationnel
- ✅ **VineJS** - Validation des données

### ⚛️ **Frontend (Web)**
- ⚛️ **React 19** - Interface utilisateur moderne
- 🔷 **TypeScript** - Typage statique robuste
- ⚡ **Vite** - Build tool ultra-rapide
- 🐻 **Zustand** - Gestion d'état légère
- 🛡️ **Zod** - Validation des schémas
- 🛣️ **React Router 8** - Routage côté client

### 🔧 **DevOps & Outils**
- 🐳 **Docker & Docker Compose** - Conteneurisation
- 🌐 **Nginx** - Serveur web (production)
- ✅ **ESLint** - Analyse statique du code
- 💎 **Prettier** - Formatage automatique

---

## 🚀 Installation et Configuration

### 📋 Prérequis

- 🟢 **Node.js** ≥ 18.x
- 🐳 **Docker** et **Docker Compose**
- 🔧 **Git**

---

### 1️⃣ Cloner le projet

```bash
git clone <repository-url>
cd trouve-ta-table
```

### 2️⃣ Configuration des variables d'environnement

```bash
cp packages/ttt-api/.env.example packages/ttt-api/.env
```

Pour le chemin Docker, un fichier `.env.docker` doit exister à la racine (voir
`.env.docker.exemple` pour la liste des variables attendues).

### 3️⃣ Installation avec Docker (🏆 Recommandé)

```bash
docker compose -f docker-compose.dev.yml --env-file .env.docker up -d
```

Cette commande démarre Postgres, attend qu'il soit en bonne santé, applique les
migrations automatiquement, puis lance l'API (port 3333) et le frontend
(port 5173) avec rechargement à chaud.

### 4️⃣ Installation locale (Alternative)

```bash
# 📦 Installer les dépendances
npm install

# 🐘 Démarrer uniquement Postgres
docker compose up postgres -d

# 📈 Appliquer les migrations
cd packages/ttt-api && node ace migration:run && cd ../..

# 🔥 Lancer en mode développement (API + frontend)
npm run dev
```

---

## 📋 Scripts Disponibles

### 🎯 **Scripts principaux**

```bash
# 🔥 Développement
npm run dev                    # Lance API + Frontend
npm run dev:api               # Lance uniquement l'API
npm run dev:web               # Lance uniquement le frontend

# 🏗️ Build
npm run build                 # Build API + Frontend
```

### 🐳 **Scripts Docker**

```bash
npm run docker:dev           # Démarrage développement (build + up)
npm run docker:dev:detached  # Idem, en arrière-plan
npm run docker:prod          # Démarrage production
npm run docker:down          # Arrêter les conteneurs
npm run docker:down:volumes  # Arrêter + supprimer volumes
npm run docker:logs          # Tous les logs
npm run docker:logs:api      # Logs API uniquement
npm run docker:logs:web      # Logs frontend uniquement
npm run docker:restart       # Redémarrer les conteneurs
npm run docker:rebuild       # Reconstruire et redémarrer
npm run docker:clean         # Nettoyer Docker
```

### 🗄️ **Scripts Base de Données**

```bash
npm run db:migrate           # Exécuter les migrations
npm run db:status           # Statut des migrations
npm run db:reset            # Rollback complet puis ré-application des migrations
npm run db:seed             # Peupler la base avec des données de test
```

### ⚡ **Commandes Make (Alternative)**

Le projet inclut un **Makefile** pour simplifier les commandes Docker :

```bash
make help                   # Voir toutes les commandes disponibles
make logs                   # Voir tous les logs
make logs-api               # Logs de l'API
make shell-api               # Shell dans le conteneur API
make run-migrations           # Exécuter les migrations
make backup-db                 # Sauvegarder la base
```

---

## 🏗️ Architecture du Projet

```
📁 trouve-ta-table/
├── 📦 packages/
│   ├── 🚀 ttt-api/              # Backend AdonisJS
│   │   ├── 🎯 app/
│   │   │   ├── 🎮 controllers/  # Contrôleurs REST
│   │   │   ├── 📊 models/       # Modèles Lucid
│   │   │   ├── ⚙️ services/     # Logique métier
│   │   │   ├── 🛡️ policies/     # Autorisations (Bouncer)
│   │   │   ├── 🛡️ middleware/   # Middlewares
│   │   │   └── ✅ validators/   # Validation des données (VineJS)
│   │   ├── 🗄️ database/
│   │   │   ├── 📈 migrations/   # Migrations DB
│   │   │   └── 🌱 seeders/      # Données de test
│   │   └── 🎛️ start/            # Configuration routes
│   └── ⚛️ ttt-web/              # Frontend React
│       ├── 📱 src/
│       │   ├── 🧩 components/   # Composants réutilisables
│       │   ├── 📄 pages/        # Pages de l'application
│       │   ├── 🌐 services/     # Services API
│       │   ├── 🐻 stores/       # Gestion d'état Zustand
│       │   ├── 📝 types/        # Types TypeScript
│       │   └── 🔧 utils/        # Utilitaires
│       └── 🎨 public/           # Assets statiques
├── 🐳 docker-compose.yml        # Configuration Docker (production)
├── 🐳 docker-compose.dev.yml    # Configuration Docker (développement)
└── 📋 package.json             # Scripts et workspaces
```

---

## 🔧 Développement

### 🌐 **URLs locales**

- 🖥️ **Frontend** : http://localhost:5173 (Docker dev / `npm run dev`)
- 🚀 **API** : http://localhost:3333
- 🐘 **Base de données** : localhost:5432

### 📋 **Workflow de développement**

1. 📝 **Faire des changements** dans `packages/ttt-api/` ou `packages/ttt-web/`
2. ⚡ **Hot reload** activé automatiquement
3. 📊 **Vérifier les logs** : `npm run docker:logs`
4. 🩺 **Tester l'API** : http://localhost:3333/health

### 🗄️ **Base de données**

```bash
# 📈 Créer une nouvelle migration
docker compose exec api node ace make:migration create_something

# 📊 Créer un nouveau modèle
docker compose exec api node ace make:model Something

# 🐘 Accéder à la DB
docker compose exec postgres psql -U aldo -d ttt-db
```

### 🐛 **Debugging**

```bash
# 💻 Accéder au shell du conteneur API
docker compose exec api sh

# 📊 Voir les logs en temps réel
npm run docker:logs:api

# 📋 Vérifier le statut des services
docker compose ps
```

---

## 🧪 Tests

```bash
cd packages/ttt-api && npm test
```

```bash
# 🔎 Lint et typecheck
cd packages/ttt-api && npm run lint && npm run typecheck

# ⚛️ Lint du frontend
cd packages/ttt-web && npm run lint
```

---

## 🐛 Résolution des Problèmes

### ⚠️ **Problèmes courants**

#### 1️⃣ **Port déjà utilisé**
```bash
# 📋 Vérifier les ports utilisés
docker compose ps
# 🛑 Arrêter tous les conteneurs
npm run docker:down
```

#### 2️⃣ **Base de données corrompue**
```bash
# 🔄 Reset complet
npm run docker:down:volumes
npm run docker:dev
npm run db:migrate
npm run db:seed
```

#### 3️⃣ **Problèmes de cache Docker**
```bash
# 🧹 Nettoyer et reconstruire
npm run docker:clean
npm run docker:rebuild
```

### 📊 **Logs utiles**

```bash
# 📋 Tous les services
npm run docker:logs

# 🎯 Service spécifique
npm run docker:logs:api
npm run docker:logs:web
```

---

## 📦 Production

Le projet est configuré pour un **déploiement Docker** en production :

```bash
# 🚀 Démarrer en production
npm run docker:prod

# 📋 Vérifier le statut
docker compose ps
```

### 🔧 **Configuration de production**

- 🌍 Variables d'environnement injectées via `--env-file` (voir `.env.docker.exemple`)
- ⚡ Images optimisées (build multi-stage)
- 🌐 Nginx pour servir le frontend
- 🔄 Restart policies automatiques

---

## 🎯 Quick Start

```bash
# 1️⃣ Clone et navigue
git clone <repository-url> && cd trouve-ta-table

# 2️⃣ Configure les variables
cp packages/ttt-api/.env.example packages/ttt-api/.env

# 3️⃣ Lance tout en une commande (Postgres + migrations + API + frontend)
docker compose -f docker-compose.dev.yml --env-file .env.docker up -d

# 🎉 C'est prêt ! Ouvre http://localhost:5173
```

---

> **💡 Astuce :** Pour un développement optimal, garde un terminal ouvert avec `npm run docker:logs` pour surveiller l'activité en temps réel !

---

<div align="center">
  
**🍽️ Développé avec ❤️ par l'équipe Trouve Ta Table 🍽️**

*Bon appétit et bon développement !* 

</div>
