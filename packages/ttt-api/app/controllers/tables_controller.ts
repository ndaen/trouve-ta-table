import type { HttpContext } from '@adonisjs/core/http'
import Table from "#models/table";

export default class TablesController {
  public async index({ response }: HttpContext) {
    const tables = await Table.query().preload('guests');
    if (tables.length === 0) {
      return response.status(404).json({ message: 'No tables found' });
    }
    return response.status(200).json({message: 'List of all tables', data: tables});
  }

  public async show({ params, response }: HttpContext) {
    const table = await Table.query().where('id', params.id).preload('guests').first();
    if (!table) {
      return response.status(404).json({ message: 'Table not found' });
    }
    return response.status(200).json({message: 'Table details', data: table});
  }

  public async create({ request, response }: HttpContext) {
    const tableData = request.only(['projectId', 'name', 'description', 'capacity']);
    const table = await Table.create(tableData);
    return response.status(201).json({message: 'Table created successfully', data: table});
  }

  public async update({ params, request, response, auth }: HttpContext) {
    const table = await Table.query().preload('project').where('id', params.id).first();
    if (!table) {
      return response.status(404).json({ message: 'Table not found' });
    }
    if (auth.user?.id !== table.project.userId && auth.user?.role !== 'admin') {
      return response.status(403).json({ message: 'You do not have permission to update this table' });
    }
    const tableData = request.only(['name', 'description', 'capacity']);
    table.merge(tableData);
    await table.save();
    return response.status(200).json({message: 'Table updated successfully', data: table});
  }

  public async delete({ params, response, auth }: HttpContext) {
    const table = await Table.query().preload('project').where('id', params.id).first();
    if (!table) {
      return response.status(404).json({ message: 'Table not found' });
    }
    if (auth.user?.id !== table.project.userId && auth.user?.role !== 'admin') {
      return response.status(403).json({ message: 'You do not have permission to delete this table' });
    }
    await table.delete();
    return response.status(200).json({message: 'Table deleted successfully'});
  }
}
