import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Project from '#models/project'
import Table from '#models/table'
import Guest from '#models/guest'
import { DateTime } from 'luxon'

export default class ProjectSeeder extends BaseSeeder {
    async run() {
        const userId = '56cc93d1-0d76-49c9-9b2e-7ba48422e065'

        const weddingProject = await Project.create({
            userId,
            name: 'Mariage Emma & Thomas',
            eventType: 'wedding',
            eventDate: DateTime.now().plus({ months: 3 }),
            venue: 'Château de Versailles',
            description: "Célébration du mariage d'Emma et Thomas",
            isActive: true,
        })

        await this.createWeddingData(weddingProject.id)

        const barMitzvahProject = await Project.create({
            userId,
            name: 'Bar Mitzvah de David',
            eventType: 'bar_mitzvah',
            eventDate: DateTime.now().plus({ months: 2 }),
            venue: 'Synagogue Beth Shalom',
            description: 'Célébration du Bar Mitzvah de David',
            isActive: true,
        })

        await this.createBarMitzvahData(barMitzvahProject.id)

        const anniversaryProject = await Project.create({
            userId,
            name: '50 ans de Marie',
            eventType: 'anniversary',
            eventDate: DateTime.now().plus({ weeks: 6 }),
            venue: 'Restaurant Le Jardin',
            description: 'Fête surprise pour les 50 ans de Marie',
            isActive: true,
        })

        await this.createAnniversaryData(anniversaryProject.id)
    }

    private async createWeddingData(projectId: string) {
        const tables = await Table.createMany([
            { projectId, name: 'Table 1 - Famille', capacity: 8 },
            { projectId, name: 'Table 2 - Amis proches', capacity: 10 },
            { projectId, name: 'Table 3 - Collègues', capacity: 6 },
            { projectId, name: "Table d'honneur", capacity: 4 },
        ])

        await Guest.createMany([
            {
                projectId,
                tableId: tables[0].id,
                firstName: 'Marie',
                lastName: 'Dupont',
                email: 'marie.dupont@email.com',
            },
            {
                projectId,
                tableId: tables[0].id,
                firstName: 'Pierre',
                lastName: 'Dupont',
                email: 'pierre.dupont@email.com',
            },
            { projectId, tableId: tables[0].id, firstName: 'Sophie', lastName: 'Martin' },

            {
                projectId,
                tableId: tables[1].id,
                firstName: 'Lucas',
                lastName: 'Bernard',
                email: 'lucas.bernard@email.com',
            },
            { projectId, tableId: tables[1].id, firstName: 'Camille', lastName: 'Petit' },

            {
                projectId,
                tableId: tables[3].id,
                firstName: 'Emma',
                lastName: 'Laurent',
                email: 'emma.laurent@email.com',
            },
            {
                projectId,
                tableId: tables[3].id,
                firstName: 'Thomas',
                lastName: 'Morel',
                email: 'thomas.morel@email.com',
            },

            { projectId, firstName: 'Paul', lastName: 'Faure', email: 'paul.faure@email.com' },
            { projectId, firstName: 'Laura', lastName: 'Andre' },
        ])
    }

    private async createBarMitzvahData(projectId: string) {
        const tables = await Table.createMany([
            { projectId, name: 'Table Parents', capacity: 8 },
            { projectId, name: 'Table Grands-parents', capacity: 6 },
            { projectId, name: 'Table Jeunes', capacity: 12 },
        ])

        // @ts-ignore
        await Guest.createMany([
            {
                projectId,
                tableId: tables[0].id,
                firstName: 'Rachel',
                lastName: 'Cohen',
                email: 'rachel.cohen@email.com',
            },
            {
                projectId,
                tableId: tables[0].id,
                firstName: 'Michael',
                lastName: 'Cohen',
                email: 'michael.cohen@email.com',
            },
            { projectId, tableId: tables[1].id, firstName: 'Abraham', lastName: 'Cohen' },
            {
                projectId,
                tableId: tables[2].id,
                firstName: 'David',
                lastName: 'Cohen',
                email: 'david.cohen@email.com',
            },
        ])
    }

    private async createAnniversaryData(projectId: string) {
        const tables = await Table.createMany([
            { projectId, name: 'Table VIP', capacity: 4 },
            { projectId, name: 'Table Amis', capacity: 8 },
        ])

        await Guest.createMany([
            {
                projectId,
                tableId: tables[0].id,
                firstName: 'Marie',
                lastName: 'Célèbre',
                email: 'marie.celebre@email.com',
            },
            { projectId, tableId: tables[0].id, firstName: 'Philippe', lastName: 'Célèbre' },
            { projectId, tableId: tables[1].id, firstName: 'Alain', lastName: 'Bestfriend' },
            { projectId, tableId: tables[1].id, firstName: 'Catherine', lastName: 'Neighbor' },
        ])
    }
}
