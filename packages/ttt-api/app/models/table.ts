import { DateTime } from 'luxon'
import {BaseModel, beforeCreate, belongsTo, column} from '@adonisjs/lucid/orm'
import type {UUID} from '@trouve-ta-table/shared/types/index.js'
import {randomUUID} from "node:crypto";
import Project from "#models/project";
import type {BelongsTo} from "@adonisjs/lucid/types/relations";

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

  @beforeCreate()
  static assignId(table: Table) {
    table.id = randomUUID()
  }
}
