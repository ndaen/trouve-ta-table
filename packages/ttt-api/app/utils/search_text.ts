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
