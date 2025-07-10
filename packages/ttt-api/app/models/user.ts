import { DateTime } from 'luxon'
import {BaseModel, beforeCreate, column, hasMany} from '@adonisjs/lucid/orm'
import {randomUUID} from "node:crypto";
import { compose } from '@adonisjs/core/helpers'
import {withAuthFinder} from "@adonisjs/auth/mixins/lucid";
import hash from "@adonisjs/core/services/hash";
import type {UUID, UserRole, SubscriptionPlan} from "@trouve-ta-table/shared/types/index.js"
import Project from "#models/project";
import type {HasMany} from "@adonisjs/lucid/types/relations";


const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['id', 'email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: UUID

  @column()
  declare email: string

  @column({serializeAs: null})
  declare password: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column({ serializeAs: 'role' })
  declare role: UserRole

  @column()
  declare subscriptionPlan: SubscriptionPlan

  @column.dateTime()
  declare subscriptionExpiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare lastLoginAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Project)
  declare projects: HasMany<typeof Project>


  @beforeCreate()
  static assignUuid(user: User) {
    user.id = randomUUID()
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
