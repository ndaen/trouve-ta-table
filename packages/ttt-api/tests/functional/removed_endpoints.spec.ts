import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/main'

test.group('Endpoints supprimés', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('GET /api/users n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/users').loginAs(user)
        response.assertStatus(404)
    })

    test('PATCH /api/users/:id n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const cible = await UserFactory.create()
        const response = await client
            .patch(`/api/users/${cible.id}`)
            .json({ role: 'admin' })
            .loginAs(user)
        response.assertStatus(404)
    })

    test('GET /api/projects n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/projects').loginAs(user)
        response.assertStatus(404)
    })

    test('GET /api/tables n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/tables').loginAs(user)
        response.assertStatus(404)
    })

    test('GET /api/guests n\'existe plus', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/guests').loginAs(user)
        response.assertStatus(404)
    })
})
