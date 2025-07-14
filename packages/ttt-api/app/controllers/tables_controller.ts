import type {HttpContext} from '@adonisjs/core/http'
import Table from "#models/table";
import {TableService} from '#services/table_service';

export default class TablesController {

	private tableService: TableService

	constructor() {
		this.tableService = new TableService();
	}

	public async index({response}: HttpContext) {
		const tables = await this.tableService.getAll();
		if (tables.length === 0) {
			return response.status(404).json({message: 'No tables found'});
		}
		return response.status(200).json({message: 'List of all tables', data: tables});
	}

	public async show({params, response}: HttpContext) {
		const table = await this.tableService.getById(params.id);
		if (!table) {
			return response.status(404).json({message: 'Table not found'});
		}
		return response.status(200).json({message: 'Table details', data: table});
	}

	public async create({request, response}: HttpContext) {
		const tableData = request.only(['projectId', 'name', 'description', 'capacity']);
		const table = await this.tableService.create(tableData);
		return response.status(201).json({message: 'Table created successfully', data: table});
	}

	public async update({params, request, response, auth}: HttpContext) {
		const result = await this.tableService.update(
			params.id,
			request.only(['name', 'description', 'capacity']),
			auth.user!
		);

		if (!(result instanceof Table)) {
			if (result.error) {
				return response.status(result.status).json({message: result.error});
			}
		}
		return response.status(200).json({message: 'Table updated successfully', data: result});
	}

	public async delete({params, response, auth}: HttpContext) {
		const result = await this.tableService.delete(params.id, auth.user!);

		if (result.status) {
			return response.status(result.status).json({message: result.message});
		}
		return response.status(200).json({result});
	}
}
