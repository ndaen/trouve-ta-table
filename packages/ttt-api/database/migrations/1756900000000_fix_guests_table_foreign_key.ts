import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
    protected tableName = 'guests'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            // Supprimer la contrainte de clé étrangère existante avec CASCADE
            table.dropForeign(['table_id'])

            // Recréer la contrainte de clé étrangère avec SET NULL au lieu de CASCADE
            table.foreign('table_id').references('id').inTable('tables').onDelete('SET NULL')
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            // Revenir à la contrainte CASCADE d'origine
            table.dropForeign(['table_id'])

            table.foreign('table_id').references('id').inTable('tables').onDelete('CASCADE')
        })
    }
}
