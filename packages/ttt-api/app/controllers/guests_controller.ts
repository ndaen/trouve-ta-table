import type {HttpContext} from '@adonisjs/core/http'
import Guest from "#models/guest";
import Table from "#models/table";

export default class GuestsController {

	public async index({response}: HttpContext) {
		const guests = await Guest.query().orderBy('created_at', 'desc');
		if (guests.length === 0) {
			return response.status(404).json({message: 'No guests found'});
		}
		return response.status(200).json({message: 'List of all guests', data: guests});
	}

	public async show({params, response}: HttpContext) {
		const guest = await Guest.find(params.id);
		if (!guest) {
			return response.status(404).json({message: 'Guest not found'});
		}
		return response.status(200).json({message: 'Guest details', data: guest});
	}

	public async create({request, response}: HttpContext) {
		const guestData = request.only(['projectId', 'firstName', 'lastName', 'email', 'dietaryRequirements']);
		const guest = await Guest.create(guestData);
		return response.status(201).json({message: 'Guest created successfully', data: guest});
	}

	public async update({params, request, response}: HttpContext) {
		const guest = await Guest.find(params.id);
		if (!guest) {
			return response.status(404).json({message: 'Guest not found'});
		}
		const guestData = request.only(['firstName', 'lastName', 'email', 'dietary_requirements']);
		guest.merge(guestData);
		await guest.save();
		return response.status(200).json({message: 'Guest updated successfully', data: guest});
	}

	public async delete({params, response}: HttpContext) {
		const guest = await Guest.find(params.id);
		if (!guest) {
			return response.status(404).json({message: 'Guest not found'});
		}
		await guest.delete();
		return response.status(200).json({message: 'Guest deleted successfully'});
	}

	public async assignToTable({params, request, response}: HttpContext) {
		const guest = await Guest.find(params.id);
		if (!guest) {
			return response.status(404).json({message: 'Guest not found'});
		}

		const {tableId} = request.only(['tableId']);
		if (!tableId) {
			return response.status(400).json({message: 'Table ID is required'});
		}
		const table = await Table.find(tableId);
		if (!table) {
			return response.status(404).json({message: `The table id : ${tableId} does not exist`});
		}

		if (table.projectId !== guest.projectId) {
			return response.status(400).json({message: 'The table does not belong to the same project as the guest'});
		}

		if (guest.tableId) {
			return response.status(400).json({message: 'The guest is already assigned to a table'});
		}

		if (typeof table.guests === 'object' &&  table.capacity <= table.guests.length) {
			return response.status(400).json({message: 'The table is already full'});
		}

		guest.tableId = tableId;
		await guest.save();

		return response.status(200).json({message: 'Guest assigned to table successfully', data: guest});
	}

	public async unassignFromTable({params, response}: HttpContext) {
		const guest = await Guest.find(params.id);
		if (!guest) {
			return response.status(404).json({message: 'Guest not found'});
		}

		guest.tableId = null;
		await guest.save();

		return response.status(200).json({message: 'Guest unassigned from table successfully', data: guest});
	}
}
