// ================================
// TYPES DE BASE
// ================================

export type UUID = string
export type TimestampString = string

// ================================
// ENUMS
// ================================

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}

export enum SubscriptionPlan {
    FREE = 'free',
    STARTER = 'starter',
    PRO = 'pro',
    ENTERPRISE = 'enterprise'
}

export enum EventType {
    WEDDING = 'wedding',
    BAR_MITZVAH = 'bar_mitzvah',
    ANNIVERSARY = 'anniversary',
    CORPORATE = 'corporate',
    OTHER = 'other'
}

// ================================
// INTERFACES PRINCIPALES
// ================================

export interface User {
    id: UUID
    email: string
    firstName: string
    lastName: string
    role: UserRole
    subscriptionPlan: SubscriptionPlan
    subscriptionExpiresAt?: Date | null
    createdAt: Date
    updatedAt: Date
}

export interface Project {
    id: UUID
    userId: UUID
    name: string
    eventType: EventType
    eventDate: Date
    venue: string
    description?: string | null
    qrCodeUrl?: string | null
    isActive: boolean
    deletedAt?: Date | null
    createdAt: Date
    updatedAt: Date

    // Relations optionnelles (pour les requêtes avec preload)
    user?: User
    tables?: Table[]
    guests?: Guest[]

    // Propriétés calculées
    stats?: ProjectStats
}

export interface Table {
    id: UUID
    projectId: UUID
    name: string
    capacity: number
    description?: string | null
    createdAt: Date
    updatedAt: Date

    // Relations optionnelles
    project?: Project
    guests?: Guest[]

    // Propriétés calculées
    occupancy?: number
    availableSeats?: number
}

export interface Guest {
    id: UUID
    projectId: UUID
    tableId?: UUID | null
    firstName: string
    lastName: string
    email?: string | null
    dietaryRequirements?: string | null
    createdAt: Date
    updatedAt: Date

    // Relations optionnelles
    project?: Project
    table?: Table

    // Propriétés calculées
    fullName?: string
}

// ================================
// TYPES CALCULÉS ET STATS
// ================================

export interface ProjectStats {
    totalTables: number
    totalGuests: number
    assignedGuests: number
    unassignedGuests: number
    occupancyRate: number
    averageTableOccupancy: number
}

export interface TableOccupancy {
    tableId: UUID
    tableName: string
    capacity: number
    occupiedSeats: number
    availableSeats: number
    occupancyRate: number
    guests: Guest[]
}

export interface SubscriptionLimits {
    maxProjects: number
    maxGuestsPerProject: number
    features: string[]
    priceMonthly?: number
    priceYearly?: number
}

export interface ProjectSummary {
    project: Project
    stats: ProjectStats
    tableOccupancies: TableOccupancy[]
}

// ================================
// DTOs POUR API
// ================================

export interface CreateUserDto {
    email: string
    password: string
    firstName: string
    lastName: string
}

export interface UpdateUserDto {
    email?: string
    firstName?: string
    lastName?: string
    subscriptionPlan?: SubscriptionPlan
}

export interface CreateProjectDto {
    name: string
    eventType: EventType
    eventDate: string | Date
    venue: string
    description?: string
}

export interface UpdateProjectDto {
    name?: string
    eventType?: EventType
    eventDate?: string | Date
    venue?: string
    description?: string
    isActive?: boolean
}

export interface CreateTableDto {
    name: string
    capacity: number
    description?: string
}

export interface UpdateTableDto {
    name?: string
    capacity?: number
    description?: string
}

export interface CreateGuestDto {
    firstName: string
    lastName: string
    email?: string
    dietaryRequirements?: string
    tableId?: UUID
}

export interface UpdateGuestDto {
    firstName?: string
    lastName?: string
    email?: string
    dietaryRequirements?: string
    tableId?: UUID
}

export interface BulkCreateGuestsDto {
    guests: CreateGuestDto[]
    skipDuplicates?: boolean
}

// ================================
// TYPES POUR AUTHENTIFICATION
// ================================

export interface LoginDto {
    email: string
    password: string
}

export interface RegisterDto {
    email: string
    password: string
    firstName: string
    lastName: string
}

export interface AuthResponse {
    user: User
    token: string
    expiresIn: number
}

export interface RefreshTokenDto {
    refreshToken: string
}

// ================================
// TYPES POUR RECHERCHE
// ================================

export interface SearchGuestDto {
    query: string
    projectId: UUID
    limit?: number
}

export interface SearchGuestResult {
    guest: Guest
    table?: Table
    similarity?: number
}

export interface SearchResponse {
    results: SearchGuestResult[]
    total: number
    query: string
    executionTime: number
}

// ================================
// TYPES POUR PAGINATION
// ================================

export interface PaginationParams {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

// ================================
// TYPES POUR IMPORT/EXPORT
// ================================

export interface CsvImportResult {
    success: boolean
    imported: number
    skipped: number
    errors: CsvImportError[]
}

export interface CsvImportError {
    row: number
    field: string
    value: string
    error: string
}

export interface ExportOptions {
    format: 'csv' | 'xlsx' | 'pdf'
    includeUnassigned: boolean
    includeStats: boolean
}

// ================================
// TYPES POUR ABONNEMENTS
// ================================

export interface SubscriptionLimits {
    maxProjects: number
    maxGuestsPerProject: number
    features: string[]
    priceMonthly?: number
    priceYearly?: number
}

export interface SubscriptionUsage {
    currentProjects: number
    maxProjects: number
    currentGuests: number
    maxGuests: number
    canCreateProject: boolean
    canAddGuest: boolean
}

// ================================
// TYPES POUR ERREURS
// ================================

export interface ApiError {
    message: string
    code: string
    statusCode: number
    details?: any
    timestamp: Date
}

export interface ValidationError {
    field: string
    message: string
    value?: any
}

export interface ValidationErrorResponse {
    message: string
    errors: ValidationError[]
}

// ================================
// TYPES POUR ÉVÉNEMENTS
// ================================

export interface ProjectEvent {
    type: 'project_created' | 'project_updated' | 'project_deleted'
    projectId: UUID
    userId: UUID
    data: any
    timestamp: Date
}

export interface GuestEvent {
    type: 'guest_added' | 'guest_updated' | 'guest_deleted' | 'guest_assigned' | 'guest_unassigned'
    guestId: UUID
    projectId: UUID
    tableId?: UUID
    data: any
    timestamp: Date
}

// ================================
// TYPES UTILITAIRES
// ================================

export type Partial<T> = {
    [P in keyof T]?: T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OmitTimestamps<T> = Omit<T, 'createdAt' | 'updatedAt'>

export type CreateInput<T> = OmitTimestamps<Omit<T, 'id'>>

export type UpdateInput<T> = Partial<OmitTimestamps<Omit<T, 'id'>>>

// ================================
// TYPES POUR CONFIGURATION
// ================================

export interface AppConfig {
    name: string
    version: string
    environment: 'development' | 'production' | 'test'
    apiUrl: string
    frontendUrl: string
    features: {
        subscriptions: boolean
        analytics: boolean
        notifications: boolean
    }
}

export interface DatabaseConfig {
    host: string
    port: number
    database: string
    username: string
    password: string
    ssl: boolean
}

export interface AuthConfig {
    jwtSecret: string
    jwtExpiresIn: string
    refreshTokenExpiresIn: string
    passwordMinLength: number
    passwordRequireSpecialChars: boolean
}