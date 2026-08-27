import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { ProjectFactory, TableFactory, GuestFactory } from '#database/factories/main'

test.group('Factories', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    test('creates a table and a guest via .with("project") with no explicit projectId', async ({
        assert,
    }) => {
        const tableRow = await TableFactory.with('project', 1, (p) => p.with('user')).create()
        assert.exists(tableRow.projectId)

        const guestRow = await GuestFactory.with('project', 1, (p) => p.with('user')).create()
        assert.exists(guestRow.projectId)
    })

    test('creates a table and a guest via .merge({ projectId }) from an explicit project', async ({
        assert,
    }) => {
        const project = await ProjectFactory.with('user').create()

        const tableRow = await TableFactory.merge({ projectId: project.id }).create()
        assert.equal(tableRow.projectId, project.id)

        const guestRow = await GuestFactory.merge({ projectId: project.id }).create()
        assert.equal(guestRow.projectId, project.id)
    })
})
