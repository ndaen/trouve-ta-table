import Table from '#models/table'
import type User from '#models/user'
import Guest from '#models/guest'

export class TableService {
    public async getAll() {
        return Table.query().preload('guests')
    }

    public async getById(id: string) {
        return Table.query().where('id', id).preload('project').preload('guests').first()
    }

    public async create(tableData: Partial<Table>) {
        return Table.create(tableData)
    }

    public async update(id: string, tableData: Partial<Table>, user: User) {
        const table = await this.getById(id)

        if (!table) {
            return {
                error: 'Table not found',
                status: 404,
            }
        }
        if (user.id !== table.project.userId && user.role !== 'admin') {
            return {
                error: 'You do not have permission to update this table',
                status: 403,
            }
        }

        table.merge(tableData)
        await table.save()
        return table
    }

    public async delete(id: string, user: User) {
        const table = await this.getById(id)
        if (!table) {
            return {
                message: 'Table not found',
                status: 404,
            }
        }
        if (user.id !== table.project.userId && user.role !== 'admin') {
            return {
                message: 'You do not have permission to delete this table',
                status: 403,
            }
        }

        // Désassigner tous les invités de cette table avant de la supprimer
        await Guest.query().where('tableId', id).update({ tableId: null })

        await table.delete()
        return { message: 'Table deleted successfully' }
    }

    public async getByProject(projectId: string): Promise<Table[]> {
        return Table.query().where('projectId', projectId).preload('guests')
    }
}
