import Table from '#models/table'
import Guest from '#models/guest'

export class TableService {
    public async getById(id: string) {
        return Table.query().where('id', id).preload('project').preload('guests').first()
    }

    public async create(tableData: Partial<Table>) {
        return Table.create(tableData)
    }

    public async update(id: string, tableData: Partial<Table>) {
        const table = await this.getById(id)

        if (!table) {
            return {
                error: 'Table not found',
                status: 404,
            }
        }

        table.merge(tableData)
        await table.save()
        return table
    }

    public async delete(id: string) {
        const table = await this.getById(id)
        if (!table) {
            return {
                message: 'Table not found',
                status: 404,
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
