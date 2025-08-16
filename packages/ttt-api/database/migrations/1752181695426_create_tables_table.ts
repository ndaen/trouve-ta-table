import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'tables'

    async up() {
        this.schema.createTable(this.tableName, (table) => {
            table.string('id').primary().notNullable()
            table
                .string('project_id')
                .notNullable()
                .references('id')
                .inTable('projects')
                .onDelete('CASCADE')
            table.string('name').notNullable()
            table.string('description').nullable()
            table.integer('capacity').notNullable().defaultTo(0)
            table.timestamp('created_at')
            table.timestamp('updated_at')
        })
    }

    async down() {
        this.schema.dropTable(this.tableName)
    }
}
