import { DateTime } from 'luxon'
import { BaseModel, beforeCreate, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import { randomUUID } from 'node:crypto'
import Project from '#models/project'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Guest from '#models/guest'
import type { UUID } from '#types/index'

export default class Table extends BaseModel {
    @column({ isPrimary: true })
    declare id: UUID

    @column()
    declare projectId: UUID

    @column()
    declare name: string

    @column()
    declare description: string

    @column()
    declare capacity: number

    @column.dateTime({ autoCreate: true })
    declare createdAt: DateTime

    @column.dateTime({ autoCreate: true, autoUpdate: true })
    declare updatedAt: DateTime

    @belongsTo(() => Project)
    declare project: BelongsTo<typeof Project>

    @hasMany(() => Guest)
    declare guests: HasMany<typeof Guest>

    @beforeCreate()
    static assignId(table: Table) {
        table.id = randomUUID()
    }
}
