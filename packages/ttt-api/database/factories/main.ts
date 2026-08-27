import factory from '@adonisjs/lucid/factories'
import { DateTime } from 'luxon'
import User from '#models/user'
import Project from '#models/project'
import Table from '#models/table'
import Guest from '#models/guest'

export const UserFactory = factory
    .define(User, async ({ faker }) => ({
        email: faker.internet.email().toLowerCase(),
        password: 'password123',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'user' as const,
    }))
    .build()

export const ProjectFactory = factory
    .define(Project, async ({ faker }) => ({
        name: faker.lorem.words(2),
        eventType: 'wedding' as const,
        eventDate: DateTime.now().plus({ months: 3 }),
        venue: faker.location.streetAddress(),
        description: null,
        isActive: true,
    }))
    .relation('user', () => UserFactory)
    .build()

export const TableFactory = factory
    .define(Table, async ({ faker }) => ({
        name: faker.lorem.word(),
        description: faker.lorem.sentence(),
        capacity: 8,
    }))
    .build()

export const GuestFactory = factory
    .define(Guest, async ({ faker }) => ({
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email().toLowerCase(),
    }))
    .build()
