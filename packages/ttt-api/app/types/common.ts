
/**
 * UUID string type for better type safety
 */
export type UUID = string

/**
 * User roles in the application
 */
export type UserRole = 'admin' | 'user'

/**
 * Subscription plans available
 */
export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise'

/**
 * Event types for projects
 */
export type EventType = 'wedding' | 'bar_mitzvah' | 'anniversary' | 'corporate' | 'other'

/**
 * Common API response structure
 */
export interface ApiResponse<T = any> {
	success: boolean
	data?: T
	message?: string
	errors?: Record<string, string[]>
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
	total: number
	perPage: number
	currentPage: number
	lastPage: number
	firstPage: number
	firstPageUrl: string
	lastPageUrl: string
	nextPageUrl: string | null
	previousPageUrl: string | null
}
