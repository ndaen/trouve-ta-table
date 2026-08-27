# Fondations : amputation et socle — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réduire l'API au code qui sert le produit, puis y poser une autorisation
unique, une validation systématique et un filet de tests — de sorte qu'aucun compte
ne puisse lire ou modifier les données d'un autre.

**Architecture :** Approche C de la spec. On supprime d'abord (les accès non
autorisés partent avec le code qui les porte), on outille ensuite l'environnement de
test, puis on centralise l'autorisation dans une `ProjectPolicy` Bouncer unique qui
remplace six copies d'une même condition. Chaque règle métier restante est couverte
par un test fonctionnel avant d'être implémentée.

**Tech Stack :** AdonisJS 6, Lucid ORM, PostgreSQL 16, VineJS, `@adonisjs/bouncer`,
Japa (`@japa/runner`, `@japa/api-client`, `@japa/assert`), TypeScript.

**Spec :** `docs/superpowers/specs/2026-08-27-plan-de-table-mariage-design.md`

## Global Constraints

- Travailler dans `packages/ttt-api` sauf mention explicite d'un chemin
  `packages/ttt-web`.
- Aucun changement de framework. AdonisJS 6 et React 19 restent.
- L'authentification repose exclusivement sur le `sessionGuard` d'AdonisJS. Aucun
  code ne doit réintroduire de JWT.
- Le contournement `user.role === 'admin'` est supprimé de toute règle
  d'autorisation. La règle est `user.id === project.userId`, sans exception.
- La colonne `role` reste en base mais n'accorde aucun privilège.
- Quota : 150 invités maximum par projet au premier jalon.
- Tests en TDD : le test échoue d'abord, on ne l'écrit jamais après
  l'implémentation.
- Format de commit : `<type>: <description courte en anglais>`, une ligne,
  minuscules. Types : `feat`, `fix`, `refactor`, `chore`, `test`, `docs`. Aucune
  attribution générée.
- Commandes lancées depuis `packages/ttt-api` : `node ace <commande>`,
  `npm test`, `npm run typecheck`.

---

### Task 1: Environnement de développement et de test

Rien ne tourne aujourd'hui : `node_modules` est absent et il n'existe aucun `.env`
dans `packages/ttt-api`. `tests/bootstrap.ts` ne lance pas les migrations et ne
charge pas le plugin d'authentification, donc aucun test HTTP authentifié n'est
possible. Cette tâche rend le TDD praticable ; toutes les suivantes en dépendent.

**Files:**
- Create: `packages/ttt-api/.env`
- Create: `packages/ttt-api/.env.example`
- Create: `packages/ttt-api/database/factories/main.ts`
- Create: `packages/ttt-api/tests/functional/health.spec.ts`
- Modify: `packages/ttt-api/tests/bootstrap.ts`

**Interfaces:**
- Consumes: rien.
- Produces: `UserFactory`, `ProjectFactory`, `TableFactory`, `GuestFactory` exportées
  depuis `#database/factories/main`. Toutes les tâches suivantes les utilisent pour
  construire leurs fixtures.

- [ ] **Step 1: Installer les dépendances du monorepo**

Depuis la racine `trouve-ta-table` :

```bash
npm install
```

- [ ] **Step 2: Démarrer PostgreSQL**

```bash
docker compose up postgres -d
docker compose ps postgres
```

Attendu : le conteneur `postgres` est `Up` (ou `healthy`).

- [ ] **Step 3: Créer `.env` et `.env.example`**

`APP_KEY` doit être une chaîne aléatoire de 32 caractères. La générer avec
`node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"` et
reporter la valeur dans `.env` uniquement — `.env.example` garde un placeholder.

`packages/ttt-api/.env` :

```
TZ=UTC
PORT=3333
HOST=localhost
LOG_LEVEL=info
APP_KEY=<valeur générée à l'étape ci-dessus>
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=trouve_ta_table

SESSION_DRIVER=cookie
JWT_SECRET=unused-removed-in-task-4
```

`packages/ttt-api/.env.example` : le même contenu, avec `APP_KEY=` vide et
`DB_PASSWORD=postgres` conservé (valeur de développement, pas un secret).

Vérifier que `DB_USER`, `DB_PASSWORD` et `DB_DATABASE` correspondent à ce que
déclare le service `postgres` dans `docker-compose.yml` à la racine ; aligner `.env`
sur le compose si les valeurs diffèrent.

`JWT_SECRET` est conservé provisoirement parce que `start/env.ts` le valide encore au
démarrage. La Task 4 le supprime des deux fichiers.

- [ ] **Step 4: Jouer les migrations**

```bash
node ace migration:run
node ace migration:status
```

Attendu : les neuf migrations existantes sont en état `completed`.

- [ ] **Step 5: Câbler les migrations et l'authentification dans les tests**

Remplacer le contenu de `tests/bootstrap.ts` par :

```ts
import { assert } from '@japa/assert'
import { apiClient } from '@japa/api-client'
import app from '@adonisjs/core/services/app'
import type { Config } from '@japa/runner/types'
import { pluginAdonisJS } from '@japa/plugin-adonisjs'
import testUtils from '@adonisjs/core/services/test_utils'
import { authApiClient } from '@adonisjs/auth/plugins/api_client'

export const plugins: Config['plugins'] = [
    assert(),
    apiClient(),
    pluginAdonisJS(app),
    authApiClient(app),
]

export const runnerHooks: Required<Pick<Config, 'setup' | 'teardown'>> = {
    setup: [() => testUtils.db().migrate()],
    teardown: [],
}

export const configureSuite: Config['configureSuite'] = (suite) => {
    if (['browser', 'functional', 'e2e'].includes(suite.name)) {
        return suite.setup(() => testUtils.httpServer().start())
    }
}
```

`authApiClient` ajoute la méthode `.loginAs(user)` au client de test : c'est ce qui
permettra de tester l'autorisation avec deux comptes distincts.

- [ ] **Step 6: Écrire les factories**

Créer `database/factories/main.ts` :

```ts
import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import User from '#models/user'
import Project from '#models/project'
import Table from '#models/table'
import Guest from '#models/guest'

export const UserFactory = factory
    .define(User, async ({ faker }) => ({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user' as const,
    }))
    .build()

export const ProjectFactory = factory
    .define(Project, async ({ faker }) => ({
        name: faker.lorem.words(2),
        eventType: 'wedding' as const,
        eventDate: DateTime.now().plus({ months: 3 }),
        venue: faker.location.streetAddress(),
        description: null,
        isActive: true,
    }))
    .relation('user', () => UserFactory)
    .build()

export const TableFactory = factory
    .define(Table, async ({ faker }) => ({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        capacity: 8,
    }))
    .build()

export const GuestFactory = factory
    .define(Guest, async ({ faker }) => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
    }))
    .build()
```

Vérifier la valeur admise par `EventType` dans `app/types/project.ts` et remplacer
`'wedding'` par une valeur valide de cette union si elle diffère. Faire de même pour
`UserRole` dans `app/types/user.ts`.

- [ ] **Step 7: Écrire un test de fumée**

Créer `tests/functional/health.spec.ts` :

```ts
import { test } from '@japa/runner'

test.group('Health', () => {
    test('GET /health répond 200', async ({ client }) => {
        const response = await client.get('/health')
        response.assertStatus(200)
    })
})
```

- [ ] **Step 8: Lancer les tests**

```bash
npm test
```

Attendu : la suite `functional` passe, un test réussi. Si la connexion à la base
échoue, vérifier que le conteneur `postgres` est démarré et que `.env` correspond à
`docker-compose.yml`.

- [ ] **Step 9: Vérifier que `.env` n'est pas suivi par git**

```bash
git check-ignore -v packages/ttt-api/.env
```

Attendu : une ligne indiquant la règle de `.gitignore` qui l'exclut. Si la commande
ne renvoie rien, ajouter `.env` à `packages/ttt-api/.gitignore` avant de committer.

- [ ] **Step 10: Commit**

```bash
git add packages/ttt-api/.env.example packages/ttt-api/tests packages/ttt-api/database/factories packages/ttt-api/.gitignore
git commit -m "test: bootstrap test environment with migrations and factories"
```

---

### Task 2: Montée de versions

Chantier borné et sans risque architectural, fait avant toute modification de code
pour ne pas mélanger un échec de migration de version avec un échec de refactor.

**Files:**
- Modify: `packages/ttt-api/package.json`
- Modify: `packages/ttt-web/package.json`
- Modify: `package-lock.json`

**Interfaces:**
- Consumes: environnement de test de la Task 1.
- Produces: rien de nouveau. Les tests existants doivent continuer à passer.

- [ ] **Step 1: Relever l'écart de versions**

```bash
cd packages/ttt-api && npx npm-check-updates
cd ../ttt-web && npx npm-check-updates
```

Noter les versions proposées. Ne pas se fier à une version mémorisée : lire la sortie
de la commande.

- [ ] **Step 2: Monter les versions mineures et correctives d'abord**

```bash
cd packages/ttt-api && npx npm-check-updates -u --target minor
cd ../ttt-web && npx npm-check-updates -u --target minor
cd ../.. && npm install
```

- [ ] **Step 3: Vérifier que tout compile et passe**

```bash
cd packages/ttt-api && npm run typecheck && npm test
cd ../ttt-web && npm run build
```

Attendu : typecheck sans erreur, test de fumée vert, build front réussi.

- [ ] **Step 4: Commit des versions mineures**

```bash
git add package-lock.json packages/ttt-api/package.json packages/ttt-web/package.json
git commit -m "chore: bump dependencies to latest minor versions"
```

- [ ] **Step 5: Traiter les majeures une par une**

Pour chaque montée majeure listée à l'étape 1, dans cet ordre : d'abord `ttt-web`,
puis `ttt-api`. Pour chacune, monter une seule dépendance, relancer
`npm run typecheck`, `npm test` (API) ou `npm run build` (web), puis committer. Si
une majeure casse et que la correction n'est pas évidente, la laisser en l'état,
noter le blocage dans le message de commit du lot et passer à la suivante — aucune
montée majeure n'est bloquante pour la suite de ce plan.

```bash
git commit -m "chore: bump <package> to v<version>"
```

---

### Task 3: Supprimer les endpoints qui exposent les données de tous les comptes

Quatre des six accès non autorisés relevés à l'audit disparaissent avec le code qui
les porte. Les tests écrits ici constatent leur disparition et empêchent leur retour.

**Files:**
- Delete: `packages/ttt-api/app/controllers/users_controller.ts`
- Delete: `packages/ttt-api/app/services/user_service.ts`
- Modify: `packages/ttt-api/start/routes.ts`
- Modify: `packages/ttt-api/app/controllers/projects_controller.ts`
- Modify: `packages/ttt-api/app/controllers/tables_controller.ts`
- Modify: `packages/ttt-api/app/controllers/guests_controller.ts`
- Modify: `packages/ttt-api/app/services/project_service.ts`
- Modify: `packages/ttt-api/app/services/table_service.ts`
- Modify: `packages/ttt-api/app/services/guest_service.ts`
- Create: `packages/ttt-api/tests/functional/removed_endpoints.spec.ts`

**Interfaces:**
- Consumes: `UserFactory` de `#database/factories/main`.
- Produces: aucun nouveau symbole. Supprime `UserService`, `ProjectService.getAll`,
  `TableService.getAll`, `GuestService.getAll` — aucune tâche ultérieure ne doit y
  faire référence.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `tests/functional/removed_endpoints.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/main'

test.group('Endpoints supprimés', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('GET /api/users n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/users').loginAs(user)
        response.assertStatus(404)
    })

    test('PATCH /api/users/:id n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const cible = await UserFactory.create()
        const response = await client
            .patch(`/api/users/${cible.id}`)
            .json({ role: 'admin' })
            .loginAs(user)
        response.assertStatus(404)
    })

    test('GET /api/projects n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/projects').loginAs(user)
        response.assertStatus(404)
    })

    test('GET /api/tables n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/tables').loginAs(user)
        response.assertStatus(404)
    })

    test('GET /api/guests n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/guests').loginAs(user)
        response.assertStatus(404)
    })
})
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : les cinq tests ÉCHOUENT. Les routes répondent aujourd'hui 200 (ou 404
« Project not found » avec un statut applicatif, pas un 404 de routage) — c'est
précisément ce qu'on supprime.

- [ ] **Step 3: Supprimer le contrôleur et le service utilisateurs**

```bash
git rm packages/ttt-api/app/controllers/users_controller.ts packages/ttt-api/app/services/user_service.ts
```

- [ ] **Step 4: Retirer les routes**

Dans `start/routes.ts`, supprimer intégralement le bloc `.prefix('/users')` et son
groupe. Dans les groupes `/projects`, `/tables` et `/guests`, supprimer la ligne
`router.get('/', ...)` de chacun — les trois index globaux.

Conserver toutes les autres routes, y compris `/projects/user/all`,
`/projects/:id/tables`, `/projects/:id/guests` et les routes imbriquées de guests.

- [ ] **Step 5: Supprimer les méthodes devenues orphelines**

- `app/controllers/projects_controller.ts` : supprimer la méthode `index`.
- `app/controllers/tables_controller.ts` : supprimer la méthode `index`.
- `app/controllers/guests_controller.ts` : supprimer la méthode `index`.
- `app/services/project_service.ts` : supprimer `getAll()`.
- `app/services/table_service.ts` : supprimer `getAll()`.
- `app/services/guest_service.ts` : supprimer `getAll()`.

- [ ] **Step 6: Lancer les tests pour vérifier qu'ils passent**

```bash
npm run typecheck && npm test
```

Attendu : les cinq tests PASSENT, le typecheck ne signale aucun import cassé. S'il
signale un import de `UserService` resté quelque part, le supprimer.

- [ ] **Step 7: Commit**

```bash
git add -A packages/ttt-api
git commit -m "refactor: remove user endpoints and global index routes"
```

---

### Task 4: Supprimer le JWT

Le token ne protège rien : l'authentification réelle passe par le `sessionGuard` et
le cookie. Conserver les deux entretient l'illusion d'une sécurité inexistante.

**Files:**
- Delete: `packages/ttt-api/app/services/jwt_service.ts`
- Delete: `packages/ttt-web/src/utils/jwt.ts`
- Modify: `packages/ttt-api/app/controllers/auth_controller.ts`
- Modify: `packages/ttt-api/start/env.ts`
- Modify: `packages/ttt-api/package.json`
- Modify: `packages/ttt-web/package.json`
- Modify: `packages/ttt-api/.env`, `packages/ttt-api/.env.example`
- Modify: `packages/ttt-web/src/stores/useAuthStore.ts`
- Modify: `packages/ttt-web/src/services/authService.ts`
- Create: `packages/ttt-api/tests/functional/auth.spec.ts`

**Interfaces:**
- Consumes: `UserFactory`.
- Produces: le contrat des réponses d'authentification change. `POST /api/auth/register`
  et `POST /api/auth/login` renvoient `{ message, user: { id, email, firstName,
  lastName } }` sans champ `token`. `GET /api/auth/check` renvoie
  `{ isAuthenticated: boolean }` sans champ `token`. Côté front, `authService`
  exporte le type `AuthUser` et les seules méthodes `login`, `register`, `logout`,
  `me` ; `refreshToken` et `checkAuthStatus` sont supprimées, ainsi que
  `useAuthStore.getToken`.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `tests/functional/auth.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/main'

test.group('Authentification', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('login réussi ne renvoie aucun token', async ({ client, assert }) => {
        const user = await UserFactory.merge({ password: 'password123' }).create()

        const response = await client
            .post('/api/auth/login')
            .json({ email: user.email, password: 'password123' })

        response.assertStatus(200)
        assert.notProperty(response.body(), 'token')
        assert.propertyVal(response.body().user, 'email', user.email)
    })

    test('la session authentifie les requêtes suivantes', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/auth/me').loginAs(user)
        response.assertStatus(200)
    })

    test('sans session, /api/auth/me répond 401', async ({ client }) => {
        const response = await client.get('/api/auth/me')
        response.assertStatus(401)
    })

    test('check ne renvoie aucun token', async ({ client, assert }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/auth/check').loginAs(user)
        response.assertStatus(200)
        assert.notProperty(response.body(), 'token')
        assert.propertyVal(response.body(), 'isAuthenticated', true)
    })
})
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : les tests `login réussi ne renvoie aucun token` et `check ne renvoie aucun
token` ÉCHOUENT (la propriété `token` est présente aujourd'hui).

- [ ] **Step 3: Supprimer le service et réécrire le contrôleur**

```bash
git rm packages/ttt-api/app/services/jwt_service.ts
```

Dans `app/controllers/auth_controller.ts`, retirer l'import de `JwtService` et
remplacer les trois retours concernés :

```ts
// register — remplacer le bloc de réponse 201
return response.status(201).json({
    message: 'Inscription réussie',
    user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    },
})

// login — remplacer le bloc de réponse
return response.json({
    message: 'Connexion réussie',
    user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
    },
})

// check — remplacer le corps de la méthode
async check({ response, auth }: HttpContext) {
    const isLoggedIn = await auth.check()
    return response.json({ isAuthenticated: isLoggedIn })
}
```

- [ ] **Step 4: Retirer `JWT_SECRET` de la configuration**

Dans `start/env.ts`, supprimer le bloc de commentaire « Variables for JWT
configuration » et la ligne `JWT_SECRET: Env.schema.string(),`.

Supprimer la ligne `JWT_SECRET=...` de `packages/ttt-api/.env` et de
`packages/ttt-api/.env.example`.

- [ ] **Step 5: Retirer les dépendances jsonwebtoken**

```bash
cd packages/ttt-api && npm uninstall jsonwebtoken @types/jsonwebtoken
cd ../ttt-web && npm uninstall jsonwebtoken @types/jsonwebtoken
```

- [ ] **Step 6: Réécrire le service d'authentification du front**

```bash
git rm packages/ttt-web/src/utils/jwt.ts
```

`authService.ts` type aujourd'hui `token: string` et `tokenType: 'Bearer'` dans ses
interfaces, et expose un `refreshToken()` qui appelle `POST /api/auth/refresh-token`
— une route qui n'existe pas dans `start/routes.ts`. Remplacer le contenu de
`packages/ttt-web/src/services/authService.ts` par :

```ts
import { LoginSchema } from '@/schemas/authSchemas.ts'
import { api } from '@/utils/apiClient'

interface LoginCredentials {
    email: string
    password: string
    rememberMe?: boolean
}

interface RegisterData {
    firstName: string
    lastName: string
    email: string
    password: string
}

export interface AuthUser {
    id: string
    email: string
    firstName: string
    lastName: string
}

interface AuthResponse {
    message: string
    user: AuthUser
}

interface MeResponse {
    user: AuthUser
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        const loginInformation = LoginSchema.parse({
            email: credentials.email,
            password: credentials.password,
        })

        return api.post<AuthResponse>('/api/auth/login', {
            ...loginInformation,
            rememberMe: credentials.rememberMe,
        })
    },

    async register(userData: RegisterData): Promise<AuthResponse> {
        return api.post<AuthResponse>('/api/auth/register', userData)
    },

    async logout(): Promise<{ message: string }> {
        return api.post('/api/auth/logout')
    },

    async me(): Promise<MeResponse> {
        return api.get<MeResponse>('/api/auth/me')
    },
}
```

`refreshToken()` et `checkAuthStatus()` disparaissent : la session est portée par le
cookie, il n'y a plus rien à rafraîchir, et `GET /api/auth/me` répond seul à la
question « qui est connecté ». Si un composant appelait `checkAuthStatus`, le
remplacer par `me()`.

- [ ] **Step 7: Réécrire le store d'authentification**

`useAuthStore.initialize()` se déclenche aujourd'hui sur
`localStorage.getItem("userToken")` et reconstruit l'utilisateur avec
`parseJWT(response.token)`. Sans token, cette logique n'a plus d'objet. La source de
vérité devient le cookie de session, interrogé via `GET /api/auth/me`.

Dans `packages/ttt-web/src/stores/useAuthStore.ts` :

- Supprimer l'import `parseJWT` depuis `@/utils/jwt`.
- Supprimer la propriété `getToken` de l'interface du store et son implémentation.
- Supprimer tout appel à `localStorage.getItem/setItem/removeItem("userToken")`.
- Réécrire `initialize()` selon ce principe : appeler `authService.me()` ; en cas de
  succès, poser `user` depuis `response.user` et `isAuthenticated: true` ; en cas
  d'erreur (401 compris), poser `user: null` et `isAuthenticated: false`. Dans les
  deux cas, terminer par `loading: false`.
- `login()` et `register()` posent `user` depuis `response.user` renvoyé par l'API,
  sans passer par un token.
- `logout()` appelle `authService.logout()` puis remet `user: null` et
  `isAuthenticated: false`.

Conserver le reste de la forme du store (noms des propriétés, signature des
actions) pour ne pas casser les composants qui le consomment.

- [ ] **Step 8: Vérifier qu'aucune trace de token ne subsiste**

```bash
cd packages/ttt-web && grep -rn "utils/jwt\|parseJWT\|isTokenExpired\|isTokenExpiringSoon\|getTokenTimeToExpire\|jsonwebtoken\|userToken\|refreshToken\|tokenType\|checkAuthStatus" src/
```

Attendu : aucune sortie. Toute occurrence restante doit être supprimée avant de
poursuivre.

- [ ] **Step 9: Lancer les vérifications**

```bash
cd packages/ttt-api && npm run typecheck && npm test
cd ../ttt-web && npm run build
```

Attendu : les quatre tests d'authentification PASSENT, le build front réussit. Si le
build front signale une propriété manquante sur un composant consommant le store,
c'est un appel résiduel à `getToken` ou `checkAuthStatus` : le corriger à la source.

- [ ] **Step 10: Commit**

```bash
git add -A packages/ttt-api packages/ttt-web package-lock.json
git commit -m "refactor: remove decorative jwt layer in favor of session auth"
```

---

### Task 5: Nettoyer le code et l'infrastructure morts

Colonnes d'abonnement remplacées par le quota, page vitrine de développement exposée
en production, middlewares jamais appliqués, conteneur Redis démarré pour rien.

**Files:**
- Create: `packages/ttt-api/database/migrations/<timestamp>_drop_subscription_fields_from_users_table.ts`
- Modify: `packages/ttt-api/app/models/user.ts`
- Modify: `packages/ttt-api/app/types/user.ts`
- Delete: `packages/ttt-api/app/middleware/silent_auth_middleware.ts`
- Delete: `packages/ttt-api/app/middleware/guest_middleware.ts`
- Modify: `packages/ttt-api/start/kernel.ts`
- Delete: `packages/ttt-web/src/pages/ProtectedRoutes/DesignSystemPage.tsx`
- Modify: `packages/ttt-web/src/AppWithAuth.tsx`
- Modify: `docker-compose.yml`, `docker-compose.dev.yml`

**Interfaces:**
- Consumes: rien.
- Produces: le modèle `User` n'expose plus `subscriptionPlan` ni
  `subscriptionExpiresAt`. Le type `SubscriptionPlan` disparaît de `#types/index`.

- [ ] **Step 1: Créer la migration**

```bash
node ace make:migration drop_subscription_fields_from_users_table
```

Remplacer le contenu du fichier généré par :

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'users'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('subscription_plan')
            table.dropColumn('subscription_expires_at')
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('subscription_plan').defaultTo('free')
            table.timestamp('subscription_expires_at').nullable()
        })
    }
}
```

Avant de lancer la migration, ouvrir
`database/migrations/1751921689756_add_subscription_fields_to_users_table.ts` et
confirmer les noms exacts des colonnes créées. Aligner le `dropColumn` sur ces noms
s'ils diffèrent.

- [ ] **Step 2: Jouer la migration**

```bash
node ace migration:run && node ace migration:status
```

Attendu : la nouvelle migration est `completed`.

- [ ] **Step 3: Nettoyer le modèle et les types**

Dans `app/models/user.ts`, supprimer les deux colonnes :

```ts
@column()
declare subscriptionPlan: SubscriptionPlan

@column.dateTime()
declare subscriptionExpiresAt: DateTime
```

et retirer `SubscriptionPlan` de la ligne d'import des types.

Dans `app/types/user.ts`, supprimer la déclaration du type `SubscriptionPlan` et,
dans `app/types/index.ts`, son éventuel réexport. Vérifier :

```bash
grep -rn "SubscriptionPlan\|subscriptionPlan\|subscriptionExpiresAt" app/ ../ttt-web/src/
```

Supprimer chaque occurrence restante, y compris dans les types front.

- [ ] **Step 4: Supprimer les middlewares inutilisés**

```bash
git rm packages/ttt-api/app/middleware/silent_auth_middleware.ts packages/ttt-api/app/middleware/guest_middleware.ts
```

Dans `start/kernel.ts`, retirer la ligne `guest: () => import('#middleware/guest_middleware'),`
du bloc `router.named({ ... })`, en conservant l'entrée `auth`.

- [ ] **Step 5: Supprimer la page vitrine du design system**

```bash
git rm packages/ttt-web/src/pages/ProtectedRoutes/DesignSystemPage.tsx
```

Dans `packages/ttt-web/src/AppWithAuth.tsx`, supprimer l'import de
`DesignSystemPage` et le bloc de route `<Route path="/show/design" ... />` en
entier. Les composants de `src/components/ui/` sont conservés.

- [ ] **Step 6: Retirer Redis de l'infrastructure**

Dans `docker-compose.yml` et `docker-compose.dev.yml` à la racine : supprimer le
service `redis`, son volume s'il en a un, et toute entrée `redis` dans les
`depends_on` des autres services. Supprimer les variables `REDIS_*` de `.env.docker`
et `.env.docker.exemple` si elles existent.

Justification à vérifier avant de supprimer :

```bash
cd packages/ttt-api && grep -rn "redis" app/ config/ start/ package.json
```

Attendu : aucune sortie. Si la commande renvoie quelque chose, ne pas supprimer le
service et signaler l'écart.

- [ ] **Step 7: Vérifier**

```bash
cd packages/ttt-api && npm run typecheck && npm test
cd ../ttt-web && npm run build
cd ../.. && docker compose config --quiet && echo "compose valide"
```

Attendu : typecheck vert, tests des Tasks 1, 3 et 4 toujours verts, build front
réussi, `docker compose config` sans erreur.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "refactor: drop subscription fields, unused middleware and redis service"
```

---

### Task 6: Aligner le nommage de `dietaryRequirements`

`Guest.dietary_requirements` est le seul champ en `snake_case` du codebase, compensé
par un `serializeAs`. Cet alignement est fait avant l'écriture de la policy pour que
les tests suivants n'aient pas à manipuler deux conventions.

**Files:**
- Create: `packages/ttt-api/database/migrations/<timestamp>_rename_dietary_requirements_in_guests_table.ts`
- Modify: `packages/ttt-api/app/models/guest.ts`
- Modify: `packages/ttt-api/app/controllers/guests_controller.ts`
- Modify: `packages/ttt-api/app/types/guest.ts`
- Modify: `packages/ttt-web/src/types/guest.types.ts`
- Create: `packages/ttt-api/tests/functional/guest_naming.spec.ts`

**Interfaces:**
- Consumes: `UserFactory`, `ProjectFactory`, `GuestFactory`.
- Produces: `Guest.dietaryRequirements: string | null`. L'API sérialise ce champ
  sous la clé `dietaryRequirements`. Les tâches ultérieures et les plans suivants
  (import, parcours invité) utilisent ce nom.

- [ ] **Step 1: Écrire le test qui échoue**

Créer `tests/functional/guest_naming.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory } from '#database/factories/main'

test.group('Nommage des invités', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('la création accepte et renvoie dietaryRequirements', async ({ client, assert }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()

        const response = await client
            .post('/api/guests')
            .json({
                projectId: project.id,
                firstName: 'Camille',
                lastName: 'Durand',
                email: 'camille.durand@example.com',
                dietaryRequirements: 'végétarien',
            })
            .loginAs(user)

        response.assertStatus(201)
        assert.propertyVal(response.body().data, 'dietaryRequirements', 'végétarien')
        assert.notProperty(response.body().data, 'dietary_requirements')
    })
})
```

- [ ] **Step 2: Lancer le test pour vérifier qu'il échoue**

```bash
npm test
```

Attendu : ÉCHEC. Le champ est aujourd'hui sérialisé en `dietary_requirements` et
`request.only` n'accepte pas la clé `dietaryRequirements`.

- [ ] **Step 3: Créer et jouer la migration**

```bash
node ace make:migration rename_dietary_requirements_in_guests_table
```

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'guests'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.renameColumn('dietary_requirements', 'dietary_requirements_tmp')
        })
        this.schema.alterTable(this.tableName, (table) => {
            table.renameColumn('dietary_requirements_tmp', 'dietaryRequirements')
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.renameColumn('dietaryRequirements', 'dietary_requirements')
        })
    }
}
```

Note : Lucid convertit par défaut les noms de propriétés en `snake_case` pour les
colonnes. `dietaryRequirements` deviendrait donc `dietary_requirements` en base — soit
le nom actuel. Vérifier la stratégie de nommage effective avant de migrer :

```bash
grep -rn "namingStrategy" config/ app/
```

Si aucune stratégie personnalisée n'est définie, **la colonne en base reste
`dietary_requirements` et cette migration est inutile** : supprimer le fichier généré
et passer à l'étape 4. Seuls le nom de la propriété du modèle et le `serializeAs`
changent. C'est le cas attendu.

- [ ] **Step 4: Renommer la propriété du modèle**

Dans `app/models/guest.ts`, remplacer :

```ts
@column({ serializeAs: 'dietary_requirements' })
declare dietary_requirements: string
```

par :

```ts
@column()
declare dietaryRequirements: string | null
```

- [ ] **Step 5: Aligner le contrôleur et les types**

Dans `app/controllers/guests_controller.ts`, remplacer les deux occurrences de
`'dietary_requirements'` par `'dietaryRequirements'` dans les appels
`request.only([...])` de `create` et `update`.

Dans `app/types/guest.ts` et `packages/ttt-web/src/types/guest.types.ts`, renommer le
champ en `dietaryRequirements` et le typer `string | null`.

Vérifier qu'aucune occurrence ne subsiste :

```bash
cd packages/ttt-api && grep -rn "dietary_requirements" app/ ../ttt-web/src/
```

Attendu : aucune sortie.

- [ ] **Step 6: Lancer les vérifications**

```bash
cd packages/ttt-api && npm run typecheck && npm test
cd ../ttt-web && npm run build
```

Attendu : le test PASSE, le build front réussit.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "refactor: rename dietary requirements field to camelCase"
```

---

### Task 7: Installer Bouncer et centraliser l'autorisation en lecture

Le cœur du plan. La condition
`user.id !== X.project.userId && user.role !== 'admin'` est aujourd'hui recopiée dans
six services et absente de toutes les lectures. Elle devient une policy unique, sans
contournement admin.

**Files:**
- Create: `packages/ttt-api/app/policies/project_policy.ts`
- Create: `packages/ttt-api/tests/functional/project_authorization.spec.ts`
- Modify: `packages/ttt-api/app/controllers/projects_controller.ts`
- Modify: `packages/ttt-api/app/controllers/tables_controller.ts`
- Modify: `packages/ttt-api/app/controllers/guests_controller.ts`
- Modify: `packages/ttt-api/app/services/project_service.ts`
- Modify: `packages/ttt-api/app/services/table_service.ts`
- Modify: `packages/ttt-api/app/services/guest_service.ts`

**Interfaces:**
- Consumes: `UserFactory`, `ProjectFactory`, `TableFactory`, `GuestFactory`.
- Produces: `ProjectPolicy` exportée par défaut depuis `#policies/project_policy`,
  avec les méthodes `view(user, project)` et `manage(user, project)`, toutes deux
  retournant `AuthorizerResponse`. La Task 8 et les plans suivants l'utilisent via
  `ctx.bouncer.with(ProjectPolicy).authorize('view' | 'manage', project)`.
  Les méthodes `updateProject`, `deleteProject`, `TableService.update`,
  `TableService.delete`, `GuestService.update` et `GuestService.delete` ne prennent
  plus de paramètre `user`.

- [ ] **Step 1: Installer Bouncer**

```bash
node ace add @adonisjs/bouncer
```

La commande ajoute le provider dans `adonisrc.ts`, le middleware
`initialize_bouncer_middleware` dans `start/kernel.ts` et crée
`app/abilities/main.ts` et `app/policies/main.ts`. Vérifier que
`adonisrc.ts` référence bien `#policies/main` dans son bloc `policies` ou que
`app/policies/main.ts` existe ; c'est le registre que Bouncer utilise pour la
préchargement des policies.

- [ ] **Step 2: Écrire les tests qui échouent**

Créer `tests/functional/project_authorization.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import {
    UserFactory,
    ProjectFactory,
    TableFactory,
    GuestFactory,
} from '#database/factories/main'

test.group('Autorisation projet', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    async function deuxComptes() {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()
        return { proprietaire, intrus, project }
    }

    test('un intrus ne peut pas lire un projet', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client.get(`/api/projects/${project.id}`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('le propriétaire peut lire son projet', async ({ client }) => {
        const { proprietaire, project } = await deuxComptes()
        const response = await client.get(`/api/projects/${project.id}`).loginAs(proprietaire)
        response.assertStatus(200)
    })

    test('un intrus ne peut pas lister les tables d\'un projet', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client.get(`/api/projects/${project.id}/tables`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('un intrus ne peut pas lister les invités d\'un projet', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client.get(`/api/projects/${project.id}/guests`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('un intrus ne peut pas lire une table', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const table = await TableFactory.merge({ projectId: project.id }).create()
        const response = await client.get(`/api/tables/${table.id}`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('un intrus ne peut pas lire un invité', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const guest = await GuestFactory.merge({ projectId: project.id }).create()
        const response = await client.get(`/api/guests/${guest.id}`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('un intrus ne peut pas modifier un projet', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client
            .patch(`/api/projects/${project.id}`)
            .json({ name: 'détourné' })
            .loginAs(intrus)
        response.assertStatus(403)
    })

    test('un intrus ne peut pas supprimer un projet', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client.delete(`/api/projects/${project.id}`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('un compte au rôle admin n\'a aucun privilège', async ({ client }) => {
        const { project } = await deuxComptes()
        const faussaire = await UserFactory.merge({ role: 'admin' }).create()
        const response = await client.get(`/api/projects/${project.id}`).loginAs(faussaire)
        response.assertStatus(403)
    })
})
```

- [ ] **Step 3: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : les tests de lecture ÉCHOUENT en renvoyant 200 au lieu de 403, et le test
« un compte au rôle admin n'a aucun privilège » ÉCHOUE également. Les deux tests
d'écriture passent déjà — les écritures sont les seules protégées aujourd'hui.

- [ ] **Step 4: Écrire la policy**

Créer `app/policies/project_policy.ts` :

```ts
import { BasePolicy } from '@adonisjs/bouncer'
import type { AuthorizerResponse } from '@adonisjs/bouncer/types'
import User from '#models/user'
import Project from '#models/project'

export default class ProjectPolicy extends BasePolicy {
    view(user: User, project: Project): AuthorizerResponse {
        return user.id === project.userId
    }

    manage(user: User, project: Project): AuthorizerResponse {
        return user.id === project.userId
    }
}
```

Les deux méthodes portent aujourd'hui la même règle. Elles restent distinctes parce
que la lecture et l'écriture divergeront quand le partage d'un plan de table sera
introduit ; les appelants n'auront alors rien à changer.

Enregistrer la policy dans `app/policies/main.ts` :

```ts
export const policies = {
    ProjectPolicy: () => import('#policies/project_policy'),
}
```

- [ ] **Step 5: Protéger les lectures de projet**

Dans `app/controllers/projects_controller.ts`, ajouter en tête de fichier :

```ts
import ProjectPolicy from '#policies/project_policy'
```

Puis, dans `show`, `getProjectTables` et `getProjectGuests`, insérer l'autorisation
juste après la récupération du projet et le contrôle d'existence. Exemple pour
`show` :

```ts
public async show({ params, response, bouncer }: HttpContext) {
    const project = await this.projectService.getById(params.id)
    if (!project) {
        return response.status(404).json({ message: 'Project not found' })
    }
    await bouncer.with(ProjectPolicy).authorize('view', project)

    return response.json({ message: 'Project details', data: project })
}
```

Appliquer le même appel `await bouncer.with(ProjectPolicy).authorize('view', project)`
dans `getProjectTables` et `getProjectGuests`, après leur contrôle d'existence
respectif.

Corriger au passage `getProjectTables` : il renvoie aujourd'hui 404 quand un projet
n'a aucune table. Un projet sans table est un état normal. Remplacer le bloc
`if (tables.length === 0)` par un retour 200 avec un tableau vide.

- [ ] **Step 6: Protéger les lectures de table et d'invité**

Dans `app/controllers/tables_controller.ts`, méthode `show` : après avoir récupéré la
table et vérifié son existence, charger sa relation projet et autoriser.

```ts
public async show({ params, response, bouncer }: HttpContext) {
    const table = await this.tableService.getById(params.id)
    if (!table) {
        return response.status(404).json({ message: 'Table not found' })
    }
    await bouncer.with(ProjectPolicy).authorize('view', table.project)

    return response.status(200).json({ message: 'Table details', data: table })
}
```

`TableService.getById` précharge déjà `project`, donc `table.project` est disponible.

Dans `app/controllers/guests_controller.ts`, méthode `show`, appliquer exactement le
même motif sur `guest.project` — `GuestService.getById` précharge déjà `project`.

Ajouter l'import `ProjectPolicy` dans les deux contrôleurs.

- [ ] **Step 7: Retirer les contrôles d'autorisation dupliqués des services**

Les services ne portent plus l'autorisation ; elle est dans la policy. Retirer le
paramètre `user: User` et le bloc de vérification correspondant de :

- `ProjectService.updateProject(projectId, payload)`
- `ProjectService.deleteProject(projectId)`
- `TableService.update(id, tableData)`
- `TableService.delete(id)`
- `GuestService.update(id, guestData)`
- `GuestService.delete(id)`

Dans chaque contrôleur appelant, récupérer d'abord l'entité, autoriser via la policy,
puis appeler le service. Exemple pour `ProjectsController.update` :

```ts
public async update({ params, request, response, bouncer }: HttpContext) {
    const project = await this.projectService.getById(params.id)
    if (!project) {
        return response.status(404).json({ message: 'Project not found' })
    }
    await bouncer.with(ProjectPolicy).authorize('manage', project)

    const updated = await this.projectService.updateProject(params.id, request.body())
    return response.json({ message: 'Project updated successfully', data: updated })
}
```

Appliquer le même schéma à `ProjectsController.delete`, `TablesController.update`,
`TablesController.delete`, `GuestsController.update` et `GuestsController.delete`, en
autorisant sur `'manage'` et sur le projet propriétaire de l'entité.

Supprimer les imports de `User` devenus inutiles dans les trois services.

- [ ] **Step 8: Vérifier que le contournement admin a disparu**

```bash
grep -rn "role === 'admin'\|role !== 'admin'" app/
```

Attendu : aucune sortie.

- [ ] **Step 9: Lancer les tests pour vérifier qu'ils passent**

```bash
npm run typecheck && npm test
```

Attendu : les neuf tests d'autorisation PASSENT, ainsi que ceux des tâches
précédentes.

- [ ] **Step 10: Commit**

```bash
git add -A packages/ttt-api
git commit -m "feat: centralize authorization in a single project policy"
```

---

### Task 8: Protéger les écritures d'invités laissées ouvertes

`POST /api/guests` et `POST /api/guests/:id/assign` ne font aujourd'hui aucun
contrôle : n'importe quel compte authentifié peut ajouter un invité au mariage d'un
autre, ou réassigner ses invités.

**Files:**
- Modify: `packages/ttt-api/app/controllers/guests_controller.ts`
- Modify: `packages/ttt-api/app/controllers/tables_controller.ts`
- Create: `packages/ttt-api/tests/functional/guest_write_authorization.spec.ts`

**Interfaces:**
- Consumes: `ProjectPolicy` de la Task 7, les factories de la Task 1.
- Produces: aucun nouveau symbole.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `tests/functional/guest_write_authorization.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import {
    UserFactory,
    ProjectFactory,
    TableFactory,
    GuestFactory,
} from '#database/factories/main'

test.group('Autorisation des écritures invités', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('un intrus ne peut pas créer un invité dans un projet tiers', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()

        const response = await client
            .post('/api/guests')
            .json({
                projectId: project.id,
                firstName: 'Intrus',
                lastName: 'Malveillant',
                email: 'intrus@example.com',
            })
            .loginAs(intrus)

        response.assertStatus(403)
    })

    test('un intrus ne peut pas assigner un invité à une table', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()
        const table = await TableFactory.merge({ projectId: project.id }).create()
        const guest = await GuestFactory.merge({ projectId: project.id }).create()

        const response = await client
            .post(`/api/guests/${guest.id}/assign`)
            .json({ tableId: table.id })
            .loginAs(intrus)

        response.assertStatus(403)
    })

    test('un intrus ne peut pas désassigner un invité', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()
        const table = await TableFactory.merge({ projectId: project.id }).create()
        const guest = await GuestFactory.merge({
            projectId: project.id,
            tableId: table.id,
        }).create()

        const response = await client
            .post(`/api/guests/${guest.id}/unassign`)
            .loginAs(intrus)

        response.assertStatus(403)
    })

    test('un intrus ne peut pas créer une table dans un projet tiers', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()

        const response = await client
            .post('/api/tables')
            .json({ projectId: project.id, name: 'Table pirate', capacity: 8 })
            .loginAs(intrus)

        response.assertStatus(403)
    })

    test('le propriétaire peut créer un invité dans son projet', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()

        const response = await client
            .post('/api/guests')
            .json({
                projectId: project.id,
                firstName: 'Camille',
                lastName: 'Durand',
                email: 'camille@example.com',
            })
            .loginAs(proprietaire)

        response.assertStatus(201)
    })
})
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : les quatre tests d'intrusion ÉCHOUENT en renvoyant 201 ou 200 au lieu de
403. Le dernier test passe déjà.

- [ ] **Step 3: Protéger la création d'invité**

Dans `app/controllers/guests_controller.ts`, méthode `create` : le projet cible vient
du corps de la requête, il faut donc le charger et l'autoriser avant d'écrire.

```ts
public async create({ request, response, bouncer }: HttpContext) {
    const guestData = request.only([
        'projectId',
        'firstName',
        'lastName',
        'email',
        'dietaryRequirements',
    ])

    const project = await Project.find(guestData.projectId)
    if (!project) {
        return response.status(404).json({ message: 'Project not found' })
    }
    await bouncer.with(ProjectPolicy).authorize('manage', project)

    const guest = await this.guestService.create(guestData)
    return response.status(201).json({ message: 'Guest created successfully', data: guest })
}
```

Ajouter l'import `import Project from '#models/project'` en tête du contrôleur.

- [ ] **Step 4: Protéger l'assignation et la désassignation**

Dans les méthodes `assignToTable` et `unassignFromTable`, charger l'invité, vérifier
son existence, autoriser sur son projet, puis déléguer au service.

```ts
public async assignToTable({ params, request, response, bouncer }: HttpContext) {
    const { tableId } = request.only(['tableId'])
    if (!tableId) {
        return response.status(400).json({ message: 'Table ID is required' })
    }

    const guest = await this.guestService.getById(params.id)
    if (!guest) {
        return response.status(404).json({ message: 'Guest not found' })
    }
    await bouncer.with(ProjectPolicy).authorize('manage', guest.project)

    const result = await this.guestService.assignToTable(params.id, tableId)
    if (!(result instanceof Guest)) {
        return response.status(result.status).json({ message: result.error })
    }
    return response
        .status(200)
        .json({ message: 'Guest assigned to table successfully', data: result })
}
```

Appliquer le même motif à `unassignFromTable`.

- [ ] **Step 5: Protéger la création de table**

Dans `app/controllers/tables_controller.ts`, méthode `create`, appliquer le motif de
l'étape 3 : charger le projet depuis `tableData.projectId`, renvoyer 404 s'il
n'existe pas, autoriser sur `'manage'`, puis créer. Ajouter les imports
`ProjectPolicy` et `Project`.

- [ ] **Step 6: Protéger `getUnassignedGuests`**

La route `GET /api/projects/:id/guests/unassigned` pointe vers
`GuestsController.getUnassignedGuests` et ne contrôle rien. Charger le projet,
autoriser en `'view'`, et remplacer le retour 404 sur liste vide par un 200 avec un
tableau vide — aucun invité non assigné est un état normal.

- [ ] **Step 7: Lancer les tests pour vérifier qu'ils passent**

```bash
npm run typecheck && npm test
```

Attendu : les cinq tests PASSENT, ainsi que toutes les suites précédentes.

- [ ] **Step 8: Commit**

```bash
git add -A packages/ttt-api
git commit -m "fix: authorize guest and table write endpoints"
```

---

### Task 9: Valider les entrées avec VineJS

Seul `app/validators/auth.ts` existe. Projets, tables et invités passent par
`request.only([...])` brut : aucun contrôle de type ni de bornes.

**Files:**
- Create: `packages/ttt-api/app/validators/project.ts`
- Create: `packages/ttt-api/app/validators/table.ts`
- Create: `packages/ttt-api/app/validators/guest.ts`
- Modify: `packages/ttt-api/app/controllers/projects_controller.ts`
- Modify: `packages/ttt-api/app/controllers/tables_controller.ts`
- Modify: `packages/ttt-api/app/controllers/guests_controller.ts`
- Create: `packages/ttt-api/tests/functional/validation.spec.ts`

**Interfaces:**
- Consumes: les factories, `ProjectPolicy`.
- Produces: `createProjectValidator`, `updateProjectValidator` depuis
  `#validators/project` ; `createTableValidator`, `updateTableValidator` depuis
  `#validators/table` ; `createGuestValidator`, `updateGuestValidator` depuis
  `#validators/guest`. Le plan « import tableur » réutilisera `createGuestValidator`
  comme base de son validateur de lignes.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `tests/functional/validation.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory } from '#database/factories/main'

test.group('Validation des entrées', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('un projet sans nom est refusé', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client
            .post('/api/projects')
            .json({ venue: 'Château de Vaux', eventType: 'wedding' })
            .loginAs(user)
        response.assertStatus(422)
    })

    test('une table avec une capacité négative est refusée', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        const response = await client
            .post('/api/tables')
            .json({ projectId: project.id, name: 'Table 1', capacity: -3 })
            .loginAs(user)
        response.assertStatus(422)
    })

    test('un invité avec un email invalide est refusé', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        const response = await client
            .post('/api/guests')
            .json({
                projectId: project.id,
                firstName: 'Camille',
                lastName: 'Durand',
                email: 'pas-un-email',
            })
            .loginAs(user)
        response.assertStatus(422)
    })

    test('un invité sans email est accepté', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        const response = await client
            .post('/api/guests')
            .json({ projectId: project.id, firstName: 'Camille', lastName: 'Durand' })
            .loginAs(user)
        response.assertStatus(201)
    })
})
```

Le dernier test acte une décision : l'email d'un invité est **facultatif**. Un couple
ne connaît pas l'adresse de tous ses invités, et le plan « import tableur » traitera
des fichiers où la colonne email est absente.

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : les trois premiers tests ÉCHOUENT (201 au lieu de 422). Le quatrième
échoue peut-être aussi si la colonne `email` est `NOT NULL` en base.

- [ ] **Step 3: Rendre l'email d'invité facultatif si nécessaire**

```bash
grep -n "email" database/migrations/*create_guests_table.ts
```

Si la colonne est déclarée `notNullable()`, créer une migration :

```bash
node ace make:migration make_guest_email_nullable
```

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'guests'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('email').nullable().alter()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('email').notNullable().alter()
        })
    }
}
```

Jouer `node ace migration:run` et passer `email` à `string | null` dans
`app/models/guest.ts`, `app/types/guest.ts` et
`packages/ttt-web/src/types/guest.types.ts`.

- [ ] **Step 4: Écrire les validateurs**

`app/validators/project.ts` :

```ts
import vine from '@vinejs/vine'

export const createProjectValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(120),
        eventType: vine.string().trim().maxLength(50),
        eventDate: vine.date({ formats: ['iso8601'] }),
        venue: vine.string().trim().minLength(2).maxLength(200),
        description: vine.string().trim().maxLength(2000).nullable().optional(),
        isActive: vine.boolean().optional(),
    })
)

export const updateProjectValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(120).optional(),
        eventType: vine.string().trim().maxLength(50).optional(),
        eventDate: vine.date({ formats: ['iso8601'] }).optional(),
        venue: vine.string().trim().minLength(2).maxLength(200).optional(),
        description: vine.string().trim().maxLength(2000).nullable().optional(),
        isActive: vine.boolean().optional(),
    })
)
```

`app/validators/table.ts` :

```ts
import vine from '@vinejs/vine'

export const createTableValidator = vine.compile(
    vine.object({
        projectId: vine.string().uuid(),
        name: vine.string().trim().minLength(1).maxLength(80),
        description: vine.string().trim().maxLength(500).nullable().optional(),
        capacity: vine.number().min(1).max(50),
    })
)

export const updateTableValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).maxLength(80).optional(),
        description: vine.string().trim().maxLength(500).nullable().optional(),
        capacity: vine.number().min(1).max(50).optional(),
    })
)
```

`app/validators/guest.ts` :

```ts
import vine from '@vinejs/vine'

export const createGuestValidator = vine.compile(
    vine.object({
        projectId: vine.string().uuid(),
        firstName: vine.string().trim().minLength(1).maxLength(80),
        lastName: vine.string().trim().minLength(1).maxLength(80),
        email: vine.string().trim().email().normalizeEmail().nullable().optional(),
        dietaryRequirements: vine.string().trim().maxLength(500).nullable().optional(),
    })
)

export const updateGuestValidator = vine.compile(
    vine.object({
        firstName: vine.string().trim().minLength(1).maxLength(80).optional(),
        lastName: vine.string().trim().minLength(1).maxLength(80).optional(),
        email: vine.string().trim().email().normalizeEmail().nullable().optional(),
        dietaryRequirements: vine.string().trim().maxLength(500).nullable().optional(),
    })
)
```

- [ ] **Step 5: Brancher les validateurs dans les contrôleurs**

Remplacer chaque `request.only([...])` et `request.body()` par
`await request.validateUsing(<validateur>)` dans `create` et `update` des trois
contrôleurs.

Pour `ProjectsController.create`, la validation remplace le cast
`request.body() as CreateProjectPayload` ; conserver l'ajout de
`userId: auth.user!.id` après validation :

```ts
public async create({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createProjectValidator)
    const project = await this.projectService.createProject({
        ...payload,
        userId: auth.user!.id,
    })
    return response.status(201).json({ message: 'Project created successfully', data: project })
}
```

Pour `GuestsController.create` et `TablesController.create`, valider **avant** de
charger le projet et d'appeler la policy — une entrée malformée doit produire un 422,
pas un 404. La variable validée est nommée `payload` ; la Task 10 s'y réfère sous ce
nom.

```ts
public async create({ request, response, bouncer }: HttpContext) {
    const payload = await request.validateUsing(createGuestValidator)

    const project = await Project.find(payload.projectId)
    if (!project) {
        return response.status(404).json({ message: 'Project not found' })
    }
    await bouncer.with(ProjectPolicy).authorize('manage', project)

    const guest = await this.guestService.create(payload)
    return response.status(201).json({ message: 'Guest created successfully', data: guest })
}
```

`TablesController.create` suit le même enchaînement avec `createTableValidator` et
`ProjectPolicy` sur `'manage'`.

Le gestionnaire d'exceptions d'AdonisJS convertit automatiquement une erreur VineJS
en réponse 422 ; aucun `try/catch` n'est à ajouter.

- [ ] **Step 6: Lancer les tests pour vérifier qu'ils passent**

```bash
npm run typecheck && npm test
```

Attendu : les quatre tests de validation PASSENT et aucune suite précédente ne
régresse. Si un test d'autorisation renvoie désormais 422 au lieu de 403, c'est que
sa charge utile est incomplète : compléter la fixture du test, pas assouplir le
validateur.

- [ ] **Step 7: Commit**

```bash
git add -A packages/ttt-api
git commit -m "feat: validate project, table and guest payloads with vinejs"
```

---

### Task 10: Appliquer le quota d'invités

Point d'application unique, traversé par la création d'invité et — dans le plan
suivant — par l'import. Limite haute au premier jalon : garde-fou anti-abus, pas
barrière commerciale.

**Files:**
- Create: `packages/ttt-api/app/services/quota_service.ts`
- Modify: `packages/ttt-api/app/controllers/guests_controller.ts`
- Create: `packages/ttt-api/tests/functional/quota.spec.ts`

**Interfaces:**
- Consumes: les factories, `ProjectPolicy`.
- Produces: `QuotaService` exportée par défaut depuis `#services/quota_service`, avec
  `static MAX_GUESTS_PER_PROJECT: number` et
  `assertCanAddGuests(projectId: string, count: number): Promise<void>`, qui lève une
  `QuotaExceededException` traduite en réponse HTTP 422. Le plan « import tableur »
  appelle `assertCanAddGuests(projectId, lignes.length)` avant sa transaction.

- [ ] **Step 1: Écrire les tests qui échouent**

Créer `tests/functional/quota.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory, GuestFactory } from '#database/factories/main'
import QuotaService from '#services/quota_service'

test.group('Quota d\'invités', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('la limite par projet est de 150', async ({ assert }) => {
        assert.equal(QuotaService.MAX_GUESTS_PER_PROJECT, 150)
    })

    test('ajouter un invité sous la limite est accepté', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        await GuestFactory.merge({ projectId: project.id }).createMany(10)

        const response = await client
            .post('/api/guests')
            .json({ projectId: project.id, firstName: 'Camille', lastName: 'Durand' })
            .loginAs(user)

        response.assertStatus(201)
    })

    test('ajouter un invité au-delà de la limite est refusé', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        await GuestFactory.merge({ projectId: project.id }).createMany(
            QuotaService.MAX_GUESTS_PER_PROJECT
        )

        const response = await client
            .post('/api/guests')
            .json({ projectId: project.id, firstName: 'Camille', lastName: 'Durand' })
            .loginAs(user)

        response.assertStatus(422)
    })

    test('le quota est calculé par projet, pas globalement', async ({ client }) => {
        const user = await UserFactory.create()
        const plein = await ProjectFactory.merge({ userId: user.id }).create()
        const vide = await ProjectFactory.merge({ userId: user.id }).create()
        await GuestFactory.merge({ projectId: plein.id }).createMany(
            QuotaService.MAX_GUESTS_PER_PROJECT
        )

        const response = await client
            .post('/api/guests')
            .json({ projectId: vide.id, firstName: 'Camille', lastName: 'Durand' })
            .loginAs(user)

        response.assertStatus(201)
    })
})
```

- [ ] **Step 2: Lancer les tests pour vérifier qu'ils échouent**

```bash
npm test
```

Attendu : ÉCHEC à la compilation — `#services/quota_service` n'existe pas.

- [ ] **Step 3: Écrire le service de quota**

Créer `app/services/quota_service.ts` :

```ts
import { Exception } from '@adonisjs/core/exceptions'
import Guest from '#models/guest'

export class QuotaExceededException extends Exception {
    static status = 422
    static code = 'E_QUOTA_EXCEEDED'
}

export default class QuotaService {
    /**
     * Limite haute au premier jalon : garde-fou anti-abus, pas barrière
     * commerciale. Aucun moyen de paiement n'existe encore, donc bloquer bas
     * enfermerait le couple sans porte de sortie.
     */
    static MAX_GUESTS_PER_PROJECT = 150

    static async assertCanAddGuests(projectId: string, count: number): Promise<void> {
        const [{ total }] = await Guest.query()
            .where('projectId', projectId)
            .count('* as total')
            .pojo<{ total: string }>()

        const actuel = Number(total)
        if (actuel + count > this.MAX_GUESTS_PER_PROJECT) {
            throw new QuotaExceededException(
                `Ce projet est limité à ${this.MAX_GUESTS_PER_PROJECT} invités. ` +
                    `Il en compte ${actuel} et vous tentez d'en ajouter ${count}.`
            )
        }
    }
}
```

- [ ] **Step 4: Appeler le quota à la création d'invité**

Dans `app/controllers/guests_controller.ts`, méthode `create`, insérer l'appel après
l'autorisation et avant la création :

```ts
await bouncer.with(ProjectPolicy).authorize('manage', project)
await QuotaService.assertCanAddGuests(project.id, 1)

const guest = await this.guestService.create(payload)
```

Ajouter `import QuotaService from '#services/quota_service'`.

- [ ] **Step 5: Lancer les tests pour vérifier qu'ils passent**

```bash
npm run typecheck && npm test
```

Attendu : les quatre tests de quota PASSENT. Si le test de dépassement renvoie 500 au
lieu de 422, vérifier que `app/exceptions/handler.ts` laisse remonter le `status`
statique des exceptions AdonisJS plutôt que de tout convertir en 500.

- [ ] **Step 6: Commit**

```bash
git add -A packages/ttt-api
git commit -m "feat: enforce per-project guest quota"
```

---

### Task 11: Vérification de bout en bout et README

Le plan produit du logiciel qui marche : cette tâche le constate et met la
documentation en accord avec le code.

**Files:**
- Modify: `README.md`
- Modify: `package.json` (racine)

**Interfaces:**
- Consumes: tout ce qui précède.
- Produces: rien.

- [ ] **Step 1: Lancer la suite complète**

```bash
cd packages/ttt-api && npm run typecheck && npm run lint && npm test
```

Attendu : typecheck sans erreur, lint sans erreur, toutes les suites vertes. Noter
le nombre total de tests.

- [ ] **Step 2: Vérifier que le front compile et démarre**

```bash
cd packages/ttt-web && npm run lint && npm run build
```

- [ ] **Step 3: Vérifier le parcours réel**

Démarrer l'API et le front (`npm run dev` à la racine), puis dans un navigateur :
créer un compte, créer un projet, y ajouter une table et un invité, assigner
l'invité à la table. Ouvrir ensuite une fenêtre de navigation privée, créer un second
compte, et tenter d'accéder à l'URL du projet du premier compte.

Attendu : le second compte reçoit une erreur d'autorisation et ne voit aucune donnée
du premier.

- [ ] **Step 4: Retirer les scripts Redis et corriger les scripts de base**

Dans le `package.json` de la racine, vérifier qu'aucun script ne référence `redis`.
Corriger `db:reset`, qui enchaîne aujourd'hui deux `docker compose exec` : s'assurer
qu'il fonctionne encore après la suppression du service Redis.

- [ ] **Step 5: Réécrire le README**

Remplacer les sections « À Propos du Projet » et « Stack Technique » pour décrire le
produit réel :

- Trouve Ta Table est un **plan de table pour mariages**. Un couple prépare son plan,
  ses invités le consultent le jour J en scannant un QR code.
- Supprimer toute mention de réservation de restaurant, d'analytics, de temps réel,
  de Redis, et d'« authentification JWT sécurisée » — l'authentification est par
  session.
- Corriger la section d'installation : `cp packages/ttt-api/.env.example
  packages/ttt-api/.env`, `docker compose up postgres -d`, `node ace migration:run`,
  `npm run dev`.
- Ajouter une section « Tests » : `cd packages/ttt-api && npm test`.
- Retirer les références aux fichiers `.env.docker.production.example` et
  `.env.docker.example` s'ils n'existent pas dans le dépôt.

Le README ne doit décrire aucune fonctionnalité absente du code. L'import de tableur
et le QR code font l'objet des plans suivants et n'y figurent pas encore.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "docs: rewrite readme to describe the actual product"
```

---

## Plans suivants

Ce plan couvre les sections 4 et 7 de la spec, et prépare le terrain. Trois plans
restent à écrire, chacun produisant du logiciel utilisable :

1. **Parcours invité** — spec section 6 : recherche multi-résultats, exposition
   minimale des champs, rate limit, génération et correction du QR code, page
   publique. Dépend de la `ProjectPolicy` et des factories de ce plan.
2. **Import tableur** — spec section 5 : parsing client CSV et XLSX, mapping des
   colonnes, aperçu, endpoint transactionnel. Dépend de `createGuestValidator` et de
   `QuotaService.assertCanAddGuests`.
3. **Mise en ligne** — spec section 8 : durée de session, origines CORS en variable
   d'environnement, page d'accueil, configuration de déploiement sur un domaine et
   deux sous-domaines.
