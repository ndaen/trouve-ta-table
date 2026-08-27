import { test } from '@japa/runner'
import testUtils from '@adonisjs/core/services/test_utils'
import { UserFactory, ProjectFactory, TableFactory, GuestFactory } from '#database/factories/main'

test.group('Autorisation projet', (group) => {
    group.each.setup(() => testUtils.db().truncate())

    async function deuxComptes() {
        const proprietaire = await UserFactory.create()
        const intrus = await UserFactory.create()
        const project = await ProjectFactory.merge({ userId: proprietaire.id }).create()
        return { proprietaire, intrus, project }
    }

    test('un intrus ne peut pas lire un projet', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client.get(`/api/projects/${project.id}`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('le propriétaire peut lire son projet', async ({ client }) => {
        const { proprietaire, project } = await deuxComptes()
        const response = await client.get(`/api/projects/${project.id}`).loginAs(proprietaire)
        response.assertStatus(200)
    })

    test("un intrus ne peut pas lister les tables d'un projet", async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client.get(`/api/projects/${project.id}/tables`).loginAs(intrus)
        response.assertStatus(403)
    })

    test("un intrus ne peut pas lister les invités d'un projet", async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client.get(`/api/projects/${project.id}/guests`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('un intrus ne peut pas lire une table', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const table = await TableFactory.merge({ projectId: project.id }).create()
        const response = await client.get(`/api/tables/${table.id}`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('un intrus ne peut pas lire un invité', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const guest = await GuestFactory.merge({ projectId: project.id }).create()
        const response = await client.get(`/api/guests/${guest.id}`).loginAs(intrus)
        response.assertStatus(403)
    })

    test('un intrus ne peut pas modifier un projet', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client
            .patch(`/api/projects/${project.id}`)
            .json({ name: 'détourné' })
            .loginAs(intrus)
        response.assertStatus(403)
    })

    test('un intrus ne peut pas supprimer un projet', async ({ client }) => {
        const { intrus, project } = await deuxComptes()
        const response = await client.delete(`/api/projects/${project.id}`).loginAs(intrus)
        response.assertStatus(403)
    })

    test("un compte au rôle admin n'a aucun privilège", async ({ client }) => {
        const { project } = await deuxComptes()
        const faussaire = await UserFactory.merge({ role: 'admin' }).create()
        const response = await client.get(`/api/projects/${project.id}`).loginAs(faussaire)
        response.assertStatus(403)
    })
})
