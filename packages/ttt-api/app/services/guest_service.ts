import Guest from '#models/guest'
import User from '#models/user'
import Table from '#models/table'
import Project from '#models/project'

export class GuestService {
    public async getAll() {
        return Guest.query().preload('table')
    }

    public async getById(id: string) {
        return Guest.query().where('id', id).preload('table').first()
    }

    public async create(guestData: Partial<Guest>) {
        return Guest.create(guestData)
    }

    public async update(id: string, guestData: Partial<Guest>, user: User) {
        const guest = await this.getById(id)

        if (!guest) {
            return {
                error: 'Guest not found',
                status: 404,
            }
        }
        if (user.id !== guest.table.project.userId && user.role !== 'admin') {
            return {
                error: 'You do not have permission to update this guest',
                status: 403,
            }
        }

        guest.merge(guestData)
        await guest.save()
        return guest
    }

    public async delete(id: string, user: User) {
        const guest = await this.getById(id)
        if (!guest) {
            return {
                message: 'Guest not found',
                status: 404,
            }
        }
        if (user.id !== guest.table.project.userId && user.role !== 'admin') {
            return {
                message: 'You do not have permission to delete this guest',
                status: 403,
            }
        }

        await guest.delete()
        return { message: 'Guest deleted successfully' }
    }

    public async assignToTable(id: string, tableId: string) {
        const guest = await this.getById(id)
        if (!guest) {
            return {
                error: 'Guest not found',
                status: 404,
            }
        }
        const table = await Table.find(tableId)
        if (!table) {
            return {
                error: `The table id : ${tableId} does not exist`,
                status: 404,
            }
        }
        if (table.projectId !== guest.projectId) {
            return {
                error: 'The table does not belong to the same project as the guest',
                status: 400,
            }
        }
        if (typeof table.guests === 'object' && table.capacity <= table.guests.length) {
            return {
                error: 'The table is already full',
                status: 400,
            }
        }

        guest.tableId = tableId
        await guest.save()
        return guest
    }

    public async unassignFromTable(id: string) {
        const guest = await this.getById(id)
        if (!guest) {
            return {
                error: 'Guest not found',
                status: 404,
            }
        }

        guest.tableId = null
        await guest.save()
        return guest
    }

    public async getUnassignedGuests(projectId: string) {
        const guests = await Guest.query().where('projectId', projectId).whereNull('tableId')

        if (guests.length === 0) {
            return []
        }

        return guests
    }

    public async fuzzySearchByProjectId(projectId: string, searchTerms: string) {
        searchTerms = searchTerms
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')

        const [firstName, lastName, email] = [
            ...searchTerms.split('+').map((term) => term.trim()),
            '',
            '',
            '',
        ].slice(0, 3)

        const project = await Project.find(projectId)
        if (!project) {
            return {
                error: 'Project not found',
                status: 404,
            }
        }

        const guests = await Guest.query()
            .where('projectId', projectId)
            .where((query) => {
                if (firstName) {
                    query.where('firstName', 'ILIKE', `%${firstName}%`)
                }
                if (lastName) {
                    query.andWhere('lastName', 'ILIKE', `%${lastName}%`)
                }
                if (email) {
                    query.andWhere('email', 'ILIKE', `%${email}%`)
                }
            })
            .preload('table')
        if (guests.length > 1) {
            return {
                error: 'Multiple guests found matching the search criteria',
                status: 400,
            }
        }
        if (guests.length === 0) {
            return {
                error: 'No guests found matching the search criteria',
                status: 404,
            }
        }

        return guests[0]
    }
}
