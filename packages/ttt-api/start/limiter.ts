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
