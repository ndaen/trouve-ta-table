import Project from '#models/project'
import {ProjectPayload} from "#types/project";
import User from "#models/user";

export default class ProjectService {

	public async createProject(payload: ProjectPayload) {
		return Project.create(payload)
	}

	public async getAll() {
		return Project.query().preload('user').preload('tables').preload('guests');
	}

	public async getAllByUser(userId: string, isActive: boolean) {
		if (isActive) {
			return Project.query().where('userId', userId).andWhere('isActive', true);
		}
		return Project.query().where('user_id', userId);
	}

	public async getById(projectId: string) {
		return Project.query()
			.where('id', projectId)
			.preload('tables')
			.preload('guests')
			.first();
	}

	public async updateProject(projectId: string, payload: Partial<ProjectPayload>, user: User) {
		const project = await Project.query().where('id', projectId).first();
		if (!project) {
			return {
				error: 'Project not found',
				status: 404
			};
		}
		if (user.id === project.userId || user.role === 'admin') {
			project.merge(payload);
			await project.save();
		} else {
			return {
				error: 'You do not have permission to update this project',
				status: 403
			};
		}
		return project;
	}

	public async deleteProject(projectId: string, user: User) {
		const project = await Project.query().where('id', projectId).first();
		if (!project) {
			return {
				error: 'Project not found',
				status: 404
			};
		}
		if (user.id === project.userId || user.role === 'admin') {
			await project.delete();
			return {message: `Project with ID: ${projectId} deleted successfully`};
		} else {
			return {
				error: 'You do not have permission to delete this project',
				status: 403
			};
		}
	}
}
