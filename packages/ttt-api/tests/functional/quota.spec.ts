import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory, GuestFactory } from '#database/factories/main'
import QuotaService from '#services/quota_service'

test.group("Quota d'invités", (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('la limite par projet est de 150', async ({ assert }) => {
        assert.equal(QuotaService.MAX_GUESTS_PER_PROJECT, 150)
    })

    test('ajouter un invité sous la limite est accepté', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        await GuestFactory.merge({ projectId: project.id }).createMany(10)

        const response = await client
            .post('/api/guests')
            .json({ projectId: project.id, firstName: 'Camille', lastName: 'Durand' })
            .loginAs(user)

        response.assertStatus(201)
    })

    test('ajouter un invité au-delà de la limite est refusé', async ({ client }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        await GuestFactory.merge({ projectId: project.id }).createMany(
            QuotaService.MAX_GUESTS_PER_PROJECT
        )

        const response = await client
            .post('/api/guests')
            .json({ projectId: project.id, firstName: 'Camille', lastName: 'Durand' })
            .loginAs(user)

        response.assertStatus(422)
    })

    test('le quota est calculé par projet, pas globalement', async ({ client }) => {
        const user = await UserFactory.create()
        const plein = await ProjectFactory.merge({ userId: user.id }).create()
        const vide = await ProjectFactory.merge({ userId: user.id }).create()
        await GuestFactory.merge({ projectId: plein.id }).createMany(
            QuotaService.MAX_GUESTS_PER_PROJECT
        )

        const response = await client
            .post('/api/guests')
            .json({ projectId: vide.id, firstName: 'Camille', lastName: 'Durand' })
            .loginAs(user)

        response.assertStatus(201)
    })
})
