import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory, TableFactory, GuestFactory } from '#database/factories/main'
import { GuestService } from '#services/guest_service'

test.group("Recherche publique d'invités", (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('une requête trop courte est refusée', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()

        const response = await client.get(`/api/projects/${project.id}/guests/search?q=a`)

        response.assertStatus(422)
    })

    test('une requête absente est refusée', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()

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
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id, isActive: false }).create()
        await GuestFactory.merge({
            projectId: project.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const response = await client.get(`/api/projects/${project.id}/guests/search?q=martin`)

        response.assertStatus(404)
    })

    test("un seul invité correspondant renvoie un tableau d'un élément", async ({
        client,
        assert,
    }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
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
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
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
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
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

    test("l'ordre des mots est indifférent", async ({ client, assert }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
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
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
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
        const user = await UserFactory.create()
        const projetA = await ProjectFactory.merge({ userId: user.id }).create()
        const projetB = await ProjectFactory.merge({ userId: user.id }).create()
        await GuestFactory.merge({
            projectId: projetB.id,
            firstName: 'Martin',
            lastName: 'Dupont',
        }).create()

        const response = await client.get(`/api/projects/${projetA.id}/guests/search?q=martin`)

        response.assertStatus(200)
        assert.lengthOf(response.body().data, 0)
    })

    test("au-delà du plafond, aucun résultat n'est renvoyé", async ({ client, assert }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
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
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
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
        assert.notAnyProperties(response.body().data[0], [
            'email',
            'dietaryRequirements',
            'id',
            'projectId',
        ])
    })
})
