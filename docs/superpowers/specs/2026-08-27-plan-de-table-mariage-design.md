# Trouve Ta Table — Recentrage produit : plan de table pour mariages

**Date :** 2026-08-27
**Statut :** validé, prêt pour plan d'implémentation
**Approche retenue :** C — réduire la surface, puis construire la verticale invité

---

## 1. Contexte

Le projet a été écrit à la main début 2026 puis laissé de côté. Il est repris avec
l'objectif d'en faire un produit réel utilisé par de vrais couples, et non une
vitrine technique.

Le code existant décrit un plan de table pour événements : `Project(eventType,
eventDate, venue)` → `Table(capacity)` → `Guest(dietaryRequirements, tableId)`, avec
assignation d'invités et recherche publique. Le README, lui, décrit un produit de
réservation de tables de restaurant avec analytics et temps réel. **Le README ne
décrit pas le produit** et sera réécrit.

Un audit du code a relevé cinq défauts structurants, traités dans cette spec :
JWT décoratif, IDOR généralisé sur les lectures, absence de tests, QR code non
implémenté, validation absente hors authentification.

## 2. Le produit en une phrase

> Un couple dépose son tableur de plan de table. Le jour du mariage, ses invités
> scannent un QR code à l'entrée, tapent leur nom, et voient leur table.

Cette phrase est le critère de tri de toute la spec. Ce qui ne la sert pas est
supprimé ou hors périmètre.

## 3. Décisions produit

| Décision | Choix retenu |
|---|---|
| Utilisateur cible | Les mariés eux-mêmes (particuliers, usage unique) |
| Douleur résolue | Le jour J : les invités errent devant un panneau imprimé |
| Entrée des données | Import d'un tableur existant (CSV et XLSX) |
| Écran invité | Recherche par nom → liste de résultats cliquable |
| Modèle économique | Gratuit avec limite d'invités (mécanique en place, seuil haut au premier jalon) |
| Premier jalon | En ligne, sécurisé, utilisable par n'importe quel couple |

**Conséquence structurante :** la valeur est côté jour J, pas côté construction du
plan. Trouve Ta Table n'a pas vocation à devenir un bon éditeur de plan de salle.
Le couple peut continuer à construire son plan dans son tableur. L'outil doit être
excellent sur un seul écran : un invité qui trouve sa table en dix secondes.

Le vocabulaire de l'interface parle de mariage, pas de « projet ». Le champ
`eventType` est conservé en base pour ne pas fermer la porte à d'autres types
d'événements, mais il n'est pas mis en avant.

## 4. Amputation

Critère unique : est-ce que ça sert la phrase produit ?

### Supprimé

| Élément | Justification |
|---|---|
| `users_controller`, `user_service`, routes `/api/users` | Aucun parcours ne s'en sert. Porte l'élévation de privilèges (`PATCH /users/:id` accepte `role` sans contrôle) et la fuite de la liste des comptes. |
| `GET /api/projects`, `GET /api/tables`, `GET /api/guests` (index globaux) | Renvoient les données de tous les comptes. Le front n'appelle que les variantes scopées par projet. |
| `JwtService`, `app/types` associés, `ttt-web/src/utils/jwt.ts`, dépendance `jsonwebtoken` (API et web), `JWT_SECRET` dans `start/env.ts` | Le token ne protège rien : l'authentification réelle passe par le `sessionGuard` d'AdonisJS et le cookie. Conserver les deux entretient l'illusion d'une sécurité inexistante. |
| Colonnes `subscriptionPlan` et `subscriptionExpiresAt` (migration de suppression) | Remplacées par le quota d'invités. |
| Contournement `user.role === 'admin'` dans les règles d'autorisation | Avec `users_controller` supprimé, plus rien ne permet de devenir admin. Une branche morte dans un chemin de sécurité est le pire endroit pour en avoir. La colonne `role` reste en base mais n'ouvre plus rien. |
| `DesignSystemPage` et route `/show/design` | Outil de développement exposé en production. Les composants du design system restent. |
| `silent_auth_middleware`, `guest_middleware` | Générés par AdonisJS, non utilisés. `silent_auth_middleware` n'est référencé nulle part. `guest_middleware` est enregistré comme middleware nommé dans `start/kernel.ts` mais n'est appliqué à aucune route dans `start/routes.ts` ; son entrée dans `kernel.ts` est retirée avec lui. |
| Service Redis dans `docker-compose.yml` et `docker-compose.dev.yml` | Aucune utilisation dans le code : ni `@adonisjs/redis`, ni `config/redis.ts`, ni référence. Le store de session est `cookie`. |

### Conservé

Les modèles `User`, `Project`, `Table`, `Guest` : la modélisation est juste. Le CRUD
projets / tables / invités scopé par projet. Le design system maison (environ 40
composants) : c'est un actif du projet, il n'est pas remplacé par une librairie
tierce. Les stores Zustand et les schémas Zod.

### Ajustement de modèle

`Guest.dietary_requirements` est le seul champ en `snake_case` du codebase, compensé
par un `serializeAs`. Renommé `dietaryRequirements` en base et dans le code, avec
migration et alignement du type front `Guest`.

### Effet mesuré

L'API passe de six contrôleurs à cinq et d'environ 835 lignes de contrôleurs et
services à environ 675. Sur les six accès non autorisés relevés à l'audit, quatre
disparaissent avec le code supprimé : `GET /api/projects`, `GET /api/users`,
`GET /api/guests` et l'élévation de privilèges via `PATCH /api/users/:id`. Restent à
traiter, en section 7, les lectures scopées non contrôlées (`show`,
`getProjectTables`, `getProjectGuests`) et les écritures libres (`POST /api/guests`,
`POST /api/guests/:id/assign`).

## 5. Verticale A — Import du tableur

### Décision structurante

**Le parsing se fait dans le navigateur, pas sur l'API.** Le couple dépose son
fichier, le front le parse, affiche un aperçu, et n'envoie à l'API qu'un tableau
JSON déjà normalisé.

Bénéfices : aucun upload de fichier, aucun stockage, aucun parser de tableur exposé
côté serveur. L'écran de mapping des colonnes est de toute façon une affaire de
front. L'API reçoit une liste propre et n'a qu'à valider et respecter le quota.

### Parcours

1. **Dépôt** — CSV ou XLSX. Les deux formats sont acceptés : un couple qui utilise
   Excel ou Google Sheets ne pensera pas à exporter en CSV, et le pari du produit est
   que la saisie ne doit rien coûter. Le parser XLSX est chargé en import dynamique,
   uniquement lorsqu'un `.xlsx` est déposé, pour ne pas alourdir le bundle des autres
   parcours.
2. **Mapping des colonnes** — détection automatique par intitulé (`nom`, `prénom`,
   `table`, `régime`, `email` et leurs variantes), présentée à l'utilisateur pour
   correction. La détection ne doit jamais imposer : un fichier réel contiendra des
   colonnes non prévues.
3. **Aperçu** — récapitulatif chiffré avant confirmation : nombre d'invités, nombre
   de tables détectées, lignes ignorées et pourquoi.
4. **Confirmation** — un appel API unique.

### Règles de transformation

- **Les tables sont déduites** des valeurs distinctes de la colonne « table ». Le
  couple n'a pas à créer ses tables au préalable.
- **La capacité n'existe pas dans le fichier.** Elle est initialisée au nombre
  d'invités assignés à chaque table, ajustable ensuite. Une valeur arbitraire
  déclencherait des erreurs « table pleine » incompréhensibles.
- Les lignes sans nom exploitable sont ignorées et comptées dans l'aperçu.

### API

`POST /api/projects/:id/import`, protégé par la `ProjectPolicy`, validé par VineJS,
et **transactionnel** : tout passe ou rien ne passe. Un import à moitié appliqué sur
un plan de table est pire que pas d'import.

## 6. Verticale B — Parcours invité

C'est le seul écran que verront les 120 invités. Trois corrections de fond sur
l'existant.

### 6.1 L'ambiguïté devient un choix, pas une erreur

`GuestService.fuzzySearchByProjectId` renvoie aujourd'hui une erreur 400 dès que
plusieurs invités correspondent, avec le message « veuillez préciser avec votre
email ». Demander son email à quelqu'un qui cherche sa table dans un hall d'entrée
ne fonctionnera pas.

Le contrat change : **l'endpoint renvoie toujours un tableau.**

- Un résultat → affichage direct de la table.
- Plusieurs résultats → liste cliquable (« Martin Dupont · Table 4 »).
- Zéro résultat → message d'aide, pas un constat d'échec.

### 6.2 Un champ libre, sans syntaxe

La recherche attend actuellement `prénom+nom+email` découpé sur des caractères `+`.
Cette syntaxe n'est devinable par personne. Elle est remplacée par un champ libre
unique, recherché dans le prénom et le nom, insensible à la casse et aux accents.
La normalisation NFD déjà écrite est conservée.

### 6.3 L'endpoint public expose le strict nécessaire

`GET /api/projects/:id/guests/search` est ouvert sans authentification. Il expose
donc uniquement : prénom, nom, nom et emplacement de la table. **Jamais les emails
des invités, jamais le régime alimentaire d'un autre invité.** Le régime alimentaire
n'apparaît que sur la fiche de l'invité qui vient d'être sélectionné.

L'endpoint est soumis à un rate limit. Il faut être exact sur ce qu'il apporte : c'est
un frein anti-abus, pas une barrière étanche. Une salle de réception place tous ses
invités derrière une seule adresse IP, ce qui interdit un seuil serré. Ce qui rend
réellement coûteuse l'énumération de la liste, c'est la longueur minimale d'un terme
de recherche — trois lettres portent l'espace à 17 576 combinaisons — et le plafond de
résultats au-delà duquel l'endpoint ne renvoie rien. Le seul secret non devinable
reste l'identifiant du projet, qui est imprimé sur l'affiche à l'entrée.

La recherche publique n'est ouverte que pour un projet dont `isActive` est vrai.

### 6.4 QR code

`QRCodeSection.generateQRUrl` produit `/search?project=<id>` alors que la route
déclarée dans `AppPublic.tsx` est `/search/:projectId` : le lien du QR ne mène nulle
part. L'URL est corrigée.

La génération du QR est implémentée côté client (comme le parsing, pour les mêmes
raisons) et remplace les quatre `// TODO: Implement` du composant. Le QR est
téléchargeable en PNG à une résolution imprimable.

### 6.5 Résultat affiché

L'affichage conserve le nom de l'invité, le nom de la table et son emplacement. Il ne
conserve pas le régime alimentaire : avec des homonymes, l'afficher exposerait celui
d'un autre invité sur une page publique. S'y ajoute la robustesse : cet écran tourne
sur un téléphone, en réseau mobile saturé, sollicité par 120 personnes en dix minutes.

## 7. Socle

### 7.1 Autorisation

La condition `user.id !== X.project.userId && user.role !== 'admin'` est aujourd'hui
recopiée dans six services. Six copies, six occasions d'en oublier une — ce qui est
exactement arrivé sur les lectures.

`@adonisjs/bouncer` est installé et une **`ProjectPolicy` unique** porte la règle,
réduite après suppression du contournement admin à : `user.id === project.userId`.

Périmètre : toute lecture et toute écriture touchant un projet, ses tables ou ses
invités passe par la policy. Cela inclut `POST /api/guests` et
`POST /api/guests/:id/assign`, qui ne font aujourd'hui aucun contrôle et permettent
d'écrire dans le mariage de n'importe quel utilisateur.

### 7.2 Validation

Seul `app/validators/auth.ts` existe ; le reste utilise `request.only([...])` brut.
Des validateurs VineJS sont ajoutés pour projet, table, invité et import. Sur
l'import, la validation est indispensable : les données proviennent d'un fichier
arbitraire.

### 7.3 Quota

Le quota s'applique à un **unique point d'application**, traversé par la création
d'invité et par l'import.

Au premier jalon, la limite est réglée haut (150 invités par projet) et joue le rôle
de garde-fou anti-abus, pas de barrière commerciale. Raison : une limite basse sans
moyen de paiement est un mur — à 31 invités, le couple serait bloqué sans porte de
sortie, précisément au moment où il a le plus investi dans l'outil.

La mécanique du freemium est donc construite maintenant ; l'abaissement du seuil et
le branchement d'un paiement deviennent un changement de configuration, pas un
refactor.

### 7.4 Tests

Japa est déjà installé et `tests/bootstrap.ts` en place ; seuls les tests manquent.
Ils sont écrits en TDD, avant l'implémentation correspondante, et couvrent :

- **Autorisation** — un compte B ne lit ni ne modifie aucune donnée du compte A, sur
  chaque endpoint. C'est le filet qui empêche la régression de revenir.
- **Import** — mapping des colonnes, doublons, lignes vides, et rollback : un import
  qui échoue en cours de route ne laisse rien derrière lui.
- **Recherche invité** — accents, casse, homonymes, zéro résultat, et non-exposition
  des emails.
- **Capacité de table** et **quota**.

### 7.5 Mise à jour des versions

Préalable à tout le reste : `node_modules` n'est pas installé et le projet date du
début 2026. Les dépendances sont montées aux dernières versions stables d'AdonisJS 6,
React 19 et Vite, versions vérifiées via `npm view` au moment de l'opération. Aucun
changement de framework.

## 8. Déploiement

### Contrainte de domaine

Supprimer le JWT rend l'authentification entièrement dépendante d'un cookie, servi en
`sameSite: 'lax'`. Cette configuration fonctionne si le front et l'API partagent le
même domaine racine (`app.exemple.fr` et `api.exemple.fr`). Elle **échoue** si les
deux sont déployés sur des domaines sans rapport : le navigateur n'enverra pas le
cookie et personne ne pourra se connecter.

**Contrainte actée : un domaine, deux sous-domaines.** Passer en `sameSite: 'none'`
est explicitement écarté (plus fragile, bloqué par certains navigateurs).

### Autres points

- `config/session.ts` : `age: '2h'` est trop court pour un couple qui construit son
  plan sur plusieurs semaines. Porté à 30 jours, en cohérence avec le remember-me
  déjà configuré.
- `config/cors.ts` : les origines sont en dur sur `localhost`. Elles passent en
  variable d'environnement.
- `start/env.ts` : `JWT_SECRET` retiré.
- Rate limit sur la recherche publique et sur le login.
- **Page d'accueil** : `ttt-web/src/App.tsx` est encore le placeholder Vite
  (« Welcome to the TTT Web App »). Une vraie page d'accueil est nécessaire au jalon
  « en ligne et utilisable ».
- **README** réécrit pour décrire le produit réel.

## 9. Séquencement

1. Montée de versions et installation des dépendances.
2. Amputation (section 4) et migrations associées.
3. Socle sur le code restant : Bouncer et `ProjectPolicy`, validateurs VineJS, quota,
   tests d'autorisation.
4. Verticale invité : recherche multi-résultats, QR code, page publique.
5. Verticale import : parsing client, mapping, endpoint transactionnel.
6. Page d'accueil, README, configuration de déploiement, mise en ligne.

Les étapes 1 à 3 précèdent délibérément les features : elles réduisent la surface
avant de construire dessus, et évitent de sécuriser du code destiné à être supprimé.

## 10. Critères d'acceptation du jalon

- Un couple crée un compte, importe un CSV et un XLSX de 100+ invités, obtient ses
  tables et son plan sans saisie manuelle.
- Il génère un QR code, l'imprime, le scanne avec un téléphone : la page de recherche
  s'ouvre.
- Un invité tape son nom et voit sa table. Deux homonymes produisent une liste de
  choix, jamais une erreur.
- Un second compte ne peut lire ni modifier aucune donnée du premier, sur aucun
  endpoint. Vérifié par des tests automatisés.
- La recherche publique n'expose jamais d'email.
- L'application est accessible publiquement sur un domaine, avec connexion
  fonctionnelle.

## 11. Risques identifiés

| Risque | Traitement |
|---|---|
| Les tableurs réels ont des colonnes imprévisibles | Mapping toujours corrigeable par l'utilisateur ; la détection propose, n'impose pas. Tests sur des fichiers volontairement irréguliers. |
| Le cookie de session ne passe pas entre les domaines | Contrainte un domaine / deux sous-domaines actée en section 8, à vérifier avant la mise en ligne. |
| L'endpoint public permet d'énumérer les invités | Rate limit, exposition minimale des champs, recherche fermée si le projet est inactif. |
| Le jour J, l'écran doit tenir la charge et le réseau | Charge utile minimale, pas de dépendance à un état serveur lourd. |

## 12. Hors périmètre (explicite)

Éditeur visuel de plan de salle et glisser-déposer. Contraintes de placement
automatiques. Envoi d'invitations et collecte de réponses par les invités. Paiement
et Stripe. QR codes personnalisés par invité. Analytics. Temps réel. Application
mobile native. Multi-langue.

Ces éléments ne sont pas rejetés définitivement — ils ne servent simplement pas la
phrase produit au premier jalon.
