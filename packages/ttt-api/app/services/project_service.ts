import Project from '#models/project'
import { type CreateProjectPayload } from '#types/project'

export default class ProjectService {
    public async createProject(payload: CreateProjectPayload) {
        return Project.create(payload)
    }

    public async getAllByUser(userId: string, isActive: boolean) {
        if (isActive) {
            return Project.query()
                .where('userId', userId)
                .andWhere('isActive', true)
                .preload('tables')
                .preload('guests')
                .orderBy('updatedAt', 'asc')
        }
        return Project.query().where('userId', userId).preload('tables').preload('guests')
    }

    public async getById(projectId: string) {
        return Project.query().where('id', projectId).preload('tables').preload('guests').first()
    }

    public async updateProject(projectId: string, payload: Partial<CreateProjectPayload>) {
        const project = await Project.query().where('id', projectId).first()
        if (!project) {
            return {
                error: 'Project not found',
                status: 404,
            }
        }
        project.merge(payload)
        await project.save()
        return project
    }

    public async deleteProject(projectId: string) {
        const project = await Project.query().where('id', projectId).first()
        if (!project) {
            return {
                error: 'Project not found',
                status: 404,
            }
        }
        await project.delete()
        return { message: `Project with ID: ${projectId} deleted successfully` }
    }
}
