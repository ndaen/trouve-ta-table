import type { HttpContext } from '@adonisjs/core/http'
import Project from "#models/project";

export default class ProjectsController {
  public async index({ response}: HttpContext) {
    const projects = await Project.query().preload('user');
    if (projects.length === 0) {
      return response.status(404).json({ message: 'No projects found' })
    }
    response.json({ message: 'List of projects', data: projects })
  }

  public async show({ params, response }: HttpContext) {
    const projectId = params.id
    const project = await Project.query().where('id', projectId).preload('user').first();
    if (!project) {
      return response.status(404).json({ message: 'Project not found' })
    }
    response.json({ message: `Project details for ID: ${projectId}`, project })
  }

  public async create({ request, response }: HttpContext) {
    const payload = request.body()
    const project = await Project.create(payload)
    response.status(201).json({ message: 'Project created successfully', project })
  }

  public async update({ params, request, response, auth }: HttpContext) {
    const projectId = params.id
    const project = await Project.query().where('id', projectId).first();
    if (!project) {
      return response.status(404).json({ message: 'Project not found' })
    }

    if (auth.user?.id === project.userId || auth.user?.role === 'admin') {
      const payload = request.body()
      project.merge(payload)
      await project.save()
      response.json({ message: `Project updated successfully`, project })
    } else {
      return response.status(403).json({ message: 'You do not have permission to update this project' })
    }
  }

  public async delete({ params, response, auth }: HttpContext) {
    const projectId = params.id
    const project = await Project.query().where('id', projectId).first();
    if (!project) {
      return response.status(404).json({ message: 'Project not found' })
    }

    if (auth.user?.id === project.userId || auth.user?.role === 'admin') {
      await project.delete()
      response.json({ message: `Project with ID: ${projectId} deleted successfully` })
    } else {
      return response.status(403).json({ message: 'You do not have permission to delete this project' })
    }
  }

  public async showByUser({ response, auth, request }: HttpContext) {
    const userId = auth.user?.id
    let isActive = request.input('isActive');
    if (typeof isActive === 'string') {
      isActive = isActive.toLowerCase() === 'true' ? true : isActive.toLowerCase() === 'false' ? false : isActive;
    }

    if (!userId) {
      return response.status(401).json({ message: 'Unauthorized' })
    }

    if (isActive) {
      if (typeof isActive !== 'boolean') {
        return response.status(400).json({ message: 'Invalid isActive parameter, must be a boolean' })
      }

      const projects = await Project.query().where('userId', userId).andWhere('isActive', true).preload('user');
      if (projects.length === 0) {
        return response.status(404).json({ message: 'No active projects found for this user' })
      }
      response.json({ message: `Active projects for user ID: ${userId}`, data: projects })
      return;
    }
    const projects = await Project.query().where('userId', userId).preload('user');
    if (projects.length === 0) {
      return response.status(404).json({ message: 'No projects found for this user' })
    }
    response.json({ message: `Projects for user ID: ${userId}`, data: projects })
  }
}
