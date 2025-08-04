// packages/ttt-api/app/types/table.ts
import type { UUID } from './common.js'

/**
 * Table interface matching the Table model
 */
export interface TableData {
	id: UUID
	projectId: UUID
	name: string
	description: string
	capacity: number
	createdAt: string
	updatedAt: string
}

/**
 * Table creation payload
 */
export interface CreateTablePayload {
	projectId: UUID
	name: string
	description?: string
	capacity: number
}

/**
 * Table update payload
 */
export interface UpdateTablePayload {
	name?: string
	description?: string
	capacity?: number
}

/**
 * Table with guest count
 */
export interface TableWithStats extends TableData {
	guestCount: number
	availableSpots: number
	isFull: boolean
}

/**
 * Table with guests information
 */
export interface TableWithGuests extends TableData {
	guests: Array<{
		id: UUID
		firstName: string
		lastName: string
		fullName: string
		email: string
	}>
	guestCount: number
	availableSpots: number
}
