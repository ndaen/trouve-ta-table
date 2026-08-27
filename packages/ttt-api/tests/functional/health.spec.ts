import { test } from '@japa/runner'

test.group('Health', () => {
    test('GET /health répond 200', async ({ client }) => {
        const response = await client.get('/health')
        response.assertStatus(200)
    })
})
