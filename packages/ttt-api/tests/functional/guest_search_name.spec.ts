import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory } from '#database/factories/main'
import Guest from '#models/guest'

test.group('Colonne search_name', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('est remplie à la création', async ({ assert }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        const guest = await Guest.create({
            projectId: project.id,
            firstName: 'José',
            lastName: 'Lefèvre',
        })

        assert.equal(guest.searchName, 'jose lefevre')
    })

    test('est mise à jour quand le nom change', async ({ assert }) => {
        const user = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: user.id }).create()
        const guest = await Guest.create({
            projectId: project.id,
            firstName: 'José',
            lastName: 'Lefèvre',
        })

        guest.merge({ lastName: 'Durand' })
        await guest.save()

        assert.equal(guest.searchName, 'jose durand')
    })
})
