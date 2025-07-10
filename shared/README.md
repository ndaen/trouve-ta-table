# @trouve-ta-table/shared

Package partagé contenant les types, constantes, utilitaires et validateurs pour l'application Trouve Ta Table.

## Installation

```bash
npm install @trouve-ta-table/shared
```

## Utilisation

### Types

```typescript
import { 
  User, 
  Project, 
  Guest, 
  Table, 
  CreateProjectDto,
  EventType,
  SubscriptionPlan 
} from '@trouve-ta-table/shared'

// Utilisation des types
const project: Project = {
  id: '123',
  name: 'Mon Mariage',
  eventType: EventType.WEDDING,
  // ...
}
```

### Constantes

```typescript
import { 
  VALIDATION, 
  SUBSCRIPTION_LIMITS, 
  ERROR_CODES 
} from '@trouve-ta-table/shared'

// Utilisation des constantes
const maxLength = VALIDATION.PROJECT.NAME_MAX_LENGTH
const limits = SUBSCRIPTION_LIMITS[SubscriptionPlan.PRO]
```

### Utilitaires

```typescript
import { 
  searchGuestsByName,
  calculateProjectStats,
  formatEventDate,
  canCreateProject
} from '@trouve-ta-table/shared'

// Recherche d'invités
const results = searchGuestsByName(guests, 'Jean Dupont')

// Calcul des statistiques
const stats = calculateProjectStats(project)

// Vérification des limites
const canCreate = canCreateProject(currentProjects, SubscriptionPlan.PRO)
```

### Validateurs

```typescript
import { 
  validateCreateProjectDto,
  validateEmail,
  validatePassword 
} from '@trouve-ta-table/shared'

// Validation d'un projet
const result = validateCreateProjectDto(projectData)
if (!result.isValid) {
  console.log(result.errors)
}

// Validation d'email
const emailResult = validateEmail('test@example.com')
```

## Structure du Package

```
src/
├── types/          # Types TypeScript
├── constants/      # Constantes et enums
├── utils/          # Fonctions utilitaires
├── validators/     # Validateurs
└── index.ts        # Point d'entrée
```

## Développement

### Build

```bash
npm run build
```

### Watch Mode

```bash
npm run dev
```

### Clean

```bash
npm run clean
```

## Types Principaux

- **User** : Utilisateur de l'application
- **Project** : Projet/événement
- **Table** : Table d'un événement
- **Guest** : Invité d'un événement
- **DTOs** : Objets de transfert de données pour l'API

## Utilitaires Principaux

- **searchGuestsByName** : Recherche fuzzy d'invités
- **calculateProjectStats** : Calcul des statistiques d'un projet
- **validateEmail/Password** : Validation des données
- **formatEventDate** : Formatage des dates
- **canCreateProject** : Vérification des limites d'abonnement

## Constantes

- **VALIDATION** : Règles de validation
- **SUBSCRIPTION_LIMITS** : Limites par plan d'abonnement
- **ERROR_CODES** : Codes d'erreur standardisés
- **EVENT_TYPES** : Types d'événements supportés

## Contribution

Ce package est interne au projet Trouve Ta Table. Pour contribuer :

1. Modifier les fichiers dans `src/`
2. Tester avec `npm run build`
3. Mettre à jour la version dans `package.json`
4. Publier avec `npm publish`

## Licence

MIT