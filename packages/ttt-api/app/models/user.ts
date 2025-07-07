import { DateTime } from 'luxon'
import {BaseModel, beforeCreate, column} from '@adonisjs/lucid/orm'
import {randomUUID} from "node:crypto";
import { compose } from '@adonisjs/core/helpers'
import {withAuthFinder} from "@adonisjs/auth/mixins/lucid";
import hash from "@adonisjs/core/services/hash";

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['id', 'email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: string

  @column({ isPrimary: true })
  declare email: string

  @column({serializeAs: null})
  declare password: string

  @column()
  declare firstName: string

  @column()
  declare lastName: string

  @column({ serializeAs: 'role' })
  declare role: 'admin' | 'user'

  @column()
  declare subscriptionPlan: 'free' | 'pro' | 'enterprise' | 'starter'

  @column.dateTime()
  declare subscriptionExpiresAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare lastLoginAt: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @beforeCreate()
  static assignUuid(user: User) {
    user.id = randomUUID()
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`
  }
}
