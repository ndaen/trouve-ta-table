// packages/ttt-api/app/types/guest.ts
import type { UUID } from './common.js'

/**
 * Guest interface matching the Guest model
 */
export interface GuestData {
    id: UUID
    projectId: UUID
    tableId: UUID | null
    firstName: string
    lastName: string
    email: string | null
    dietaryRequirements: string | null
    createdAt: string
    updatedAt: string
}

/**
 * Guest creation payload
 */
export interface CreateGuestPayload {
    projectId: UUID
    firstName: string
    lastName: string
    email?: string | null
    dietaryRequirements?: string | null
    tableId?: UUID | null
}

/**
 * Guest update payload
 */
export interface UpdateGuestPayload {
    firstName?: string
    lastName?: string
    email?: string | null
    dietaryRequirements?: string | null
    tableId?: UUID | null
}

/**
 * Guest with table information
 */
export interface GuestWithTable extends GuestData {
    table?: {
        id: UUID
        name: string
        capacity: number
    }
}

/**
 * Forme renvoyée par la recherche publique. Volontairement minimale : cette
 * route n'est pas authentifiée. Ni `id`, ni `email`, ni
 * `dietaryRequirements` — voir spec §6.3.
 */
export interface GuestSearchResult {
    firstName: string
    lastName: string
    fullName: string
    table: {
        name: string
        description: string | null
    } | null
}

/**
 * Bulk guest import payload
 */
export interface ImportGuestsPayload {
    projectId: UUID
    guests: Array<{
        firstName: string
        lastName: string
        email?: string
        dietaryRequirements?: string | null
        tableName?: string
    }>
}
