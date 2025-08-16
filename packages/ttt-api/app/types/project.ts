import type { UUID, EventType } from './common.js'
import { DateTime } from 'luxon'

export interface ProjectData {
    id: UUID
    userId: UUID
    name: string
    eventType: EventType
    eventDate: DateTime
    venue: string
    description: string
    qrCodeUrl?: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    deletedAt: string | null
}

export interface CreateProjectPayload {
    name: string
    eventType: EventType
    eventDate: DateTime
    venue: string
    description?: string
    userId: string
}

export interface UpdateProjectPayload {
    name?: string
    eventType?: EventType
    eventDate?: DateTime
    venue?: string
    description?: string
    qrCodeUrl?: string
    isActive?: boolean
}

export interface ProjectWithStats extends ProjectData {
    totalTables: number
    totalGuests: number
    assignedGuests: number
    unassignedGuests: number
}

export { EventType }
