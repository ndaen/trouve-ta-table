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

    test('au-delà de 300 requêtes par minute, la recherche renvoie 429', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        await GuestFactory.merge({
            projectId: project.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const url = `/api/projects/${project.id}/guests/search?q=martin`

        for (let i = 0; i < 300; i++) {
            const autorisee = await client.get(url)
            autorisee.assertStatus(200)
        }

        const refusee = await client.get(url)
        refusee.assertStatus(429)
    })

    test('le seau est scopé par mariage : épuiser le projet A ne bloque pas le projet B', async ({
        client,
    }) => {
        const user = await UserFactory.create()
        const projetA = await ProjectFactory.merge({ userId: user.id }).create()
        const projetB = await ProjectFactory.merge({ userId: user.id }).create()
        await GuestFactory.merge({
            projectId: projetA.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()
        await GuestFactory.merge({
            projectId: projetB.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const urlA = `/api/projects/${projetA.id}/guests/search?q=martin`
        const urlB = `/api/projects/${projetB.id}/guests/search?q=martin`

        for (let i = 0; i < 300; i++) {
            const autorisee = await client.get(urlA)
            autorisee.assertStatus(200)
        }
        const refuseeA = await client.get(urlA)
        refuseeA.assertStatus(429)

        const autoriseeB = await client.get(urlB)
        autoriseeB.assertStatus(200)
    })
})
