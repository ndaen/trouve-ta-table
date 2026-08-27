import type { HttpContext } from '@adonisjs/core/http'
import ProjectService from '#services/project_service'
import type { CreateProjectPayload } from '#types/index'
import { TableService } from '#services/table_service'
import { GuestService } from '#services/guest_service'
import ProjectPolicy from '#policies/project_policy'

export default class ProjectsController {
    private projectService: ProjectService
    private tableService: TableService
    private guestService: GuestService

    constructor() {
        this.projectService = new ProjectService()
        this.tableService = new TableService()
        this.guestService = new GuestService()
    }

    public async show({ params, response, bouncer }: HttpContext) {
        const projectId = params.id
        const project = await this.projectService.getById(projectId)
        if (!project) {
            return response.status(404).json({ message: 'Project not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('view', project)

        return response.json({ message: `Project details for ID: ${projectId}`, data: project })
    }

    public async create({ request, response, auth }: HttpContext) {
        const body = request.body() as CreateProjectPayload
        const payload: CreateProjectPayload = {
            ...body,
            userId: auth.user!.id,
        }
        const project = await this.projectService.createProject(payload)
        if (!project) {
            return response.status(400).json({ message: 'Failed to create project' })
        }
        return response.status(201).json({ message: 'Project created successfully', data: project })
    }

    public async update({ params, request, response, bouncer }: HttpContext) {
        const project = await this.projectService.getById(params.id)
        if (!project) {
            return response.status(404).json({ message: 'Project not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', project)

        const updated = await this.projectService.updateProject(params.id, request.body())
        return response.json({ message: `Project updated successfully`, data: updated })
    }

    public async delete({ params, response, bouncer }: HttpContext) {
        const projectId = params.id
        const project = await this.projectService.getById(projectId)
        if (!project) {
            return response.status(404).json({ message: 'Project not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', project)

        const result = await this.projectService.deleteProject(projectId)
        return response.json({ message: result.message })
    }

    public async showByUser({ request, response, auth }: HttpContext) {
        let isActive = request.input('isActive')
        if (typeof isActive === 'string') {
            isActive =
                isActive.toLowerCase() === 'true'
                    ? true
                    : isActive.toLowerCase() === 'false'
                      ? false
                      : isActive
        }

        const projects = await this.projectService.getAllByUser(auth.user!.id, isActive)
        return response.json({ message: `Projects for user ID: ${auth.user!.id}`, data: projects })
    }

    public async getProjectTables({ params, response, bouncer }: HttpContext) {
        const project = await this.projectService.getById(params.id)
        if (!project) {
            return response.status(404).json({ message: 'Project not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('view', project)

        const tables = await this.tableService.getByProject(project.id)

        return response.status(200).json({
            message: 'Project tables',
            data: tables,
        })
    }

    public async getProjectGuests({ params, response, bouncer }: HttpContext) {
        const project = await this.projectService.getById(params.id)
        if (project === null) {
            return response.status(404).json({ message: 'Project not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('view', project)

        const guests = await this.guestService.getByProject(project.id)
        return response.status(200).json({
            message: 'Project guests',
            data: guests,
        })
    }
}
