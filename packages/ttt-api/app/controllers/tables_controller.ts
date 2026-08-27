import type { HttpContext } from '@adonisjs/core/http'
import Table from '#models/table'
import Project from '#models/project'
import { TableService } from '#services/table_service'
import ProjectPolicy from '#policies/project_policy'
import { createTableValidator, updateTableValidator } from '#validators/table'

export default class TablesController {
    private tableService: TableService

    constructor() {
        this.tableService = new TableService()
    }

    public async show({ params, response, bouncer }: HttpContext) {
        const table = await this.tableService.getById(params.id)
        if (!table) {
            return response.status(404).json({ message: 'Table not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('view', table.project)

        return response.status(200).json({ message: 'Table details', data: table })
    }

    public async create({ request, response, bouncer }: HttpContext) {
        const payload = await request.validateUsing(createTableValidator)

        const project = await Project.find(payload.projectId)
        if (!project) {
            return response.status(404).json({ message: 'Project not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', project)

        const table = await this.tableService.create(payload)
        return response.status(201).json({ message: 'Table created successfully', data: table })
    }

    public async update({ params, request, response, bouncer }: HttpContext) {
        const table = await this.tableService.getById(params.id)
        if (!table) {
            return response.status(404).json({ message: 'Table not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', table.project)

        const payload = await request.validateUsing(updateTableValidator)
        const result = await this.tableService.update(params.id, payload)

        if (!(result instanceof Table)) {
            if (result.error) {
                return response.status(result.status).json({ message: result.error })
            }
        }
        return response.status(200).json({ message: 'Table updated successfully', data: result })
    }

    public async delete({ params, response, bouncer }: HttpContext) {
        const table = await this.tableService.getById(params.id)
        if (!table) {
            return response.status(404).json({ message: 'Table not found' })
        }
        await bouncer.with(ProjectPolicy).authorize('manage', table.project)

        const result = await this.tableService.delete(params.id)

        if (result.status) {
            return response.status(result.status).json({ message: result.message })
        }
        return response.status(200).json({ result })
    }
}
