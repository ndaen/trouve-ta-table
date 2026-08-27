import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import limiter from '@adonisjs/limiter/services/main'
import { UserFactory, ProjectFactory, GuestFactory } from '#database/factories/main'

test.group('Rate limit de la recherche publique', (group) => {
    group.each.setup(() => testUtils.db().truncate())
    // Les tests fonctionnels précédents consomment aussi le compteur de
    // `publicSearch` (même IP côté client de test) : on repart d'un
    // compteur vide avant de l'épuiser volontairement, pour ne pas hériter
    // de leur consommation ni leur laisser la nôtre en sortie.
    group.each.setup(() => limiter.clear())
    group.each.teardown(() => limiter.clear())

    test('au-delà de 60 requêtes par minute, la recherche renvoie 429', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
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
})
