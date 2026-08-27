import Guest from '#models/guest'
import Table from '#models/table'
import Project from '#models/project'
import { tokenizeSearchQuery } from '#utils/search_text'
import type { GuestSearchResult } from '#types/guest'

export class GuestService {
    public async getById(id: string) {
        return Guest.query().where('id', id).preload('table').preload('project').first()
    }

    public async create(guestData: Partial<Guest>) {
        return Guest.create(guestData)
    }

    public async update(id: string, guestData: Partial<Guest>) {
        const guest = await this.getById(id)

        if (!guest) {
            return {
                error: 'Guest not found',
                status: 404,
            }
        }

        guest.merge(guestData)
        await guest.save()
        return guest
    }

    public async delete(id: string) {
        const guest = await this.getById(id)
        if (!guest) {
            return {
                error: 'Guest not found',
                status: 404,
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
        // Charger la relation guests pour vérifier la capacité
        await table.load('guests')
        if (table.guests && table.capacity <= table.guests.length) {
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

    /**
     * Plafond de résultats. Au-delà, on ne renvoie rien : sans ce plafond,
     * taper « a » retournerait la moitié des invités d'un mariage en une seule
     * requête, ce qui est exactement l'énumération que la spec §6.3 interdit.
     */
    public static MAX_SEARCH_RESULTS = 10

    /**
     * Recherche publique, non authentifiée. Renvoie toujours un tableau.
     *
     * Le type de retour est annoté explicitement : sans ça, TypeScript
     * synthétise une union « amicale » où chaque branche porte les clés de
     * l'autre en `?: undefined`, ce qui empêche `'error' in result` de
     * vraiment restreindre le type côté contrôleur (sous strictNullChecks).
     */
    public async searchPublic(
        projectId: string,
        query: string
    ): Promise<
        | { error: string; status: number }
        | { results: GuestSearchResult[]; tooManyMatches: boolean }
    > {
        const project = await Project.query()
            .where('id', projectId)
            .andWhere('isActive', true)
            .first()

        if (!project) {
            return { error: 'Projet introuvable', status: 404 }
        }

        const tokens = tokenizeSearchQuery(query)
        if (tokens.length === 0) {
            return { results: [] as GuestSearchResult[], tooManyMatches: false }
        }

        // On demande une ligne de plus que le plafond : c'est ce qui permet de
        // savoir qu'il y en a trop sans compter la totalité.
        const guests = await Guest.query()
            .select('id', 'first_name', 'last_name', 'table_id')
            .where('projectId', project.id)
            .where((builder) => {
                // `search_name` est déjà en minuscules et sans accent, donc un
                // LIKE simple suffit — pas besoin d'ILIKE ni d'unaccent.
                for (const token of tokens) {
                    builder.andWhere('searchName', 'LIKE', `%${token}%`)
                }
            })
            .preload('table')
            .limit(GuestService.MAX_SEARCH_RESULTS + 1)

        if (guests.length > GuestService.MAX_SEARCH_RESULTS) {
            return { results: [] as GuestSearchResult[], tooManyMatches: true }
        }

        return {
            results: guests.map((guest) => this.toSearchResult(guest)),
            tooManyMatches: false,
        }
    }

    /**
     * Projection explicite. Ne jamais remplacer par `guest.serialize()` : c'est
     * précisément ce qui faisait fuiter l'email et le régime alimentaire.
     */
    private toSearchResult(guest: Guest): GuestSearchResult {
        return {
            firstName: guest.firstName,
            lastName: guest.lastName,
            fullName: guest.fullName,
            table: guest.table
                ? { name: guest.table.name, description: guest.table.description }
                : null,
        }
    }

    public async getByProject(projectID: string) {
        return Guest.query().where('projectId', projectID).preload('table')
    }
}
