import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'users'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('subscription_plan').defaultTo('free')
            table.timestamp('subscription_expires_at', { useTz: true }).nullable()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropColumn('subscription_plan')
            table.dropColumn('subscription_expires_at')
        })
    }
}
