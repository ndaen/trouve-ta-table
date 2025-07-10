import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.string('id').primary().notNullable()
      table.string('email').unique().notNullable()
      table.string('password').notNullable()
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.enu('role', ['admin', 'user']).defaultTo('user').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
