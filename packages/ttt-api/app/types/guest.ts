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
    email: string
    dietary_requirements: string
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
    email?: string
    dietary_requirements?: string
    tableId?: UUID | null
}

/**
 * Guest update payload
 */
export interface UpdateGuestPayload {
    firstName?: string
    lastName?: string
    email?: string
    dietary_requirements?: string
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
 * Guest search result
 */
export interface GuestSearchResult {
    id: UUID
    firstName: string
    lastName: string
    fullName: string
    table?: {
        id: UUID
        name: string
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
        dietary_requirements?: string
        tableName?: string
    }>
}
