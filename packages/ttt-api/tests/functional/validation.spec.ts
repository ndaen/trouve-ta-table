import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory } from '#database/factories/main'

test.group('Validation des entrées', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('un projet sans nom est refusé', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client
            .post('/api/projects')
            .json({ venue: 'Château de Vaux', eventType: 'wedding' })
            .loginAs(user)
        response.assertStatus(422)
    })

    test('une table avec une capacité négative est refusée', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        const response = await client
            .post('/api/tables')
            .json({ projectId: project.id, name: 'Table 1', capacity: -3 })
            .loginAs(user)
        response.assertStatus(422)
    })

    test('un invité avec un email invalide est refusé', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        const response = await client
            .post('/api/guests')
            .json({
                projectId: project.id,
                firstName: 'Camille',
                lastName: 'Durand',
                email: 'pas-un-email',
            })
            .loginAs(user)
        response.assertStatus(422)
    })

    test('un invité sans email est accepté', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        const response = await client
            .post('/api/guests')
            .json({ projectId: project.id, firstName: 'Camille', lastName: 'Durand' })
            .loginAs(user)
        response.assertStatus(201)
    })
})
