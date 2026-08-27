import type { HttpContext } from '@adonisjs/core/http'
import Guest from '#models/guest'
import Project from '#models/project'
import { GuestService } from '#services/guest_service'
import ProjectPolicy from '#policies/project_policy'
import {
    createGuestValidator,
    updateGuestValidator,
    assignGuestValidator,
    searchGuestsValidator,
} from '#validators/guest'
import QuotaService from '#services/quota_service'

export default class GuestsController {
    private guestService: GuestService

    constructor() {
        this.guestService = new GuestService()
    }

    public async show({ params, response, bouncer }: HttpContext) {
        const guest = await this.guestService.getById(params.id)
        if (!guest) {
            return response.status(404).json({ message: 'Guest not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('view', guest.project)

        return response.status(200).json({ message: 'Guest details', data: guest })
    }

    public async create({ request, response, bouncer }: HttpContext) {
        const payload = await request.validateUsing(createGuestValidator)

        const project = await Project.find(payload.projectId)
        if (!project) {
            return response.status(404).json({ message: 'Project not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', project)
        await QuotaService.assertCanAddGuests(project.id, 1)

        const guest = await this.guestService.create(payload)
        return response.status(201).json({ message: 'Guest created successfully', data: guest })
    }

    public async update({ params, request, response, bouncer }: HttpContext) {
        const guest = await this.guestService.getById(params.id)
        if (!guest) {
            return response.status(404).json({ message: 'Guest not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', guest.project)

        const payload = await request.validateUsing(updateGuestValidator)
        const result = await this.guestService.update(params.id, payload)
        if (!(result instanceof Guest)) {
            return response.status(result.status).json({ message: result.error })
        }
        return response.status(200).json({ message: 'Guest updated successfully', data: result })
    }

    public async delete({ params, response, bouncer }: HttpContext) {
        const guest = await this.guestService.getById(params.id)
        if (!guest) {
            return response.status(404).json({ message: 'Guest not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', guest.project)

        const result = await this.guestService.delete(params.id)
        if (result.status) {
            return response.status(result.status).json({ message: result.message })
        }
        return response.status(200).json(result.message)
    }

    public async assignToTable({ params, request, response, bouncer }: HttpContext) {
        const { tableId } = await request.validateUsing(assignGuestValidator)

        const guest = await this.guestService.getById(params.id)
        if (!guest) {
            return response.status(404).json({ message: 'Guest not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', guest.project)

        const result = await this.guestService.assignToTable(params.id, tableId)
        if (!(result instanceof Guest)) {
            return response.status(result.status).json({ message: result.error })
        }
        return response
            .status(200)
            .json({ message: 'Guest assigned to table successfully', data: result })
    }

    public async unassignFromTable({ params, response, bouncer }: HttpContext) {
        const existingGuest = await this.guestService.getById(params.id)
        if (!existingGuest) {
            return response.status(404).json({ message: 'Guest not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', existingGuest.project)

        const guest = await this.guestService.unassignFromTable(params.id)
        if (!(guest instanceof Guest)) {
            return response.status(guest.status).json({ message: guest.error })
        }
        return response
            .status(200)
            .json({ message: 'Guest unassigned from table successfully', data: guest })
    }

    public async getUnassignedGuests({ params, response, bouncer }: HttpContext) {
        const project = await Project.find(params.id)
        if (!project) {
            return response.status(404).json({ message: 'Project not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('view', project)

        const guests = await this.guestService.getUnassignedGuests(params.id)
        return response.status(200).json({ message: 'List of unassigned guests', data: guests })
    }

    /**
     * Route publique, non authentifiée : aucun bouncer ici, par conception.
     * Le durcissement est ailleurs — validation de `q`, projet actif seulement,
     * projection stricte des champs, et rate limit sur la route.
     */
    public async search({ params, request, response }: HttpContext) {
        const { q } = await request.validateUsing(searchGuestsValidator, {
            data: request.qs(),
        })

        const result = await this.guestService.searchPublic(params.id, q)
        if ('error' in result) {
            return response.status(result.status).json({ message: result.error })
        }

        return response.status(200).json({
            message: 'Résultats de la recherche',
            data: result.results,
            tooManyMatches: result.tooManyMatches,
        })
    }
}
