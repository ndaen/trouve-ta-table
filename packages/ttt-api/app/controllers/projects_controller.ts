import type { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import ProjectService from '#services/project_service'
import type { CreateProjectPayload } from '#types/index'

export default class ProjectsController {
    private projectService: ProjectService

    constructor() {
        this.projectService = new ProjectService()
    }

    public async index({ response }: HttpContext) {
        const projects = await this.projectService.getAll()
        if (projects.length === 0) {
            return response.status(404).json({ message: 'No projects found' })
        }
        return response.json({ message: 'List of projects', data: projects })
    }

    public async show({ params, response }: HttpContext) {
        const projectId = params.id
        const project = await this.projectService.getById(projectId)
        if (!project) {
            return response.status(404).json({ message: 'Project not found' })
        }
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

    public async update({ params, request, response, auth }: HttpContext) {
        const result = await this.projectService.updateProject(
            params.id,
            request.body(),
            auth.user!
        )
        if (!(result instanceof Project)) {
            return response.status(result.status).json({ message: result.error })
        }
        return response.json({ message: `Project updated successfully`, data: result })
    }

    public async delete({ params, response, auth }: HttpContext) {
        const projectId = params.id
        const result = await this.projectService.deleteProject(projectId, auth.user!)
        if (result.error) {
            return response.status(result.status).json({ message: result.error })
        }
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
        if (projects.length === 0) {
            return response.status(404).json({ message: 'No projects found for this user' })
        }
        return response.json({ message: `Projects for user ID: ${auth.user!.id}`, data: projects })
    }
}
