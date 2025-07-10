import { DateTime } from 'luxon'
import {BaseModel, beforeCreate, belongsTo, column} from '@adonisjs/lucid/orm'
import type {EventType, UUID} from '@trouve-ta-table/shared/types/index.js'
import {randomUUID} from "node:crypto";
import type {BelongsTo} from "@adonisjs/lucid/types/relations";
import User from "#models/user";

export default class Project extends BaseModel {
  @column({ isPrimary: true })
  declare id: UUID

  @column({serializeAs: 'user_id'})
  declare userId: UUID

  @column()
  declare name: string

  @column()
  declare eventType: EventType

  @column.dateTime()
  declare eventDate: DateTime

  @column()
  declare venue: string

  @column()
  declare description: string

  @column()
  declare qrCodeUrl?: string

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare deletedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @beforeCreate()
  static assignId(project: Project) {
    project.id = randomUUID()
  }
}
