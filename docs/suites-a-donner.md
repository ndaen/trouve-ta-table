# Suites à donner — après le plan « fondations »

> Extrait du journal d'exécution du plan `2026-08-27-fondations-amputation-et-socle`.
> Aucun de ces points n'est bloquant : la revue globale de branche a conclu « prête à fusionner ».
> Ils sont classés par le plan qui devrait logiquement les absorber.

## À traiter par le plan « parcours invité »

- **La recherche publique n'est pas durcie.** `GET /api/projects/:id/guests/search` est délibérément non authentifiée — c'est la recherche que fait un invité après avoir scanné le QR code. Elle n'a ni rate limit, ni restriction des champs exposés, ni fermeture sur projet inactif. Spec §6.3.
- **Le contrat de recherche est encore l'ancien** : erreur 400 dès que plusieurs invités correspondent, et syntaxe `prénom+nom+email` découpée sur des `+`. À remplacer par un tableau de résultats et un champ libre. Spec §6.1 et §6.2.
- **La page `/search/:projectId` existe et fonctionne**, mais n'a aucun chemin d'accès tant que la génération de QR code n'est pas faite. Volontairement non documentée dans le README.
- `app/types/guest.ts` contient déjà `GuestSearchResult`, écrit en anticipation et jamais utilisé.

## À traiter par le plan « import tableur »

- **`projects.event_date` est une colonne Postgres `date`** (jour calendaire seul) alors que le modèle la déclare `@column.dateTime()`. L'API fabrique une heure et un fuseau pour une donnée qui n'en a pas. Sans conséquence aujourd'hui, mais l'import lira des dates depuis des fichiers.
- `app/types/guest.ts` contient déjà `ImportGuestsPayload`, écrit en anticipation et jamais utilisé.
- **Le quota a une course théorique** entre la lecture du compte et l'insertion. Acceptable pour un garde-fou anti-abus ; à revoir si l'import crée des invités en lot.

## À traiter par le plan « mise en ligne »

- **Vérifier le comportement du cookie de session en cross-origin.** C'est le risque numéro un de la suppression du JWT, et il n'est prouvable qu'avec un vrai navigateur sur de vrais domaines. L'aller-retour a été vérifié manuellement en local, pas en cross-site. Spec §8.
- **Confirmer que le mode production ne renvoie pas de traces d'erreur.** En développement, l'API renvoie les frames de pile et les chemins de fichiers. Le code est correct (`debug = !app.inProduction`) et `docker-compose.yml` pose `NODE_ENV=production`, mais ça n'a jamais été constaté sur un environnement de production réel.
- **Durée de session à 2 h** dans `config/session.ts`, trop court pour un couple qui construit son plan sur plusieurs semaines. Spec §8 prévoit 30 jours.
- **Origines CORS en dur** sur `localhost` dans `config/cors.ts`, à passer en variable d'environnement. Spec §8.

## Dette technique, sans plan assigné

- **17 violations réelles des règles React Compiler** dans 14 fichiers du front, révélées par `eslint-plugin-react-hooks` v7 puis masquées par le revert de ce bump. Jamais examinées — potentiellement de vrais bugs de hooks.
- **Requête dupliquée par écriture** : les contrôleurs chargent l'entité pour autoriser, puis le service la recharge. Inefficacité, pas un bug ; la résoudre demande un changement de signature.
- **Oracle d'existence** dans `guest_service.assignToTable` : 404 pour une table inexistante, 400 pour une table d'un autre projet. Laisse un appelant authentifié sonder l'existence d'un identifiant de table.
- **Deux tests ne peuvent pas échouer** : celui de la date sans heure en environnement UTC, et celui de l'invité sans email qui omet la clé au lieu de passer `null`.
- `tests/functional/removed_endpoints.spec.ts` n'assert que des codes de statut, jamais les corps de réponse.
