import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'projects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().notNullable()
      table.string('user_id').notNullable().references('id').inTable('users')
      table.string('name').notNullable()
      table.enu('event_type', ['wedding', 'bar_mitzvah', 'anniversary', 'corporate', 'other']).notNullable()
      table.date('event_date').notNullable()
      table.string('venue').notNullable()
      table.text('description').notNullable()
      table.string('qr_code_url').nullable()
      table.boolean('is_active').defaultTo(true).notNullable()
      table.timestamp('deleted_at').nullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
