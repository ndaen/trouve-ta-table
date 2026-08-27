# Recherche publique d'invités — Plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** transformer `GET /api/projects/:id/guests/search` en une recherche par champ libre qui renvoie toujours un tableau de résultats, n'expose que le strict nécessaire, et résiste à l'énumération.

**Architecture :** une colonne `search_name` dénormalisée sur `guests`, remplie par un hook `@beforeSave` avec la même fonction de normalisation que celle appliquée à la requête — c'est ce qui rend la recherche réellement insensible aux accents. Le service filtre par tokens (chaque mot de la requête doit être contenu dans `search_name`), plafonne à 10 résultats, et projette explicitement les colonnes pour qu'`email` et `dietary_requirements` ne quittent jamais la base. Un middleware `@adonisjs/limiter` à store mémoire protège la route.

**Tech Stack :** AdonisJS 6, Lucid 21, VineJS 4, `@adonisjs/limiter` ^2.4.0 (store mémoire), Japa 4, React 19 + React Router côté web.

**Spec :** `docs/superpowers/specs/2026-08-27-plan-de-table-mariage-design.md`, sections 6.1, 6.2 et 6.3.

## Global Constraints

- Racine API : `packages/ttt-api`. Racine web : `packages/ttt-web`.
- **Ne jamais** renvoyer `email` ni `dietaryRequirements` sur la route publique. C'est le critère d'acceptation §10 de la spec.
- L'endpoint reste **non authentifié** : aucun `middleware.auth()`, aucun `bouncer` sur cette route.
- `@adonisjs/limiter` doit rester en **^2.4.0** : la 3.x exige `@adonisjs/core` v7, que le projet n'a pas encore.
- Redis est exclu du projet. Le store du limiter est `memory`, jamais `redis`.
- Les erreurs de validation VineJS renvoient **422** dans toute cette application (voir `tests/functional/validation.spec.ts`). Le design parlait de 400 pour une requête vide : on aligne sur 422 pour rester cohérent avec le reste de l'API. C'est une correction assumée du design.
- Messages destinés aux invités : en français, sans jargon technique.
- Format de commit : `<type>: <description courte en anglais>`, une ligne, minuscules. Pas de `Co-Authored-By`.
- Portes de qualité, dans cet ordre, depuis `packages/ttt-api` : `npm test`, puis `npx tsc --noEmit` depuis la racine du monorepo, puis `npm run lint`.

---

## Structure des fichiers

| Fichier | Responsabilité |
|---|---|
| `packages/ttt-api/app/utils/search_text.ts` | **Nouveau.** Normalisation et tokenisation. Unique source de vérité, partagée par le modèle, la migration et le service. |
| `packages/ttt-api/database/migrations/*_add_search_name_to_guests_table.ts` | **Nouveau.** Colonne `search_name`, index, backfill des lignes existantes. |
| `packages/ttt-api/app/models/guest.ts` | Colonne `searchName` + hook `@beforeSave`. |
| `packages/ttt-api/app/types/guest.ts` | Forme publique `GuestSearchResult`, resserrée. |
| `packages/ttt-api/app/services/guest_service.ts` | `searchPublic()` remplace `fuzzySearchByProjectId()`. |
| `packages/ttt-api/app/validators/guest.ts` | `searchGuestsValidator`. |
| `packages/ttt-api/app/controllers/guests_controller.ts` | `search()` remplace `fuzzySearchInProject()`. |
| `packages/ttt-api/config/limiter.ts`, `start/limiter.ts` | **Nouveaux.** Configuration et définition du throttle. |
| `packages/ttt-api/start/routes.ts` | Route publique + middleware de throttle. |
| `packages/ttt-api/tests/unit/search_text.spec.ts` | **Nouveau.** Normalisation. |
| `packages/ttt-api/tests/functional/guest_search.spec.ts` | **Nouveau.** Contrat, durcissement, fuites. |
| `packages/ttt-api/tests/functional/guest_search_throttle.spec.ts` | **Nouveau.** Isolé, parce qu'il épuise le compteur du limiter. |
| `packages/ttt-web/src/services/guestsService.ts` | `searchGuests()` remplace `getGuestTable()`. |
| `packages/ttt-web/src/components/forms/SearchForm.tsx` | Un seul champ libre. |
| `packages/ttt-web/src/pages/GuestSearchPage.tsx` | Liste de résultats cliquable + modale. |

---

## Task 1 : Normalisation partagée

**Files:**
- Create: `packages/ttt-api/app/utils/search_text.ts`
- Create: `packages/ttt-api/tests/unit/search_text.spec.ts`
- Modify: `packages/ttt-api/package.json` (bloc `imports`)

**Interfaces:**
- Consumes: rien.
- Produces: `normalizeSearchText(value: string): string` et `tokenizeSearchQuery(query: string): string[]`, importables via `#utils/search_text.js`. Les tâches 2 et 3 en dépendent.

- [ ] **Step 1 : Déclarer l'alias `#utils/*`**

Dans `packages/ttt-api/package.json`, ajouter une entrée au bloc `imports` existant, juste après `"#types/*"` :

```json
        "#types/*": "./app/types/*.js",
        "#utils/*": "./app/utils/*.js"
```

- [ ] **Step 2 : Écrire le test qui échoue**

Créer `packages/ttt-api/tests/unit/search_text.spec.ts` :

```ts
import { test } from '@japa/runner'
import { normalizeSearchText, tokenizeSearchQuery } from '#utils/search_text'

test.group('Normalisation de recherche', () => {
    test('supprime les accents', ({ assert }) => {
        assert.equal(normalizeSearchText('José'), 'jose')
        assert.equal(normalizeSearchText('JOSÉ'), 'jose')
        assert.equal(normalizeSearchText('Chloë Lefèvre'), 'chloe lefevre')
    })

    test('remplace la ponctuation par des espaces', ({ assert }) => {
        assert.equal(normalizeSearchText("Jean-Pierre O'Connor"), 'jean pierre o connor')
    })

    test('réduit les espaces multiples et coupe les bords', ({ assert }) => {
        assert.equal(normalizeSearchText('  Martin   DUPONT  '), 'martin dupont')
    })

    test('découpe la requête en tokens', ({ assert }) => {
        assert.deepEqual(tokenizeSearchQuery('Dupont  Martin'), ['dupont', 'martin'])
    })

    test('une requête sans caractère utile ne produit aucun token', ({ assert }) => {
        assert.deepEqual(tokenizeSearchQuery('   '), [])
        assert.deepEqual(tokenizeSearchQuery('---'), [])
    })
})
```

- [ ] **Step 3 : Lancer le test et vérifier qu'il échoue**

Depuis `packages/ttt-api` : `node ace test unit`
Attendu : ÉCHEC, module `#utils/search_text` introuvable.

- [ ] **Step 4 : Écrire l'implémentation**

Créer `packages/ttt-api/app/utils/search_text.ts` :

```ts
/**
 * Normalisation partagée par la colonne `guests.search_name` et par la requête
 * de recherche publique. Les deux côtés DOIVENT passer par cette fonction :
 * c'est la seule chose qui garantit que « jose » trouve « José ».
 *
 * La ponctuation devient un espace, ce qui fait que « Jean-Pierre » est
 * trouvable en tapant « jean pierre ». Effet de bord utile : les caractères
 * `%` et `_` disparaissent, donc aucune requête utilisateur ne peut agir
 * comme un joker dans le `LIKE` du service.
 */
export function normalizeSearchText(value: string): string {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
}

/**
 * Découpe une requête en tokens normalisés. Chaque token devra être contenu
 * dans `search_name`, ce qui rend l'ordre des mots indifférent : « dupont
 * martin » trouve « Martin Dupont ».
 */
export function tokenizeSearchQuery(query: string): string[] {
    const normalized = normalizeSearchText(query)
    return normalized.length === 0 ? [] : normalized.split(' ')
}
```

- [ ] **Step 5 : Lancer le test et vérifier qu'il passe**

Depuis `packages/ttt-api` : `node ace test unit`
Attendu : 5 tests au vert.

- [ ] **Step 6 : Commit**

```bash
git add packages/ttt-api/package.json packages/ttt-api/app/utils/search_text.ts packages/ttt-api/tests/unit/search_text.spec.ts
git commit -m "feat: add shared search text normalization"
```

---

## Task 2 : Colonne `search_name`

**Files:**
- Create: `packages/ttt-api/database/migrations/<timestamp>_add_search_name_to_guests_table.ts`
- Modify: `packages/ttt-api/app/models/guest.ts`
- Create: `packages/ttt-api/tests/functional/guest_search_name.spec.ts`

**Interfaces:**
- Consumes: `normalizeSearchText` de la tâche 1.
- Produces: la propriété `Guest.searchName: string`, toujours à jour après création ou modification. La tâche 3 filtre dessus.

- [ ] **Step 1 : Écrire le test qui échoue**

Créer `packages/ttt-api/tests/functional/guest_search_name.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { ProjectFactory } from '#database/factories/main'
import Guest from '#models/guest'

test.group('Colonne search_name', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('est remplie à la création', async ({ assert }) => {
        const project = await ProjectFactory.create()
        const guest = await Guest.create({
            projectId: project.id,
            firstName: 'José',
            lastName: 'Lefèvre',
        })

        assert.equal(guest.searchName, 'jose lefevre')
    })

    test('est mise à jour quand le nom change', async ({ assert }) => {
        const project = await ProjectFactory.create()
        const guest = await Guest.create({
            projectId: project.id,
            firstName: 'José',
            lastName: 'Lefèvre',
        })

        guest.merge({ lastName: 'Durand' })
        await guest.save()

        assert.equal(guest.searchName, 'jose durand')
    })
})
```

- [ ] **Step 2 : Lancer le test et vérifier qu'il échoue**

Depuis `packages/ttt-api` : `node ace test functional --files=guest_search_name`
Attendu : ÉCHEC, `searchName` est `undefined`.

- [ ] **Step 3 : Créer la migration**

Depuis `packages/ttt-api` : `node ace make:migration add_search_name_to_guests_table`

Puis remplacer intégralement le contenu du fichier généré par :

```ts
import { BaseSchema } from '@adonisjs/lucid/schema'
import { normalizeSearchText } from '#utils/search_text'

export default class extends BaseSchema {
    protected tableName = 'guests'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('search_name').nullable()
            table.index(['project_id', 'search_name'], 'guests_project_search_name_index')
        })

        // Backfill : la normalisation est en JavaScript, pas en SQL, donc on
        // relit les lignes existantes plutôt que d'écrire un UPDATE calculé.
        // Le quota plafonne un projet à 150 invités, le volume reste trivial.
        this.defer(async (db) => {
            const rows = await db.from(this.tableName).select('id', 'first_name', 'last_name')

            for (const row of rows) {
                await db
                    .from(this.tableName)
                    .where('id', row.id)
                    .update({
                        search_name: normalizeSearchText(`${row.first_name} ${row.last_name}`),
                    })
            }
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropIndex(['project_id', 'search_name'], 'guests_project_search_name_index')
            table.dropColumn('search_name')
        })
    }
}
```

- [ ] **Step 4 : Ajouter la colonne et le hook au modèle**

Dans `packages/ttt-api/app/models/guest.ts`, ajouter `beforeSave` à l'import Lucid existant :

```ts
import { BaseModel, beforeCreate, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
```

Ajouter l'import de la normalisation sous les imports existants :

```ts
import { normalizeSearchText } from '#utils/search_text'
```

Déclarer la colonne juste après `dietaryRequirements` :

```ts
    /**
     * Prénom et nom normalisés (minuscules, sans accents, sans ponctuation).
     * Colonne dénormalisée : c'est sur elle que porte la recherche publique.
     * Jamais renseignée à la main, toujours par le hook ci-dessous.
     */
    @column()
    declare searchName: string
```

Et ajouter le hook à côté de `assignId` :

```ts
    @beforeSave()
    static setSearchName(guest: Guest) {
        guest.searchName = normalizeSearchText(`${guest.firstName} ${guest.lastName}`)
    }
```

- [ ] **Step 5 : Lancer la migration puis les tests**

Depuis `packages/ttt-api` :

```bash
node ace migration:run
node ace test
```

Attendu : la migration passe, les 2 nouveaux tests passent, et les 42 tests existants restent au vert.

- [ ] **Step 6 : Commit**

```bash
git add packages/ttt-api/database/migrations packages/ttt-api/app/models/guest.ts packages/ttt-api/tests/functional/guest_search_name.spec.ts
git commit -m "feat: add normalized search name column to guests"
```

---

## Task 3 : Le service de recherche publique

**Files:**
- Modify: `packages/ttt-api/app/types/guest.ts` (interface `GuestSearchResult`)
- Modify: `packages/ttt-api/app/services/guest_service.ts:101-150` (remplace `fuzzySearchByProjectId`)

**Interfaces:**
- Consumes: `tokenizeSearchQuery` (tâche 1), `Guest.searchName` (tâche 2).
- Produces:
  - `GuestService.MAX_SEARCH_RESULTS = 10`
  - `guestService.searchPublic(projectId: string, query: string)` renvoyant soit `{ error: string; status: number }`, soit `{ results: GuestSearchResult[]; tooManyMatches: boolean }`.
  - `GuestSearchResult = { firstName: string; lastName: string; fullName: string; table: { name: string; description: string | null } | null }`.

- [ ] **Step 1 : Resserrer le type public**

Dans `packages/ttt-api/app/types/guest.ts`, remplacer intégralement le bloc `GuestSearchResult` existant par :

```ts
/**
 * Forme renvoyée par la recherche publique. Volontairement minimale : cette
 * route n'est pas authentifiée. Ni `id`, ni `email`, ni
 * `dietaryRequirements` — voir spec §6.3.
 */
export interface GuestSearchResult {
    firstName: string
    lastName: string
    fullName: string
    table: {
        name: string
        description: string | null
    } | null
}
```

- [ ] **Step 2 : Remplacer la méthode du service**

Dans `packages/ttt-api/app/services/guest_service.ts`, ajouter aux imports du haut de fichier :

```ts
import { tokenizeSearchQuery } from '#utils/search_text'
import type { GuestSearchResult } from '#types/guest'
```

Puis remplacer intégralement la méthode `fuzzySearchByProjectId` (lignes 101 à 150) par :

```ts
    /**
     * Plafond de résultats. Au-delà, on ne renvoie rien : sans ce plafond,
     * taper « a » retournerait la moitié des invités d'un mariage en une seule
     * requête, ce qui est exactement l'énumération que la spec §6.3 interdit.
     */
    public static MAX_SEARCH_RESULTS = 10

    /**
     * Recherche publique, non authentifiée. Renvoie toujours un tableau.
     */
    public async searchPublic(projectId: string, query: string) {
        const project = await Project.query()
            .where('id', projectId)
            .andWhere('isActive', true)
            .first()

        if (!project) {
            return { error: 'Projet introuvable', status: 404 }
        }

        const tokens = tokenizeSearchQuery(query)
        if (tokens.length === 0) {
            return { results: [] as GuestSearchResult[], tooManyMatches: false }
        }

        // On demande une ligne de plus que le plafond : c'est ce qui permet de
        // savoir qu'il y en a trop sans compter la totalité.
        const guests = await Guest.query()
            .select('id', 'first_name', 'last_name', 'table_id')
            .where('projectId', project.id)
            .where((builder) => {
                // `search_name` est déjà en minuscules et sans accent, donc un
                // LIKE simple suffit — pas besoin d'ILIKE ni d'unaccent.
                for (const token of tokens) {
                    builder.andWhere('searchName', 'LIKE', `%${token}%`)
                }
            })
            .preload('table')
            .limit(GuestService.MAX_SEARCH_RESULTS + 1)

        if (guests.length > GuestService.MAX_SEARCH_RESULTS) {
            return { results: [] as GuestSearchResult[], tooManyMatches: true }
        }

        return {
            results: guests.map((guest) => this.toSearchResult(guest)),
            tooManyMatches: false,
        }
    }

    /**
     * Projection explicite. Ne jamais remplacer par `guest.serialize()` : c'est
     * précisément ce qui faisait fuiter l'email et le régime alimentaire.
     */
    private toSearchResult(guest: Guest): GuestSearchResult {
        return {
            firstName: guest.firstName,
            lastName: guest.lastName,
            fullName: guest.fullName,
            table: guest.table
                ? { name: guest.table.name, description: guest.table.description }
                : null,
        }
    }
```

- [ ] **Step 3 : Vérifier que rien d'autre n'appelle l'ancienne méthode**

```bash
grep -rn "fuzzySearchByProjectId" packages/
```

Attendu : uniquement `packages/ttt-api/app/controllers/guests_controller.ts`, corrigé à la tâche 4.

- [ ] **Step 4 : Commit**

```bash
git add packages/ttt-api/app/types/guest.ts packages/ttt-api/app/services/guest_service.ts
git commit -m "refactor: return a result list from public guest search"
```

---

## Task 4 : Contrôleur, validateur et route durcie

**Files:**
- Modify: `packages/ttt-api/app/validators/guest.ts`
- Modify: `packages/ttt-api/app/controllers/guests_controller.ts:113-131`
- Modify: `packages/ttt-api/start/routes.ts:13-17`
- Create: `packages/ttt-api/tests/functional/guest_search.spec.ts`

**Interfaces:**
- Consumes: `guestService.searchPublic` (tâche 3).
- Produces: `GET /api/projects/:id/guests/search?q=...` renvoyant `200 { message, data: GuestSearchResult[], tooManyMatches: boolean }`. La tâche 6 consomme ce contrat.

- [ ] **Step 1 : Écrire les tests qui échouent**

Créer `packages/ttt-api/tests/functional/guest_search.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { ProjectFactory, TableFactory, GuestFactory } from '#database/factories/main'
import { GuestService } from '#services/guest_service'

test.group('Recherche publique d\'invités', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('une requête trop courte est refusée', async ({ client }) => {
        const project = await ProjectFactory.create()

        const response = await client.get(`/api/projects/${project.id}/guests/search?q=a`)

        response.assertStatus(422)
    })

    test('une requête absente est refusée', async ({ client }) => {
        const project = await ProjectFactory.create()

        const response = await client.get(`/api/projects/${project.id}/guests/search`)

        response.assertStatus(422)
    })

    test('un projet inexistant renvoie 404', async ({ client }) => {
        const response = await client.get(
            '/api/projects/00000000-0000-0000-0000-000000000000/guests/search?q=martin'
        )

        response.assertStatus(404)
    })

    test('un projet inactif renvoie 404', async ({ client }) => {
        const project = await ProjectFactory.merge({ isActive: false }).create()
        await GuestFactory.merge({
            projectId: project.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const response = await client.get(`/api/projects/${project.id}/guests/search?q=martin`)

        response.assertStatus(404)
    })

    test('un seul invité correspondant renvoie un tableau d\'un élément', async ({
        client,
        assert,
    }) => {
        const project = await ProjectFactory.create()
        const table = await TableFactory.merge({
            projectId: project.id,
            name: 'Table 4',
            description: 'Près de la piste',
        }).create()
        await GuestFactory.merge({
            projectId: project.id,
            tableId: table.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const response = await client.get(`/api/projects/${project.id}/guests/search?q=martin`)

        response.assertStatus(200)
        assert.lengthOf(response.body().data, 1)
        assert.deepEqual(response.body().data[0], {
            firstName: 'Martin',
            lastName: 'Dupont',
            fullName: 'Martin Dupont',
            table: { name: 'Table 4', description: 'Près de la piste' },
        })
        assert.isFalse(response.body().tooManyMatches)
    })

    test('deux homonymes renvoient deux résultats, jamais une erreur', async ({
        client,
        assert,
    }) => {
        const project = await ProjectFactory.create()
        await GuestFactory.merge({
            projectId: project.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()
        await GuestFactory.merge({
            projectId: project.id,
            firstName: 'Martin',
            lastName: 'Duval',
        }).create()

        const response = await client.get(`/api/projects/${project.id}/guests/search?q=martin`)

        response.assertStatus(200)
        assert.lengthOf(response.body().data, 2)
    })

    test('la recherche ignore les accents dans les deux sens', async ({ client, assert }) => {
        const project = await ProjectFactory.create()
        await GuestFactory.merge({
            projectId: project.id,
            firstName: 'José',
            lastName: 'Lefèvre',
        }).create()

        const sansAccent = await client.get(`/api/projects/${project.id}/guests/search?q=jose`)
        const avecAccent = await client.get(`/api/projects/${project.id}/guests/search?q=LEFÈVRE`)

        assert.lengthOf(sansAccent.body().data, 1)
        assert.lengthOf(avecAccent.body().data, 1)
    })

    test('l\'ordre des mots est indifférent', async ({ client, assert }) => {
        const project = await ProjectFactory.create()
        await GuestFactory.merge({
            projectId: project.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const response = await client.get(
            `/api/projects/${project.id}/guests/search?q=dupont%20martin`
        )

        assert.lengthOf(response.body().data, 1)
    })

    test('un invité sans table renvoie table null', async ({ client, assert }) => {
        const project = await ProjectFactory.create()
        await GuestFactory.merge({
            projectId: project.id,
            tableId: null,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const response = await client.get(`/api/projects/${project.id}/guests/search?q=martin`)

        assert.isNull(response.body().data[0].table)
    })

    test('la recherche ne sort pas du projet', async ({ client, assert }) => {
        const projetA = await ProjectFactory.create()
        const projetB = await ProjectFactory.create()
        await GuestFactory.merge({
            projectId: projetB.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const response = await client.get(`/api/projects/${projetA.id}/guests/search?q=martin`)

        response.assertStatus(200)
        assert.lengthOf(response.body().data, 0)
    })

    test('au-delà du plafond, aucun résultat n\'est renvoyé', async ({ client, assert }) => {
        const project = await ProjectFactory.create()
        await GuestFactory.merge({ projectId: project.id, lastName: 'Martin' }).createMany(
            GuestService.MAX_SEARCH_RESULTS + 1
        )

        const response = await client.get(`/api/projects/${project.id}/guests/search?q=martin`)

        response.assertStatus(200)
        assert.lengthOf(response.body().data, 0)
        assert.isTrue(response.body().tooManyMatches)
    })

    test('la réponse ne contient jamais email ni régime alimentaire', async ({
        client,
        assert,
    }) => {
        const project = await ProjectFactory.create()
        await GuestFactory.merge({
            projectId: project.id,
            firstName: 'Martin',
            lastName: 'Dupont',
            email: 'martin.dupont@example.com',
            dietaryRequirements: 'Allergie aux arachides',
        }).create()

        const response = await client.get(`/api/projects/${project.id}/guests/search?q=martin`)

        const corps = JSON.stringify(response.body())
        assert.notInclude(corps, 'martin.dupont@example.com')
        assert.notInclude(corps, 'Allergie aux arachides')
        assert.doesNotHaveAnyKeys(response.body().data[0], [
            'email',
            'dietaryRequirements',
            'id',
            'projectId',
        ])
    })
})
```

- [ ] **Step 2 : Lancer les tests et vérifier qu'ils échouent**

Depuis `packages/ttt-api` : `node ace test functional --files=guest_search`
Attendu : ÉCHEC — l'ancien contrat renvoie un objet, pas un tableau.

- [ ] **Step 3 : Ajouter le validateur**

Dans `packages/ttt-api/app/validators/guest.ts`, ajouter à la fin du fichier :

```ts
/**
 * Le minimum de 2 caractères n'est pas cosmétique : il empêche l'énumération
 * lettre par lettre de la liste d'invités sur une route non authentifiée.
 */
export const searchGuestsValidator = vine.compile(
    vine.object({
        q: vine.string().trim().minLength(2).maxLength(80),
    })
)
```

- [ ] **Step 4 : Remplacer la méthode du contrôleur**

Dans `packages/ttt-api/app/controllers/guests_controller.ts`, ajouter `searchGuestsValidator` à l'import des validateurs :

```ts
import {
    createGuestValidator,
    updateGuestValidator,
    assignGuestValidator,
    searchGuestsValidator,
} from '#validators/guest'
```

Puis remplacer intégralement la méthode `fuzzySearchInProject` par :

```ts
    /**
     * Route publique, non authentifiée : aucun bouncer ici, par conception.
     * Le durcissement est ailleurs — validation de `q`, projet actif seulement,
     * projection stricte des champs, et rate limit sur la route.
     */
    public async search({ params, request, response }: HttpContext) {
        const { q } = await request.validateUsing(searchGuestsValidator, {
            data: request.qs(),
        })

        const result = await this.guestService.searchPublic(params.id, q)
        if ('error' in result) {
            return response.status(result.status).json({ message: result.error })
        }

        return response.status(200).json({
            message: 'Résultats de la recherche',
            data: result.results,
            tooManyMatches: result.tooManyMatches,
        })
    }
```

- [ ] **Step 5 : Mettre la route à jour**

Dans `packages/ttt-api/start/routes.ts`, remplacer le bloc « Fuzzy Search Routes » par :

```ts
        // Recherche publique : c'est l'écran que voient les invités après avoir
        // scanné le QR code. Volontairement hors du groupe authentifié.
        router.get('/projects/:id/guests/search', '#controllers/guests_controller.search')
```

- [ ] **Step 6 : Lancer toute la suite**

Depuis `packages/ttt-api` : `node ace test`
Attendu : les 12 nouveaux tests passent et les 44 précédents restent au vert.

- [ ] **Step 7 : Commit**

```bash
git add packages/ttt-api/app/validators/guest.ts packages/ttt-api/app/controllers/guests_controller.ts packages/ttt-api/start/routes.ts packages/ttt-api/tests/functional/guest_search.spec.ts
git commit -m "feat: harden public guest search endpoint"
```

---

## Task 5 : Rate limit

**Files:**
- Modify: `packages/ttt-api/package.json` (dépendance)
- Create: `packages/ttt-api/config/limiter.ts`
- Create: `packages/ttt-api/start/limiter.ts`
- Modify: `packages/ttt-api/adonisrc.ts` (provider + preload)
- Modify: `packages/ttt-api/start/routes.ts`
- Create: `packages/ttt-api/tests/functional/guest_search_throttle.spec.ts`

**Interfaces:**
- Consumes: la route de la tâche 4.
- Produces: `publicSearchThrottle`, exporté depuis `#start/limiter.js`, appliqué à la route publique.

- [ ] **Step 1 : Installer et configurer le paquet**

Depuis `packages/ttt-api` :

```bash
npm install @adonisjs/limiter@^2.4.0
node ace configure @adonisjs/limiter
```

Répondre **`memory`** quand la commande demande quels stores activer. Ne pas sélectionner `redis` : le projet l'exclut.

- [ ] **Step 2 : Vérifier la configuration générée**

Ouvrir `packages/ttt-api/config/limiter.ts` et s'assurer que `default` vaut `'memory'` et que `stores` ne contient que `memory`. Si la commande a écrit autre chose, corriger le fichier pour qu'il ressemble à :

```ts
import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/limiter'

const limiterConfig = defineConfig({
    default: 'memory',
    stores: {
        memory: stores.memory({}),
    },
})

export default limiterConfig

declare module '@adonisjs/limiter/types' {
    export interface LimitersList extends InferLimiters<typeof limiterConfig> {}
}
```

Si `env` n'est pas utilisé dans le fichier final, supprimer son import — `npm run lint` le refuserait.

Vérifier aussi que `adonisrc.ts` contient bien le provider `@adonisjs/limiter/limiter_provider` et le preload `#start/limiter`, ajoutés par la commande.

- [ ] **Step 3 : Définir le throttle**

Remplacer le contenu de `packages/ttt-api/start/limiter.ts` par :

```ts
import limiter from '@adonisjs/limiter/services/main'

/**
 * 60 requêtes par minute et par adresse IP.
 *
 * Le chiffre est calibré sur la réalité du jour J, pas sur la théorie : une
 * salle de réception, c'est un wifi derrière un seul NAT, donc 120 invités qui
 * cherchent leur table en dix minutes arrivent tous avec la même IP. Un seuil
 * serré bloquerait le mariage entier.
 *
 * C'est donc un frein anti-abus, pas une barrière étanche. Les vrais remparts
 * contre l'énumération sont le minimum de 2 caractères sur `q` et le plafond
 * de 10 résultats.
 */
export const publicSearchThrottle = limiter.define('publicSearch', () => {
    return limiter.allowRequests(60).every('1 minute')
})
```

- [ ] **Step 4 : Appliquer le throttle à la route**

Dans `packages/ttt-api/start/routes.ts`, ajouter l'import en haut du fichier :

```ts
import { publicSearchThrottle } from '#start/limiter'
```

Puis attacher le middleware à la route publique :

```ts
        // Recherche publique : c'est l'écran que voient les invités après avoir
        // scanné le QR code. Volontairement hors du groupe authentifié.
        router
            .get('/projects/:id/guests/search', '#controllers/guests_controller.search')
            .use(publicSearchThrottle)
```

- [ ] **Step 5 : Écrire le test de throttle**

Ce test est dans son **propre fichier** parce qu'il épuise volontairement le compteur : mélangé aux autres, il les ferait échouer.

Créer `packages/ttt-api/tests/functional/guest_search_throttle.spec.ts` :

```ts
import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import { ProjectFactory, GuestFactory } from '#database/factories/main'

test.group('Rate limit de la recherche publique', (group) => {
    group.each.setup(() => testUtils.db().truncate())
    group.each.teardown(() => limiter.clear())

    test('au-delà de 60 requêtes par minute, la recherche renvoie 429', async ({ client }) => {
        const project = await ProjectFactory.create()
        await GuestFactory.merge({
            projectId: project.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const url = `/api/projects/${project.id}/guests/search?q=martin`

        for (let i = 0; i < 60; i++) {
            const autorisee = await client.get(url)
            autorisee.assertStatus(200)
        }

        const refusee = await client.get(url)
        refusee.assertStatus(429)
    })
}).tags(['throttle'])
```

Si `limiter.clear()` n'existe pas dans la version installée, vérifier la surface exacte de l'API :

```bash
grep -n "clear" packages/ttt-api/node_modules/@adonisjs/limiter/build/src/limiter_manager.d.ts
```

et utiliser la méthode équivalente qu'expose le manager.

- [ ] **Step 6 : Lancer toute la suite**

Depuis `packages/ttt-api` : `node ace test`
Attendu : tout au vert, y compris le 429. Si un autre test échoue en 429, c'est que le teardown ne vide pas le store — corriger avant de continuer.

- [ ] **Step 7 : Commit**

```bash
git add packages/ttt-api/package.json packages/ttt-api/package-lock.json packages/ttt-api/config/limiter.ts packages/ttt-api/start/limiter.ts packages/ttt-api/adonisrc.ts packages/ttt-api/start/routes.ts packages/ttt-api/tests/functional/guest_search_throttle.spec.ts
git commit -m "feat: rate limit the public guest search route"
```

---

## Task 6 : Le front — champ libre et liste de résultats

**Files:**
- Modify: `packages/ttt-web/src/services/guestsService.ts:17-24`
- Modify: `packages/ttt-web/src/components/forms/SearchForm.tsx` (réécriture)
- Modify: `packages/ttt-web/src/pages/GuestSearchPage.tsx` (réécriture)

**Interfaces:**
- Consumes: `GET /api/projects/:id/guests/search?q=...` (tâche 4).
- Produces: rien pour les tâches suivantes.

- [ ] **Step 1 : Remplacer la méthode du service**

Dans `packages/ttt-web/src/services/guestsService.ts`, ajouter en haut du fichier, sous les `interface` existantes :

```ts
export interface GuestSearchResult {
    firstName: string;
    lastName: string;
    fullName: string;
    table: {
        name: string;
        description: string | null;
    } | null;
}

interface GuestSearchResponse {
    message: string;
    data: GuestSearchResult[];
    tooManyMatches: boolean;
}
```

Puis remplacer intégralement la méthode `getGuestTable` par :

```ts
    async searchGuests(projectId: string, q: string): Promise<GuestSearchResponse> {
        return await api.get<GuestSearchResponse>(
            `/api/projects/${projectId}/guests/search?q=${encodeURIComponent(q)}`
        );
    },
```

Supprimer l'import `Email` s'il n'est plus utilisé ailleurs dans le fichier :

```bash
grep -n "Email" packages/ttt-web/src/services/guestsService.ts
```

- [ ] **Step 2 : Réécrire le formulaire**

Remplacer intégralement `packages/ttt-web/src/components/forms/SearchForm.tsx` par :

```tsx
import {type FormEvent, useState} from "react";
import {Input} from "@/components/ui/inputs/Input.tsx";
import Button from "@/components/ui/buttons/Button.tsx";
import {guestsService, type GuestSearchResult} from "@/services/guestsService.ts";
import {useToast} from "@/stores/useToastStore.ts";
import type {UUID} from "ttt-api/app/types";
import {ApiError} from "@/utils/apiClient.ts";

interface SearchFormProps {
    projectId: UUID | string | undefined;
    onResults: (results: GuestSearchResult[], tooManyMatches: boolean) => void;
}

const SearchForm = ({projectId, onResults}: SearchFormProps) => {
    const toast = useToast();
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!projectId) {
            toast.error('Aucun mariage sélectionné.');
            return;
        }
        if (query.trim().length < 2) {
            toast.warning('Entrez au moins deux lettres de votre nom.');
            return;
        }

        setLoading(true);
        try {
            const response = await guestsService.searchGuests(projectId, query.trim());
            onResults(response.data, response.tooManyMatches);
        } catch (error) {
            if (error instanceof ApiError && error.status === 429) {
                toast.warning('Trop de recherches d\'un coup. Réessayez dans une minute.');
            } else if (error instanceof ApiError) {
                toast.error(error.message);
            } else {
                toast.error('Une erreur est survenue lors de la recherche.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className={'search-table-form'}>
            <Input
                id={'input-guest-name'}
                placeholder={'Votre nom'}
                value={query}
                leftIcon={'user'}
                onChange={(value) => setQuery(value)}
                label={'Votre nom'}
                required
            />
            <Button type={'submit'} icon={'search'} disabled={loading}>
                {loading ? 'Recherche…' : 'Rechercher'}
            </Button>
        </form>
    );
};

export default SearchForm;
```

- [ ] **Step 3 : Réécrire la page**

Remplacer intégralement `packages/ttt-web/src/pages/GuestSearchPage.tsx` par :

```tsx
import {useParams} from "react-router";
import '@/assets/styles/searchTable/index.css';
import SearchForm from "@/components/forms/SearchForm.tsx";
import {useState} from "react";
import Modal from "@/components/ui/modals/Modal.tsx";
import Button from "@/components/ui/buttons/Button.tsx";
import {DynamicIcon} from "lucide-react/dynamic";
import type {GuestSearchResult} from "@/services/guestsService.ts";

const GuestSearchPage = () => {
    const {projectId} = useParams();
    const [helpVisible, setHelpVisible] = useState<boolean>(false);
    const [results, setResults] = useState<GuestSearchResult[]>([]);
    const [tooManyMatches, setTooManyMatches] = useState<boolean>(false);
    const [searched, setSearched] = useState<boolean>(false);
    const [selected, setSelected] = useState<GuestSearchResult | null>(null);

    const handleResults = (found: GuestSearchResult[], tooMany: boolean) => {
        setResults(found);
        setTooManyMatches(tooMany);
        setSearched(true);
        // Un seul résultat : on ouvre directement, personne n'a envie de
        // cliquer sur une liste d'un élément.
        setSelected(found.length === 1 ? found[0] : null);
    };

    return (
        <div className="search-table-container">
            <div className="card search-table-card">
                <div className="flex flex-direction-column text-center mb-4">
                    <h1>Trouve ta table</h1>
                    <p className="text-muted">Entrez votre nom pour découvrir votre placement</p>
                </div>

                <SearchForm projectId={projectId} onResults={handleResults}/>

                {searched && tooManyMatches && (
                    <p className="text-muted text-center">
                        Trop de noms correspondent. Ajoutez quelques lettres de votre nom de famille.
                    </p>
                )}

                {searched && !tooManyMatches && results.length === 0 && (
                    <p className="text-muted text-center">
                        Aucun nom ne correspond. Essayez une autre orthographe, ou demandez à
                        l'accueil.
                    </p>
                )}

                {results.length > 1 && (
                    <div className="flex flex-direction-column gap-2">
                        <p className="text-muted text-center">Plusieurs personnes portent ce nom :</p>
                        {results.map((result, index) => (
                            <Button
                                key={`${result.fullName}-${index}`}
                                variant="btn-secondary"
                                onClick={() => setSelected(result)}
                            >
                                {result.fullName}
                                {result.table ? ` · ${result.table.name}` : ''}
                            </Button>
                        ))}
                    </div>
                )}

                <Button onClick={() => setHelpVisible(true)} variant="btn-secondary">
                    Comment ça marche ?
                </Button>

                <Modal
                    header={<h2>Comment ça marche ?</h2>}
                    body={
                        <div>
                            <p>Entrez votre nom, en entier ou en partie, dans le champ ci-dessus.</p>
                            <p>Si plusieurs personnes portent le même nom, choisissez la vôtre dans
                                la liste.</p>
                            <p>Si vous ne vous trouvez pas, adressez-vous à l'accueil.</p>
                        </div>
                    }
                    isOpen={helpVisible}
                    onClose={() => setHelpVisible(false)}
                />

                <Modal
                    header={<h2>Trouvée !</h2>}
                    body={
                        selected ? (
                            <>
                                <div className="flex flex-direction-column gap-2 p-h-2 p-v-3 bg-secondary">
                                    <div className="flex flex-direction-row items-center gap-2">
                                        <DynamicIcon name="user" size={20}/>
                                        <p>{selected.fullName}</p>
                                    </div>

                                    {selected.table ? (
                                        <>
                                            <div className="flex flex-direction-row items-center gap-2">
                                                <DynamicIcon name="table" size={20}/>
                                                <p>{selected.table.name}</p>
                                            </div>
                                            {selected.table.description && (
                                                <div className="flex flex-direction-row items-center gap-2">
                                                    <DynamicIcon name="map-pin" size={20}/>
                                                    <p>{selected.table.description}</p>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <p>Vous n'êtes pas encore assigné à une table.</p>
                                    )}
                                </div>
                                <p className="text-muted text-center">
                                    Dirigez-vous vers votre table et profitez de la soirée !
                                </p>
                            </>
                        ) : (
                            <p>Aucune information disponible</p>
                        )
                    }
                    isOpen={selected !== null}
                    onClose={() => setSelected(null)}
                />
            </div>
        </div>
    );
};

export default GuestSearchPage;
```

- [ ] **Step 4 : Vérifier qu'aucun appelant de l'ancienne méthode ne subsiste**

```bash
grep -rn "getGuestTable\|setResultModalVisible\|setGuestResult" packages/ttt-web/src
```

Attendu : aucun résultat.

- [ ] **Step 5 : Construire le front**

Depuis `packages/ttt-web` : `npm run build`
Attendu : build réussi (l'avertissement de taille de chunk est préexistant et acceptable).

- [ ] **Step 6 : Commit**

```bash
git add packages/ttt-web/src/services/guestsService.ts packages/ttt-web/src/components/forms/SearchForm.tsx packages/ttt-web/src/pages/GuestSearchPage.tsx
git commit -m "feat: search guests with a single free text field"
```

---

## Task 7 : Portes de qualité et mise à jour de la documentation

**Files:**
- Modify: `docs/suites-a-donner.md`

- [ ] **Step 1 : Passer toutes les portes de qualité**

```bash
cd packages/ttt-api && npm test
cd ../.. && npx tsc --noEmit
cd packages/ttt-api && npm run lint
cd ../ttt-web && npm run build
```

Attendu : les quatre commandes réussissent. Corriger tout échec avant de continuer.

- [ ] **Step 2 : Vérifier manuellement le parcours**

Avec la stack Docker en marche, ouvrir `/search/<id d'un projet actif>` sur un viewport mobile (375 px) et vérifier : un nom unique ouvre directement la modale ; deux homonymes affichent la liste ; un nom inconnu affiche le message d'aide ; une seule lettre est refusée côté client.

- [ ] **Step 3 : Retirer les points traités de la liste des suites**

Dans `docs/suites-a-donner.md`, section « À traiter par le plan « parcours invité » », supprimer les deux premières puces (recherche publique non durcie, contrat de recherche encore l'ancien) ainsi que la puce sur `GuestSearchResult` écrit en anticipation — le type est désormais utilisé. Conserver la puce sur la page `/search/:projectId` sans chemin d'accès : elle reste vraie tant que le QR code n'est pas généré.

Ajouter à la section « Dette technique, sans plan assigné » :

```markdown
- **Le rate limit de la recherche publique est en mémoire et par IP.** Il ne
  survit pas à un redémarrage et ne se partage pas entre instances. Sans effet
  sur un déploiement mono-instance, à revoir le jour où l'API est répliquée.
- **`@adonisjs/limiter` est bloqué en 2.4.0** : la 3.x exige `@adonisjs/core`
  v7. À intégrer au chantier de montée AdonisJS 7.
```

- [ ] **Step 4 : Commit**

```bash
git add docs/suites-a-donner.md
git commit -m "docs: close public search follow-ups"
```

---

## Auto-revue du plan

**Couverture de la spec :**

| Exigence | Tâche |
|---|---|
| §6.1 — l'endpoint renvoie toujours un tableau | 3, 4 |
| §6.1 — zéro résultat produit un message d'aide, pas un échec | 6 |
| §6.2 — champ libre unique, plus de syntaxe `+` | 4, 6 |
| §6.2 — insensible à la casse et aux accents, normalisation NFD conservée | 1, 2 |
| §6.3 — jamais d'email, jamais le régime alimentaire d'autrui | 3, 4 (test dédié sur le corps de réponse) |
| §6.3 — rate limit | 5 |
| §6.3 — ouvert seulement si `isActive` | 3, 4 |

**Écarts assumés par rapport au design, tous validés en amont :**

1. Le régime alimentaire disparaît de l'écran invité (§6.5 le conservait). Décision prise pendant le cadrage : c'est la seule façon de respecter §6.3 sans second aller-retour réseau le jour J.
2. `GuestSearchResult` perd son champ `id`, que la spec §6.3 n'autorise pas et dont plus rien n'a besoin.
3. Une requête invalide renvoie 422, pas 400 — cohérence avec le reste de l'API.
4. Ajout non prévu par la spec : le plafond de 10 résultats et le drapeau `tooManyMatches`. Sans lui, une requête d'une lettre énumère la moitié d'un mariage, ce que le rate limit seul n'empêche pas.

**Cohérence des types :** `GuestSearchResult` est déclaré à la tâche 3 (`firstName`, `lastName`, `fullName`, `table: { name, description } | null`), redéclaré à l'identique côté web à la tâche 6, et vérifié champ par champ par le test de la tâche 4.
