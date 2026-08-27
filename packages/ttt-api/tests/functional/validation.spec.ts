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

    test('un projet avec un eventType hors énumération est refusé', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client
            .post('/api/projects')
            .json({
                name: 'Mariage de Camille',
                venue: 'Château de Vaux',
                eventType: 'birthday',
                eventDate: '2027-06-12',
            })
            .loginAs(user)
        response.assertStatus(422)
    })

    test('un projet avec une date sans heure conserve le jour indiqué', async ({
        client,
        assert,
    }) => {
        const user = await UserFactory.create()
        const response = await client
            .post('/api/projects')
            .json({
                name: 'Mariage de Camille',
                venue: 'Château de Vaux',
                eventType: 'wedding',
                eventDate: '2027-06-12',
            })
            .loginAs(user)
        response.assertStatus(201)
        const eventDate = response.body().data.eventDate as string
        assert.equal(eventDate.slice(0, 10), '2027-06-12')
    })
})
