import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, beforeSave, belongsTo, column } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import Project from '#models/project'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Table from '#models/table'
import type { UUID } from '#types/index'
import { normalizeSearchText } from '#utils/search_text'

export default class Guest extends BaseModel {
    @column({ isPrimary: true })
    declare id: UUID

    @column()
    declare projectId: UUID

    @column()
    declare tableId: UUID | null

    @column()
    declare firstName: string

    @column()
    declare lastName: string

    @column()
    declare email: string | null

    @column()
    declare dietaryRequirements: string | null

    /**
     * Prénom et nom normalisés (minuscules, sans accents, sans ponctuation).
     * Colonne dénormalisée : c'est sur elle que porte la recherche publique.
     * Jamais renseignée à la main, toujours par le hook ci-dessous.
     */
    @column()
    declare searchName: string

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @belongsTo(() => Project)
    declare project: BelongsTo<typeof Project>

    @belongsTo(() => Table)
    declare table: BelongsTo<typeof Table>

    get fullName() {
        return `${this.firstName} ${this.lastName}`
    }

    @beforeCreate()
    static assignId(guest: Guest) {
        guest.id = randomUUID()
    }

    @beforeSave()
    static setSearchName(guest: Guest) {
        guest.searchName = normalizeSearchText(`${guest.firstName} ${guest.lastName}`)
    }
}
