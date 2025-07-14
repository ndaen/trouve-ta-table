import type {HttpContext} from '@adonisjs/core/http'
import Guest from "#models/guest";
import {GuestService} from "#services/guest_service";

export default class GuestsController {

	private guestService: GuestService

	constructor() {
		this.guestService = new GuestService();
	}

	public async index({response}: HttpContext) {
		const guests = await this.guestService.getAll();
		if (guests.length === 0) {
			return response.status(404).json({message: 'No guests found'});
		}
		return response.status(200).json({message: 'List of all guests', data: guests});
	}

	public async show({params, response}: HttpContext) {
		const guest = await this.guestService.getById(params.id);
		if (!guest) {
			return response.status(404).json({message: 'Guest not found'});
		}
		return response.status(200).json({message: 'Guest details', data: guest});
	}

	public async create({request, response}: HttpContext) {
		const guestData = request.only(['projectId', 'firstName', 'lastName', 'email', 'dietaryRequirements']);
		const guest = await this.guestService.create(guestData);
		return response.status(201).json({message: 'Guest created successfully', data: guest});
	}

	public async update({params, request, response, auth}: HttpContext) {
		const result = await this.guestService.update(
			params.id,
			request.only(['firstName', 'lastName', 'email', 'dietaryRequirements']),
			auth.user!
		);
		if (!(result instanceof Guest)) {
			return response.status(result.status).json({message: result.error});
		}
		return response.status(200).json({message: 'Guest updated successfully', data: result});
	}

	public async delete({params, response, auth}: HttpContext) {
		const result = await this.guestService.delete(params.id, auth.user!);
		if (result.status) {
			return response.status(result.status).json({message: result.message});
		}
		return response.status(200).json(result.message);
	}

	public async assignToTable({params, request, response}: HttpContext) {
		const {tableId} = request.only(['tableId']);
		if (!tableId) {
			return response.status(400).json({message: 'Table ID is required'});
		}
		const result = await this.guestService.assignToTable(params.id, tableId);

		if (!(result instanceof Guest)) {
			return response.status(result.status).json({message: result.error});
		}

		return response.status(200).json({message: 'Guest assigned to table successfully', data: result});
	}

	public async unassignFromTable({params, response}: HttpContext) {
		const guest = await this.guestService.unassignFromTable(params.id);
		if (!(guest instanceof Guest)) {
			return response.status(guest.status).json({message: guest.error});
		}
		return response.status(200).json({message: 'Guest unassigned from table successfully', data: guest});
	}

	public async getUnassignedGuests({params, response}: HttpContext) {
		const guests = await this.guestService.getUnassignedGuests(params.id);
		if (guests.length === 0) {
			return response.status(404).json({message: 'No unassigned guests found'});
		}
		return response.status(200).json({message: 'List of unassigned guests', data: guests});
	}
}
