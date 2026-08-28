import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { Secret } from '@adonisjs/core/helpers'
import { defineConfig } from '@adonisjs/core/http'

/**
 * The app key is used for encrypting cookies, generating signed URLs,
 * and by the "encryption" module.
 *
 * The encryption module will fail to decrypt data if the key is lost or
 * changed. Therefore it is recommended to keep the app key secure.
 */
export const appKey = new Secret(env.get('APP_KEY'))

/**
 * Combien de proxys de confiance se trouvent devant l'application. C'est ce
 * qui détermine d'où `request.ip()` tire son adresse — 0 en local, 1 derrière
 * un hébergeur qui pose un seul proxy devant le conteneur.
 *
 * Ce réglage n'est pas cosmétique : le rate limit de la recherche publique
 * clé son compteur sur `request.ip()`. Mal réglé, il ne se voit pas en test
 * (le client de test est en loopback) et transforme le seau par visiteur en
 * seau unique partagé par tout Internet.
 *
 * Ne jamais faire confiance aveuglément à `X-Forwarded-For` : un client
 * pourrait alors se fabriquer une adresse différente à chaque requête et
 * échapper entièrement au rate limit.
 */
const trustedProxyHops = env.get('TRUST_PROXY_HOPS', 0)

/**
 * The configuration settings used by the HTTP server
 */
export const http = defineConfig({
    generateRequestId: true,
    allowMethodSpoofing: false,

    /**
     * `distance` est le rang de l'adresse en partant de la socket. Avec 0 saut
     * de confiance, on garde l'adresse de la socket ; avec 1, on remonte d'un
     * cran dans `X-Forwarded-For`.
     */
    trustProxy: (_address: string, distance: number) => distance < trustedProxyHops,

    /**
     * Enabling async local storage will let you access HTTP context
     * from anywhere inside your application.
     */
    useAsyncLocalStorage: false,

    /**
     * Manage cookies configuration. The settings for the session id cookie are
     * defined inside the "config/session.ts" file.
     */
    cookie: {
        domain: '',
        path: '/',
        maxAge: '2h',
        httpOnly: true,
        secure: app.inProduction,
        sameSite: 'lax',
    },
})
