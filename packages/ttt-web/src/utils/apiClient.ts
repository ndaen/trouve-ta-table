const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'

export interface ApiCallOptions extends RequestInit {
    skipAuth?: boolean
    skipErrorHandling?: boolean
}

export async function apiCall<T>(
    endpoint: string,
    options: ApiCallOptions = {}
): Promise<T> {
    const {
        skipAuth = false,
        skipErrorHandling = false,
        ...fetchOptions
    } = options

    const config: RequestInit = {
        ...fetchOptions,
        headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
        },
    }

    if (!skipAuth) {
        config.credentials = 'include'
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

        if (!response.ok && !skipErrorHandling) {
            const errorData = await response.json().catch(() => ({}))
            throw new ApiError(
                errorData.message || `Erreur ${response.status}`,
                response.status,
                errorData
            )
        }

        if (skipErrorHandling) {
            return response as T
        }

        return await response.json()
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }

        throw new ApiError(
            error instanceof Error ? error.message : 'Erreur réseau',
            0,
            { originalError: error }
        )
    }
}

export class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public data?: any
    ) {
        super(message)
        this.name = 'ApiError'
    }

    get isClientError() {
        return this.status >= 400 && this.status < 500
    }

    get isServerError() {
        return this.status >= 500
    }

    get isNetworkError() {
        return this.status === 0
    }

    get isUnauthorized() {
        return this.status === 401
    }

    get isForbidden() {
        return this.status === 403
    }

    get isNotFound() {
        return this.status === 404
    }

    get isValidationError() {
        return this.status === 422
    }
}

export const api = {
    get: <T>(endpoint: string, options?: ApiCallOptions) =>
        apiCall<T>(endpoint, { method: 'GET', ...options }),

    post: <T>(endpoint: string, data?: any, options?: ApiCallOptions) =>
        apiCall<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            ...options
        }),

    put: <T>(endpoint: string, data?: any, options?: ApiCallOptions) =>
        apiCall<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            ...options
        }),

    patch: <T>(endpoint: string, data?: any, options?: ApiCallOptions) =>
        apiCall<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
            ...options
        }),

    delete: <T>(endpoint: string, options?: ApiCallOptions) =>
        apiCall<T>(endpoint, { method: 'DELETE', ...options }),
}

export function buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined>
): string {
    if (!params) return endpoint

    const searchParams = new URLSearchParams()

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            searchParams.append(key, String(value))
        }
    })

    const queryString = searchParams.toString()
    return queryString ? `${endpoint}?${queryString}` : endpoint
}

export function isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
}