import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory, TableFactory, GuestFactory } from '#database/factories/main'

test.group('Autorisation des écritures invités', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('un intrus ne peut pas créer un invité dans un projet tiers', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()

        const response = await client
            .post('/api/guests')
            .json({
                projectId: project.id,
                firstName: 'Intrus',
                lastName: 'Malveillant',
                email: 'intrus@example.com',
            })
            .loginAs(intrus)

        response.assertStatus(403)
    })

    test('un intrus ne peut pas assigner un invité à une table', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()
        const table = await TableFactory.merge({ projectId: project.id }).create()
        const guest = await GuestFactory.merge({ projectId: project.id }).create()

        const response = await client
            .post(`/api/guests/${guest.id}/assign`)
            .json({ tableId: table.id })
            .loginAs(intrus)

        response.assertStatus(403)
    })

    test('un intrus ne peut pas désassigner un invité', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()
        const table = await TableFactory.merge({ projectId: project.id }).create()
        const guest = await GuestFactory.merge({
            projectId: project.id,
            tableId: table.id,
        }).create()

        const response = await client.post(`/api/guests/${guest.id}/unassign`).loginAs(intrus)

        response.assertStatus(403)
    })

    test('un intrus ne peut pas créer une table dans un projet tiers', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()

        const response = await client
            .post('/api/tables')
            .json({ projectId: project.id, name: 'Table pirate', capacity: 8 })
            .loginAs(intrus)

        response.assertStatus(403)
    })

    test('le propriétaire peut créer un invité dans son projet', async ({ client }) => {
        const proprietaire = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()

        const response = await client
            .post('/api/guests')
            .json({
                projectId: project.id,
                firstName: 'Camille',
                lastName: 'Durand',
                email: 'camille@example.com',
            })
            .loginAs(proprietaire)

        response.assertStatus(201)
    })
})
