import limiter from '@adonisjs/limiter/services/main'

/**
 * 300 requêtes par minute, par mariage et par visiteur.
 *
 * Le seuil est calibré sur la réalité du jour J, pas sur la théorie : une
 * salle de réception, c'est un wifi derrière un seul NAT, donc les invités
 * arrivent avec la même adresse. Ils n'arrivent pas non plus régulièrement —
 * ils entrent par grappes de trente en quelques minutes. Un seuil serré
 * servirait un refus à tout le hall.
 *
 * La clé inclut l'identifiant du mariage pour qu'un événement ne puisse pas
 * épuiser le compteur des autres.
 *
 * C'est un frein anti-abus, pas une barrière étanche : voir le commentaire du
 * validateur de recherche pour ce qui protège réellement la liste d'invités.
 */
export const publicSearchThrottle = limiter.define('publicSearch', (ctx) => {
    return limiter
        .allowRequests(300)
        .every('1 minute')
        .usingKey(`${ctx.params.id}_${ctx.request.ip()}`)
})
