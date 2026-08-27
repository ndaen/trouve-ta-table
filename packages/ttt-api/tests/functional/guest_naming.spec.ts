import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory } from '#database/factories/main'

test.group('Nommage des invités', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('la création accepte et renvoie dietaryRequirements', async ({ client, assert }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()

        const response = await client
            .post('/api/guests')
            .json({
                projectId: project.id,
                firstName: 'Camille',
                lastName: 'Durand',
                email: 'camille.durand@example.com',
                dietaryRequirements: 'végétarien',
            })
            .loginAs(user)

        response.assertStatus(201)
        assert.propertyVal(response.body().data, 'dietaryRequirements', 'végétarien')
        assert.notProperty(response.body().data, 'dietary_requirements')
    })
})
