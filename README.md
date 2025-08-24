# Trouve Ta Table 🍽️

> *La plateforme moderne qui révolutionne la gestion et la recherche de tables*

---

## 📖 À Propos du Projet

**Trouve Ta Table** est une solution complète qui facilite la connexion entre les clients et les établissements pour la réservation de tables. Notre plateforme s'adresse à deux publics distincts :

### 🏢 Pour les Professionnels
- **Gestion centralisée** de toutes vos tables et réservations
- **Dashboard intuitif** pour visualiser l'occupation en temps réel  
- **QR Codes personnalisés** pour chaque table
- **Analytics détaillés** sur l'affluence et les préférences clients
- **Interface d'administration** complète

### 👥 Pour les Particuliers
- **Recherche simplifiée** de tables disponibles
- **Réservation en ligne** rapide et sécurisée
- **Accès invité** sans inscription obligatoire
- **Interface mobile-first** pour une expérience optimale

### ✨ Fonctionnalités Principales
- 🔐 **Authentification sécurisée** avec JWT
- 📱 **Interface responsive** adaptée à tous les écrans
- ⚡ **Temps réel** avec mise à jour instantanée des disponibilités
- 🎨 **Design moderne** avec thème sombre/clair
- 🌐 **API REST complète** pour intégrations tierces

---

## 🛠️ Stack Technique

### 🚀 **Backend (API)**
- 🟢 **AdonisJS 6** - Framework Node.js avec TypeScript
- 🐘 **PostgreSQL 16** - Base de données relationnelle
- 🔴 **Redis 7** - Cache et sessions
- 🔐 **JWT** - Authentification sécurisée
- 📊 **Lucid ORM** - Mapping objet-relationnel

### ⚛️ **Frontend (Web)**
- ⚛️ **React 19** - Interface utilisateur moderne
- 🔷 **TypeScript** - Typage statique robuste
- ⚡ **Vite** - Build tool ultra-rapide
- 🐻 **Zustand** - Gestion d'état légère
- 🛡️ **Zod** - Validation des schémas
- 🛣️ **React Router 7** - Routage côté client

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

Créer les fichiers de configuration :

```bash
# 🐳 Pour Docker
cp .env.docker.example .env.docker
cp .env.docker.production.example .env.docker.production

# 💻 Pour le développement local (optionnel)
cp packages/ttt-api/.env.example packages/ttt-api/.env
```

### 3️⃣ Installation avec Docker (🏆 Recommandé)

#### 🔧 Développement

```bash
# Démarrer tous les services
npm run docker:dev

# Ou en arrière-plan
npm run docker:dev:detached
```

#### 🚀 Production

```bash
npm run docker:prod
```

### 4️⃣ Installation locale (Alternative)

```bash
# 📦 Installer les dépendances
npm install

# 🐳 Démarrer uniquement les services (DB + Redis)
docker compose up postgres redis -d

# 🔥 Lancer en mode développement
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
# 🎛️ Gestion des conteneurs
npm run docker:dev           # Démarrage développement
npm run docker:prod          # Démarrage production
npm run docker:down          # Arrêter les conteneurs
npm run docker:down:volumes  # Arrêter + supprimer volumes
npm run docker:restart       # Redémarrer les conteneurs
npm run docker:rebuild       # Reconstruire et redémarrer

# 📊 Logs
npm run docker:logs          # Tous les logs
npm run docker:logs:api      # Logs API uniquement
npm run docker:logs:web      # Logs frontend uniquement

# 🧹 Maintenance
npm run docker:clean         # Nettoyer Docker
```

### 🗄️ **Scripts Base de Données**

```bash
# 📈 Migrations
npm run db:migrate           # Exécuter les migrations
npm run db:status           # Statut des migrations
npm run db:reset            # Reset complet de la DB

# 🌱 Seeders
npm run db:seed             # Peupler la base avec des données de test
```

### ⚡ **Commandes Make (Alternative)**

Le projet inclut un **Makefile** pour simplifier les commandes Docker :

```bash
# 📖 Voir toutes les commandes disponibles
make help

# 📋 Exemples courants
make logs                   # Voir tous les logs
make logs-api              # Logs de l'API
make shell-api             # Shell dans le conteneur API
make run-migrations        # Exécuter les migrations
make backup-db             # Sauvegarder la base
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
│   │   │   ├── 🛡️ middleware/   # Middlewares
│   │   │   └── ✅ validators/   # Validation des données
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
├── 🐳 docker-compose.yml        # Configuration Docker
└── 📋 package.json             # Scripts et workspaces
```

---

## 🔧 Développement

### 🌐 **URLs locales**

- 🖥️ **Frontend** : http://localhost (port 80)
- 🚀 **API** : http://localhost:3333
- 🐘 **Base de données** : localhost:5432
- 🔴 **Redis** : localhost:6379

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

## 🧪 Tests et Quality Assurance

```bash
# 🚀 Dans le conteneur API
docker compose exec api npm run test
docker compose exec api npm run lint
docker compose exec api npm run typecheck

# ⚛️ Dans le conteneur Web
docker compose exec web npm run lint
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

- 🌍 Variables d'environnement de `.env.docker.production`
- ⚡ Images optimisées
- 🌐 Nginx pour servir le frontend
- 🔄 Restart policies automatiques
- 🛡️ Configuration de sécurité renforcée

---

## 🎯 Quick Start

```bash
# 1️⃣ Clone et navigue
git clone <repository-url> && cd trouve-ta-table

# 2️⃣ Configure les variables
cp .env.docker.example .env.docker

# 3️⃣ Lance tout en une commande
npm run docker:dev

# 4️⃣ Setup la base de données
npm run db:migrate && npm run db:seed

# 🎉 C'est prêt ! Ouvre http://localhost
```

---

> **💡 Astuce :** Pour un développement optimal, garde un terminal ouvert avec `npm run docker:logs` pour surveiller l'activité en temps réel !

---

<div align="center">
  
**🍽️ Développé avec ❤️ par l'équipe Trouve Ta Table 🍽️**

*Bon appétit et bon développement !* 

</div>