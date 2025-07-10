
import { DateTime } from 'luxon'
import {
    Guest,
    Table,
    Project,
    ProjectStats,
    TableOccupancy,
    SubscriptionPlan,
    SubscriptionLimits,
    EventType
} from '../types/index'

// ================================
// UTILITAIRES POUR INVITÉS
// ================================

export function getGuestFullName(guest: Guest): string {
    return `${guest.firstName} ${guest.lastName}`.trim()
}

export function searchGuestsByName(guests: Guest[], query: string): Guest[] {
    if (!query.trim()) return guests

    const normalizedQuery = normalizeSearchQuery(query)

    return guests
        .map(guest => ({
            guest,
            similarity: calculateSimilarity(getGuestFullName(guest), query)
        }))
        .filter(({ similarity }) => similarity > 0.3)
        .sort((a, b) => b.similarity - a.similarity)
        .map(({ guest }) => guest)
}

export function normalizeSearchQuery(query: string): string {
    return query
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .trim()
}

/**
 * Calcule la similarité entre deux chaînes (algorithme simple)
 */
export function calculateSimilarity(str1: string, str2: string): number {
    const s1 = normalizeSearchQuery(str1)
    const s2 = normalizeSearchQuery(str2)

    if (s1.includes(s2) || s2.includes(s1)) return 0.8

    // Levenshtein distance approximative
    const maxLen = Math.max(s1.length, s2.length)
    if (maxLen === 0) return 1

    const distance = levenshteinDistance(s1, s2)
    return (maxLen - distance) / maxLen
}

/**
 * Calcule la distance de Levenshtein entre deux chaînes
 */
function levenshteinDistance(str1: string, str2: string): number {
    const matrix = []

    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1]
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                )
            }
        }
    }

    return matrix[str2.length][str1.length]
}

// ================================
// UTILITAIRES POUR TABLES
// ================================

/**
 * Calcule l'occupation d'une table
 */
export function calculateTableOccupancy(table: Table, guests: Guest[]): TableOccupancy {
    const tableGuests = guests.filter(g => g.tableId === table.id)
    const occupiedSeats = tableGuests.length
    const availableSeats = table.capacity - occupiedSeats
    const occupancyRate = table.capacity > 0 ? (occupiedSeats / table.capacity) * 100 : 0

    return {
        tableId: table.id,
        tableName: table.name,
        capacity: table.capacity,
        occupiedSeats,
        availableSeats,
        occupancyRate,
        guests: tableGuests
    }
}

/**
 * Trouve les tables disponibles pour un nombre de places donné
 */
export function findAvailableTables(
    tables: Table[],
    guests: Guest[],
    requiredSeats: number = 1
): Table[] {
    return tables.filter(table => {
        const occupiedSeats = guests.filter(g => g.tableId === table.id).length
        return table.capacity - occupiedSeats >= requiredSeats
    })
}

/**
 * Assigne automatiquement des invités à des tables
 */
export function autoAssignGuests(
    unassignedGuests: Guest[],
    availableTables: Table[],
    currentGuests: Guest[]
): { tableId: string; guestIds: string[] }[] {
    const assignments: { tableId: string; guestIds: string[] }[] = []
    const tablesWithCapacity = availableTables.map(table => ({
        ...table,
        availableSeats: table.capacity - currentGuests.filter(g => g.tableId === table.id).length
    }))

    for (const guest of unassignedGuests) {
        const availableTable = tablesWithCapacity.find(t => t.availableSeats > 0)
        if (availableTable) {
            let assignment = assignments.find(a => a.tableId === availableTable.id)
            if (!assignment) {
                assignment = { tableId: availableTable.id, guestIds: [] }
                assignments.push(assignment)
            }
            assignment.guestIds.push(guest.id)
            availableTable.availableSeats--
        }
    }

    return assignments
}

// ================================
// UTILITAIRES POUR PROJETS
// ================================

/**
 * Calcule les statistiques d'un projet
 */
export function calculateProjectStats(project: Project): ProjectStats {
    const tables = project.tables || []
    const guests = project.guests || []

    const totalTables = tables.length
    const totalGuests = guests.length
    const assignedGuests = guests.filter(g => g.tableId).length
    const unassignedGuests = totalGuests - assignedGuests

    const occupancyRate = totalGuests > 0 ? (assignedGuests / totalGuests) * 100 : 0

    const totalCapacity = tables.reduce((sum, table) => sum + table.capacity, 0)
    const averageTableOccupancy = totalCapacity > 0 ? (assignedGuests / totalCapacity) * 100 : 0

    return {
        totalTables,
        totalGuests,
        assignedGuests,
        unassignedGuests,
        occupancyRate,
        averageTableOccupancy
    }
}

/**
 * Génère une URL pour le QR code d'un projet
 */
export function generateQRCodeUrl(projectId: string, baseUrl: string): string {
    return `${baseUrl}/search/${projectId}`
}

/**
 * Valide si une date d'événement est valide
 */
export function isValidEventDate(date: Date): boolean {
    const now = new Date()
    const eventDate = new Date(date)

    // L'événement doit être dans le futur (ou aujourd'hui)
    return eventDate >= new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/**
 * Formate une date d'événement pour l'affichage
 */
export function formatEventDate(date: Date, locale: string = 'fr-FR'): string {
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date))
}

// ================================
// UTILITAIRES POUR ABONNEMENTS
// ================================

/**
 * Obtient les limites d'un plan d'abonnement
 */
export function getSubscriptionLimits(plan: SubscriptionPlan): SubscriptionLimits {
    const limits: Record<SubscriptionPlan, SubscriptionLimits> = {
        [SubscriptionPlan.FREE]: {
            maxProjects: 1,
            maxGuestsPerProject: 30,
            features: ['basic_search', 'qr_code']
        },
        [SubscriptionPlan.STARTER]: {
            maxProjects: 3,
            maxGuestsPerProject: 100,
            features: ['basic_search', 'qr_code', 'csv_import', 'basic_analytics']
        },
        [SubscriptionPlan.PRO]: {
            maxProjects: -1, // illimité
            maxGuestsPerProject: 500,
            features: ['basic_search', 'qr_code', 'csv_import', 'basic_analytics', 'advanced_search', 'custom_branding']
        },
        [SubscriptionPlan.ENTERPRISE]: {
            maxProjects: -1, // illimité
            maxGuestsPerProject: -1, // illimité
            features: ['basic_search', 'qr_code', 'csv_import', 'basic_analytics', 'advanced_search', 'custom_branding', 'api_access', 'priority_support']
        }
    }

    return limits[plan]
}

/**
 * Vérifie si un utilisateur peut créer un nouveau projet
 */
export function canCreateProject(currentProjects: number, plan: SubscriptionPlan): boolean {
    const limits = getSubscriptionLimits(plan)
    return limits.maxProjects === -1 || currentProjects < limits.maxProjects
}

/**
 * Vérifie si un utilisateur peut ajouter des invités à un projet
 */
export function canAddGuests(currentGuests: number, plan: SubscriptionPlan, additionalGuests: number = 1): boolean {
    const limits = getSubscriptionLimits(plan)
    return limits.maxGuestsPerProject === -1 || (currentGuests + additionalGuests) <= limits.maxGuestsPerProject
}

/**
 * Vérifie si une fonctionnalité est disponible pour un plan
 */
export function hasFeature(plan: SubscriptionPlan, feature: string): boolean {
    const limits = getSubscriptionLimits(plan)
    return limits.features.includes(feature)
}

// ================================
// UTILITAIRES POUR DATES
// ================================

/**
 * Convertit une date string ISO en objet Date
 */
export function parseISODate(dateString: string): Date {
    return DateTime.fromISO(dateString).toJSDate()
}

/**
 * Convertit un objet Date en string ISO
 */
export function toISOString(date: Date): string {
    return DateTime.fromJSDate(date).toISO() || ''
}

/**
 * Calcule le nombre de jours jusqu'à un événement
 */
export function daysUntilEvent(eventDate: Date): number {
    const now = DateTime.now()
    const event = DateTime.fromJSDate(eventDate)
    return Math.ceil(event.diff(now, 'days').days)
}

/**
 * Vérifie si un événement est dans le passé
 */
export function isEventPast(eventDate: Date): boolean {
    return DateTime.fromJSDate(eventDate) < DateTime.now()
}

// ================================
// UTILITAIRES POUR VALIDATION
// ================================

/**
 * Valide un email
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Valide un mot de passe
 */
export function isValidPassword(password: string, minLength: number = 8): boolean {
    return password.length >= minLength
}

/**
 * Valide un nom (prénom ou nom de famille)
 */
export function isValidName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50
}

/**
 * Valide une capacité de table
 */
export function isValidTableCapacity(capacity: number): boolean {
    return Number.isInteger(capacity) && capacity > 0 && capacity <= 50
}

// ================================
// UTILITAIRES POUR FORMATAGE
// ================================

/**
 * Formate un nombre en pourcentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
    return `${value.toFixed(decimals)}%`
}

/**
 * Formate un nom d'événement selon le type
 */
export function formatEventTypeName(eventType: EventType, locale: string = 'fr'): string {
    const names: Record<EventType, Record<string, string>> = {
        [EventType.WEDDING]: { fr: 'Mariage', en: 'Wedding' },
        [EventType.BAR_MITZVAH]: { fr: 'Bar Mitzvah', en: 'Bar Mitzvah' },
        [EventType.ANNIVERSARY]: { fr: 'Anniversaire', en: 'Anniversary' },
        [EventType.CORPORATE]: { fr: 'Événement d\'entreprise', en: 'Corporate Event' },
        [EventType.OTHER]: { fr: 'Autre', en: 'Other' }
    }

    return names[eventType][locale] || names[eventType]['en']
}

/**
 * Génère un slug à partir d'un nom
 */
export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
}

// ================================
// UTILITAIRES POUR ARRAYS
// ================================

/**
 * Groupe un tableau par une clé
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
    return array.reduce((groups, item) => {
        const group = String(item[key])
        groups[group] = groups[group] || []
        groups[group].push(item)
        return groups
    }, {} as Record<string, T[]>)
}

/**
 * Supprime les doublons d'un tableau
 */
export function uniqueBy<T, K extends keyof T>(array: T[], key: K): T[] {
    const seen = new Set()
    return array.filter(item => {
        const value = item[key]
        if (seen.has(value)) {
            return false
        }
        seen.add(value)
        return true
    })
}

/**
 * Mélange un tableau (Fisher-Yates)
 */
export function shuffle<T>(array: T[]): T[] {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
}

// ================================
// CONSTANTES UTILES
// ================================

export const DEFAULT_PAGINATION_LIMIT = 20
export const MAX_PAGINATION_LIMIT = 100
export const DEFAULT_SEARCH_LIMIT = 10
export const MIN_SEARCH_SIMILARITY = 0.3
export const QR_CODE_SIZE = 256
export const SUPPORTED_IMAGE_FORMATS = ['png', 'jpg', 'jpeg', 'gif', 'webp']
export const SUPPORTED_EXPORT_FORMATS = ['csv', 'xlsx', 'pdf']

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
    [EventType.WEDDING]: '#f43f5e',
    [EventType.BAR_MITZVAH]: '#3b82f6',
    [EventType.ANNIVERSARY]: '#10b981',
    [EventType.CORPORATE]: '#6b7280',
    [EventType.OTHER]: '#8b5cf6'
}