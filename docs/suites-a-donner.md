# Suites à donner — après le plan « fondations »

> Extrait du journal d'exécution du plan `2026-08-27-fondations-amputation-et-socle`.
> Aucun de ces points n'est bloquant : la revue globale de branche a conclu « prête à fusionner ».
> Ils sont classés par le plan qui devrait logiquement les absorber.

## À traiter par le plan « parcours invité »

- **La page `/search/:projectId` existe et fonctionne**, mais n'a aucun chemin d'accès tant que la génération de QR code n'est pas faite. Volontairement non documentée dans le README.

## À traiter par le plan « import tableur »

- **`projects.event_date` est une colonne Postgres `date`** (jour calendaire seul) alors que le modèle la déclare `@column.dateTime()`. L'API fabrique une heure et un fuseau pour une donnée qui n'en a pas. Sans conséquence aujourd'hui, mais l'import lira des dates depuis des fichiers.
- `app/types/guest.ts` contient déjà `ImportGuestsPayload`, écrit en anticipation et jamais utilisé.
- **Le quota a une course théorique** entre la lecture du compte et l'insertion. Acceptable pour un garde-fou anti-abus ; à revoir si l'import crée des invités en lot.

## À traiter par le plan « mise en ligne »

- **Vérifier le comportement du cookie de session en cross-origin.** C'est le risque numéro un de la suppression du JWT, et il n'est prouvable qu'avec un vrai navigateur sur de vrais domaines. L'aller-retour a été vérifié manuellement en local, pas en cross-site. Spec §8.
- **Confirmer que le mode production ne renvoie pas de traces d'erreur.** En développement, l'API renvoie les frames de pile et les chemins de fichiers. Le code est correct (`debug = !app.inProduction`) et `docker-compose.yml` pose `NODE_ENV=production`, mais ça n'a jamais été constaté sur un environnement de production réel.
- **Durée de session à 2 h** dans `config/session.ts`, trop court pour un couple qui construit son plan sur plusieurs semaines. Spec §8 prévoit 30 jours.
- **Origines CORS en dur** sur `localhost` dans `config/cors.ts`, à passer en variable d'environnement. Spec §8.

- **Écrire une vraie page d'accueil, soignée sur mobile comme sur desktop.**
  `packages/ttt-web/src/App.tsx` est encore le placeholder généré par Vite
  (« Welcome to the TTT Web App »), et c'est la route `/` publique — donc ce que
  voit toute personne arrivant sur le site. Bloquant pour le jalon « en ligne et
  utilisable ». Spec §8.

  Quelques points à garder en tête au moment de la faire :

  - **Le mobile n'est pas le cas secondaire, c'est le cas principal.** Le parcours
    invité se joue intégralement au téléphone : quelqu'un scanne un QR code dans le
    hall d'une salle de réception, souvent en réseau saturé, avec 120 personnes qui
    font la même chose en dix minutes. La page d'accueil doit être irréprochable sur
    petit écran avant de l'être sur grand.
  - **Le design system maison existe déjà** : environ 22 composants dans
    `src/components/ui/` (boutons, cartes, champs, modales, toasts), plus un thème
    sombre/clair. C'est un actif du projet — construire la page avec, plutôt que
    d'introduire une librairie tierce ou des styles ad hoc.
  - **Ne rien promettre qui n'existe pas.** Même exigence que pour le README : pas
    de QR code ni d'import de tableur tant qu'ils ne sont pas implémentés. Une
    landing qui vend des fonctionnalités absentes reproduit le défaut qu'on vient de
    corriger.
  - Le public visé est **un couple qui prépare son mariage**, pas un développeur ni
    une entreprise. Le vocabulaire, les visuels et la promesse doivent lui parler à
    lui.

## Dette technique, sans plan assigné

- **17 violations réelles des règles React Compiler** dans 14 fichiers du front, révélées par `eslint-plugin-react-hooks` v7 puis masquées par le revert de ce bump. Jamais examinées — potentiellement de vrais bugs de hooks.
- **Requête dupliquée par écriture** : les contrôleurs chargent l'entité pour autoriser, puis le service la recharge. Inefficacité, pas un bug ; la résoudre demande un changement de signature.
- **Oracle d'existence** dans `guest_service.assignToTable` : 404 pour une table inexistante, 400 pour une table d'un autre projet. Laisse un appelant authentifié sonder l'existence d'un identifiant de table.
- **Deux tests ne peuvent pas échouer** : celui de la date sans heure en environnement UTC, et celui de l'invité sans email qui omet la clé au lieu de passer `null`.
- `tests/functional/removed_endpoints.spec.ts` n'assert que des codes de statut, jamais les corps de réponse.
- **Le rate limit de la recherche publique est en mémoire et par IP.** Il ne
  survit pas à un redémarrage et ne se partage pas entre instances. Sans effet
  sur un déploiement mono-instance, à revoir le jour où l'API est répliquée.
- **`@adonisjs/limiter` est bloqué en 2.4.0** : la 3.x exige `@adonisjs/core`
  v7. À intégrer au chantier de montée AdonisJS 7.

## Chantier isolé : montée vers AdonisJS 7

Volontairement écartée du plan « fondations », dont une contrainte était « pas de
changement de framework ». À traiter **après la mise en ligne**, sur sa propre branche.

Documentation : <https://docs.adonisjs.com> — guide de migration v6 → v7 à préciser.

### Ce qui est en attente

| Paquet | Actuel | Cible |
|---|---|---|
| `@adonisjs/core` | 6.21.0 | 7.5.0 |
| `@adonisjs/auth` | 9.6.0 | 10.1.0 |
| `@adonisjs/lucid` | 21.8.2 | 22.4.2 |
| `@adonisjs/session` | 7.7.1 | 8.1.0 |
| `@adonisjs/bouncer` | 3.1.6 | 4.0.1 |
| `@adonisjs/cors` | 2.2.1 | 3.0.0 |
| `@adonisjs/assembler` | 7.8.2 | 8.5.0 |
| `@japa/runner` | 4.5.0 | 5.3.0 |
| `@japa/plugin-adonisjs` | 4.0.0 | 5.2.0 |

Les paquets `@japa/*` dépendent transitivement de `core` v7 : la montée se fait **en
bloc**, elle ne se découpe pas.

### Pourquoi après la mise en ligne, et pas avant

- `@adonisjs/auth` v10 et `@adonisjs/session` v8 touchent exactement le mécanisme sur
  lequel repose toute l'authentification depuis la suppression du JWT. Et le
  comportement du cookie en cross-origin est précisément le seul point que les tests
  ne couvrent pas.
- Enchaîner une montée de framework majeure juste après une refonte de
  l'autorisation rend tout échec indiagnosticable : montée ou refactor ? C'est la
  raison pour laquelle la montée de versions était la tâche 2 du plan et pas la 9.
- Les 42 tests et une application qui tourne sont le filet qui rend cette migration
  vérifiable. Ils n'existaient pas avant ce plan.

### Deux majeures écartées pour d'autres raisons

- **TypeScript 5.9 → 7** : tenté puis reverté pendant le plan. La réécriture native
  (`tsgo`) casse `tsc` ici — `baseUrl` supprimé côté web, typage des `catch` plus
  strict côté API.
- **Vite 7 → 8**, avec `@vitejs/plugin-react` 4 → 6 qui en dépend. Sans lien avec
  AdonisJS, à traiter séparément.
