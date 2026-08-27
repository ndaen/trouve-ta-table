import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory } from '#database/factories/main'

test.group('Authentification', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('login réussi ne renvoie aucun token', async ({ client, assert }) => {
        const user = await UserFactory.merge({ password: 'password123' }).create()

        const response = await client
            .post('/api/auth/login')
            .json({ email: user.email, password: 'password123' })

        response.assertStatus(200)
        assert.notProperty(response.body(), 'token')
        assert.propertyVal(response.body().user, 'email', user.email)
    })

    test('la session authentifie les requêtes suivantes', async ({ client }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/auth/me').loginAs(user)
        response.assertStatus(200)
    })

    test('sans session, /api/auth/me répond 401', async ({ client }) => {
        const response = await client.get('/api/auth/me')
        response.assertStatus(401)
    })

    test('check ne renvoie aucun token', async ({ client, assert }) => {
        const user = await UserFactory.create()
        const response = await client.get('/api/auth/check').loginAs(user)
        response.assertStatus(200)
        assert.notProperty(response.body(), 'token')
        assert.propertyVal(response.body(), 'isAuthenticated', true)
    })
})
