import Table from '#models/table'
import User from '#models/user'

export class TableService {
    public async getAll() {
        return Table.query().preload('guests')
    }

    public async getById(id: string) {
        return Table.query().where('id', id).preload('guests').first()
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

        await table.delete()
        return { message: 'Table deleted successfully' }
    }
}
