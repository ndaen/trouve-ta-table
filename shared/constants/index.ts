// src/constants/index.ts

import { EventType, SubscriptionPlan } from '../types/index'

// ================================
// CONSTANTES GÉNÉRALES
// ================================

export const APP_NAME = 'Trouve Ta Table'
export const APP_VERSION = '1.0.0'
export const APP_DESCRIPTION = 'Solution de gestion de placement pour événements'

// ================================
// CONSTANTES API
// ================================

export const API_VERSION = 'v1'
export const API_PREFIX = `/api/${API_VERSION}`

// Limites de pagination
export const PAGINATION = {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1
} as const

// Limites de recherche
export const SEARCH = {
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 50,
    MIN_QUERY_LENGTH: 2,
    MAX_QUERY_LENGTH: 100,
    MIN_SIMILARITY: 0.3
} as const

// Timeout et retry
export const REQUEST = {
    TIMEOUT: 30000, // 30 secondes
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000 // 1 seconde
} as const

// ================================
// CONSTANTES VALIDATION
// ================================

export const VALIDATION = {
    EMAIL: {
        MAX_LENGTH: 255,
        REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    PASSWORD: {
        MIN_LENGTH: 8,
        MAX_LENGTH: 128,
        REQUIRE_UPPERCASE: false,
        REQUIRE_LOWERCASE: false,
        REQUIRE_NUMBERS: false,
        REQUIRE_SPECIAL_CHARS: false
    },
    NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 50,
        REGEX: /^[a-zA-ZÀ-ÿ\-\s']+$/
    },
    PROJECT: {
        NAME_MIN_LENGTH: 3,
        NAME_MAX_LENGTH: 100,
        VENUE_MIN_LENGTH: 5,
        VENUE_MAX_LENGTH: 200,
        DESCRIPTION_MAX_LENGTH: 1000
    },
    TABLE: {
        NAME_MIN_LENGTH: 1,
        NAME_MAX_LENGTH: 50,
        MIN_CAPACITY: 1,
        MAX_CAPACITY: 50,
        DESCRIPTION_MAX_LENGTH: 500
    },
    GUEST: {
        FIRST_NAME_MIN_LENGTH: 2,
        FIRST_NAME_MAX_LENGTH: 50,
        LAST_NAME_MIN_LENGTH: 2,
        LAST_NAME_MAX_LENGTH: 50,
        EMAIL_MAX_LENGTH: 255,
        DIETARY_REQUIREMENTS_MAX_LENGTH: 500
    }
} as const

// ================================
// CONSTANTES ABONNEMENTS
// ================================

export const SUBSCRIPTION_LIMITS = {
    [SubscriptionPlan.FREE]: {
        maxProjects: 1,
        maxGuestsPerProject: 30,
        features: ['basic_search', 'qr_code'],
        priceMonthly: 0,
        priceYearly: 0
    },
    [SubscriptionPlan.STARTER]: {
        maxProjects: 3,
        maxGuestsPerProject: 100,
        features: ['basic_search', 'qr_code', 'csv_import', 'basic_analytics'],
        priceMonthly: 9.99,
        priceYearly: 99.99
    },
    [SubscriptionPlan.PRO]: {
        maxProjects: -1, // illimité
        maxGuestsPerProject: 500,
        features: ['basic_search', 'qr_code', 'csv_import', 'basic_analytics', 'advanced_search', 'custom_branding'],
        priceMonthly: 29.99,
        priceYearly: 299.99
    },
    [SubscriptionPlan.ENTERPRISE]: {
        maxProjects: -1, // illimité
        maxGuestsPerProject: -1, // illimité
        features: ['basic_search', 'qr_code', 'csv_import', 'basic_analytics', 'advanced_search', 'custom_branding', 'api_access', 'priority_support'],
        priceMonthly: 99.99,
        priceYearly: 999.99
    }
} as const

// ================================
// CONSTANTES ÉVÉNEMENTS
// ================================

export const EVENT_TYPES = {
    [EventType.WEDDING]: {
        label: 'Mariage',
        icon: '💍',
        color: '#f43f5e',
        description: 'Célébration de mariage'
    },
    [EventType.BAR_MITZVAH]: {
        label: 'Bar Mitzvah',
        icon: '🕎',
        color: '#3b82f6',
        description: 'Cérémonie de Bar Mitzvah'
    },
    [EventType.ANNIVERSARY]: {
        label: 'Anniversaire',
        icon: '🎂',
        color: '#10b981',
        description: 'Fête d\'anniversaire'
    },
    [EventType.CORPORATE]: {
        label: 'Événement d\'entreprise',
        icon: '🏢',
        color: '#6b7280',
        description: 'Événement professionnel'
    },
    [EventType.OTHER]: {
        label: 'Autre',
        icon: '🎉',
        color: '#8b5cf6',
        description: 'Autre type d\'événement'
    }
} as const

// ================================
// CONSTANTES FICHIERS
// ================================

export const FILE_UPLOAD = {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    SUPPORTED_FORMATS: ['csv', 'xlsx', 'xls'],
    MIME_TYPES: {
        'csv': 'text/csv',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'xls': 'application/vnd.ms-excel'
    }
} as const

export const IMAGE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    SUPPORTED_FORMATS: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    MIME_TYPES: {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
    }
} as const

// ================================
// CONSTANTES QR CODE
// ================================

export const QR_CODE = {
    DEFAULT_SIZE: 256,
    MIN_SIZE: 128,
    MAX_SIZE: 1024,
    FORMATS: ['png', 'svg', 'pdf'],
    ERROR_CORRECTION: 'M', // L, M, Q, H
    MARGIN: 4
} as const

// ================================
// CONSTANTES EXPORT
// ================================

export const EXPORT_FORMATS = {
    CSV: {
        extension: 'csv',
        mimeType: 'text/csv',
        label: 'CSV'
    },
    XLSX: {
        extension: 'xlsx',
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        label: 'Excel'
    },
    PDF: {
        extension: 'pdf',
        mimeType: 'application/pdf',
        label: 'PDF'
    }
} as const

// ================================
// CONSTANTES DATES
// ================================

export const DATE_FORMATS = {
    ISO: 'YYYY-MM-DD',
    DISPLAY_FR: 'DD/MM/YYYY',
    DISPLAY_US: 'MM/DD/YYYY',
    DATETIME_FR: 'DD/MM/YYYY HH:mm',
    DATETIME_US: 'MM/DD/YYYY HH:mm'
} as const

export const TIMEZONE_DEFAULT = 'Europe/Paris'

// ================================
// CONSTANTES ERREURS
// ================================

export const ERROR_CODES = {
    // Authentification
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',

    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    REQUIRED_FIELD: 'REQUIRED_FIELD',

    // Ressources
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',

    // Abonnements
    SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
    LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
    FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',

    // Serveur
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const

// ================================
// CONSTANTES NOTIFICATIONS
// ================================

export const NOTIFICATION_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
} as const

// ================================
// CONSTANTES CACHE
// ================================

export const CACHE_KEYS = {
    USER_PROFILE: 'user_profile',
    PROJECT_LIST: 'project_list',
    PROJECT_DETAILS: 'project_details',
    SUBSCRIPTION_LIMITS: 'subscription_limits',
    SEARCH_RESULTS: 'search_results'
} as const

export const CACHE_TTL = {
    SHORT: 5 * 60, // 5 minutes
    MEDIUM: 30 * 60, // 30 minutes
    LONG: 60 * 60 * 24 // 24 heures
} as const

// ================================
// CONSTANTES ANALYTICS
// ================================

export const ANALYTICS_EVENTS = {
    PROJECT_CREATED: 'project_created',
    PROJECT_UPDATED: 'project_updated',
    PROJECT_DELETED: 'project_deleted',
    GUEST_ADDED: 'guest_added',
    GUEST_ASSIGNED: 'guest_assigned',
    GUEST_SEARCHED: 'guest_searched',
    QR_CODE_GENERATED: 'qr_code_generated',
    QR_CODE_SCANNED: 'qr_code_scanned',
    CSV_IMPORTED: 'csv_imported',
    DATA_EXPORTED: 'data_exported',
    SUBSCRIPTION_UPGRADED: 'subscription_upgraded',
    SUBSCRIPTION_DOWNGRADED: 'subscription_downgraded'
} as const

// ================================
// CONSTANTES RATE LIMITING
// ================================

export const RATE_LIMITS = {
    AUTH: {
        LOGIN: { max: 5, windowMs: 15 * 60 * 1000 }, // 5 tentatives par 15 minutes
        REGISTER: { max: 3, windowMs: 60 * 60 * 1000 }, // 3 tentatives par heure
        FORGOT_PASSWORD: { max: 3, windowMs: 60 * 60 * 1000 }
    },
    API: {
        GENERAL: { max: 100, windowMs: 15 * 60 * 1000 }, // 100 requêtes par 15 minutes
        SEARCH: { max: 50, windowMs: 60 * 1000 }, // 50 recherches par minute
        UPLOAD: { max: 10, windowMs: 60 * 60 * 1000 } // 10 uploads par heure
    }
} as const

// ================================
// CONSTANTES REGEX
// ================================

export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^(?:\+33|0)[1-9](?:[0-9]{8})$/,
    NAME: /^[a-zA-ZÀ-ÿ\-\s']+$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    HEX_COLOR: /^#(?:[0-9a-fA-F]{3}){1,2}$/
} as const

// ================================
// CONSTANTES MESSAGES
// ================================

export const SUCCESS_MESSAGES = {
    PROJECT_CREATED: 'Projet créé avec succès',
    PROJECT_UPDATED: 'Projet modifié avec succès',
    PROJECT_DELETED: 'Projet supprimé avec succès',
    GUEST_ADDED: 'Invité ajouté avec succès',
    GUEST_UPDATED: 'Invité modifié avec succès',
    GUEST_DELETED: 'Invité supprimé avec succès',
    GUESTS_IMPORTED: 'Invités importés avec succès',
    TABLE_CREATED: 'Table créée avec succès',
    TABLE_UPDATED: 'Table modifiée avec succès',
    TABLE_DELETED: 'Table supprimée avec succès',
    PROFILE_UPDATED: 'Profil mis à jour avec succès',
    PASSWORD_CHANGED: 'Mot de passe modifié avec succès',
    EMAIL_SENT: 'Email envoyé avec succès'
} as const

export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
    ACCOUNT_LOCKED: 'Compte temporairement verrouillé',
    TOKEN_EXPIRED: 'Session expirée, veuillez vous reconnecter',
    UNAUTHORIZED: 'Accès non autorisé',
    FORBIDDEN: 'Accès interdit',
    NOT_FOUND: 'Ressource non trouvée',
    ALREADY_EXISTS: 'Cette ressource existe déjà',
    VALIDATION_ERROR: 'Erreur de validation',
    SUBSCRIPTION_EXPIRED: 'Abonnement expiré',
    LIMIT_EXCEEDED: 'Limite atteinte',
    FEATURE_NOT_AVAILABLE: 'Fonctionnalité non disponible',
    INTERNAL_ERROR: 'Erreur interne du serveur',
    SERVICE_UNAVAILABLE: 'Service temporairement indisponible',
    RATE_LIMIT_EXCEEDED: 'Trop de requêtes, veuillez patienter',
    FILE_TOO_LARGE: 'Fichier trop volumineux',
    INVALID_FILE_FORMAT: 'Format de fichier non supporté',
    IMPORT_FAILED: 'Échec de l\'importation',
    EXPORT_FAILED: 'Échec de l\'exportation'
} as const

// ================================
// CONSTANTES URLS
// ================================

export const DEFAULT_URLS = {
    PRIVACY_POLICY: '/privacy-policy',
    TERMS_OF_SERVICE: '/terms-of-service',
    CONTACT: '/contact',
    SUPPORT: '/support',
    DOCUMENTATION: '/docs',
    PRICING: '/pricing'
} as const

// ================================
// CONSTANTES FEATURES
// ================================

export const FEATURES = {
    BASIC_SEARCH: 'basic_search',
    QR_CODE: 'qr_code',
    CSV_IMPORT: 'csv_import',
    BASIC_ANALYTICS: 'basic_analytics',
    ADVANCED_SEARCH: 'advanced_search',
    CUSTOM_BRANDING: 'custom_branding',
    API_ACCESS: 'api_access',
    PRIORITY_SUPPORT: 'priority_support',
    BULK_OPERATIONS: 'bulk_operations',
    EXPORT_PDF: 'export_pdf',
    SEATING_CHART: 'seating_chart',
    EMAIL_NOTIFICATIONS: 'email_notifications',
    SMS_NOTIFICATIONS: 'sms_notifications',
    MULTI_LANGUAGE: 'multi_language',
    CUSTOM_FIELDS: 'custom_fields'
} as const

// ================================
// CONSTANTES LOCALES
// ================================

export const SUPPORTED_LOCALES = {
    FR: 'fr',
    EN: 'en',
    ES: 'es',
    DE: 'de',
    IT: 'it'
} as const

export const DEFAULT_LOCALE = SUPPORTED_LOCALES.FR

// ================================
// CONSTANTES CONFIGURATION
// ================================

export const CONFIG_DEFAULTS = {
    PAGINATION_LIMIT: 20,
    SEARCH_LIMIT: 10,
    SESSION_TIMEOUT: 60 * 60 * 1000, // 1 heure
    REMEMBER_ME_DURATION: 30 * 24 * 60 * 60 * 1000, // 30 jours
    PASSWORD_RESET_TIMEOUT: 60 * 60 * 1000, // 1 heure
    EMAIL_VERIFICATION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 heures
    BACKUP_RETENTION_DAYS: 30,
    LOG_RETENTION_DAYS: 90
} as const