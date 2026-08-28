import { BaseSchema } from '@adonisjs/lucid/schema'
import { normalizeSearchText } from '#utils/search_text'

export default class extends BaseSchema {
    protected tableName = 'guests'

    async up() {
        this.schema.alterTable(this.tableName, (table) => {
            table.string('search_name').nullable()
            table.index(['project_id', 'search_name'], 'guests_project_search_name_index')
        })

        // Backfill : la normalisation est en JavaScript, pas en SQL, donc on
        // relit les lignes existantes plutôt que d'écrire un UPDATE calculé.
        // Le quota plafonne un projet à 150 invités, le volume reste trivial.
        this.defer(async (db) => {
            const rows = await db.from(this.tableName).select('id', 'first_name', 'last_name')

            for (const row of rows) {
                await db
                    .from(this.tableName)
                    .where('id', row.id)
                    .update({
                        search_name: normalizeSearchText(`${row.first_name} ${row.last_name}`),
                    })
            }
        })

        // La colonne n'est passée en NOT NULL qu'une fois le backfill terminé :
        // un `LIKE` sur NULL vaut NULL, donc une ligne restée nulle rendrait un
        // invité silencieusement introuvable.
        this.schema.alterTable(this.tableName, (table) => {
            table.string('search_name').notNullable().alter()
        })
    }

    async down() {
        this.schema.alterTable(this.tableName, (table) => {
            table.dropIndex(['project_id', 'search_name'], 'guests_project_search_name_index')
            table.dropColumn('search_name')
        })
    }
}
