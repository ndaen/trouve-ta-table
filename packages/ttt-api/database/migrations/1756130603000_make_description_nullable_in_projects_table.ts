import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'projects'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.text('description').nullable().alter()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.text('description').notNullable().alter()
        })
    }
}
