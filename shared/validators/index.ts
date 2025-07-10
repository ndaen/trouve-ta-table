import {
    CreateUserDto,
    UpdateUserDto,
    CreateProjectDto,
    UpdateProjectDto,
    CreateTableDto,
    UpdateTableDto,
    CreateGuestDto,
    UpdateGuestDto,
    LoginDto,
    RegisterDto,
    SearchGuestDto,
    EventType,
    SubscriptionPlan
} from '../types/index'
import { VALIDATION, REGEX_PATTERNS } from '../constants'

// ================================
// TYPES POUR VALIDATION
// ================================

export interface ValidationResult {
    isValid: boolean
    errors: ValidationError[]
}

export interface ValidationError {
    field: string
    message: string
    value?: any
}

// ================================
// FONCTIONS DE VALIDATION DE BASE
// ================================

/**
 * Valide un email
 */
export function validateEmail(email: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!email) {
        errors.push({ field: 'email', message: 'L\'email est requis' })
    } else if (!REGEX_PATTERNS.EMAIL.test(email)) {
        errors.push({ field: 'email', message: 'Format d\'email invalide' })
    } else if (email.length > VALIDATION.EMAIL.MAX_LENGTH) {
        errors.push({
            field: 'email',
            message: `L'email ne peut pas dépasser ${VALIDATION.EMAIL.MAX_LENGTH} caractères`
        })
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide un mot de passe
 */
export function validatePassword(password: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!password) {
        errors.push({ field: 'password', message: 'Le mot de passe est requis' })
    } else {
        if (password.length < VALIDATION.PASSWORD.MIN_LENGTH) {
            errors.push({
                field: 'password',
                message: `Le mot de passe doit contenir au moins ${VALIDATION.PASSWORD.MIN_LENGTH} caractères`
            })
        }

        if (password.length > VALIDATION.PASSWORD.MAX_LENGTH) {
            errors.push({
                field: 'password',
                message: `Le mot de passe ne peut pas dépasser ${VALIDATION.PASSWORD.MAX_LENGTH} caractères`
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide un nom (prénom ou nom de famille)
 */
export function validateName(name: string, fieldName: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!name) {
        errors.push({ field: fieldName, message: `Le ${fieldName} est requis` })
    } else {
        const trimmedName = name.trim()

        if (trimmedName.length < VALIDATION.NAME.MIN_LENGTH) {
            errors.push({
                field: fieldName,
                message: `Le ${fieldName} doit contenir au moins ${VALIDATION.NAME.MIN_LENGTH} caractères`
            })
        }

        if (trimmedName.length > VALIDATION.NAME.MAX_LENGTH) {
            errors.push({
                field: fieldName,
                message: `Le ${fieldName} ne peut pas dépasser ${VALIDATION.NAME.MAX_LENGTH} caractères`
            })
        }

        if (!VALIDATION.NAME.REGEX.test(trimmedName)) {
            errors.push({
                field: fieldName,
                message: `Le ${fieldName} ne peut contenir que des lettres, espaces, tirets et apostrophes`
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide une date
 */
export function validateDate(date: string | Date, fieldName: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!date) {
        errors.push({ field: fieldName, message: `La ${fieldName} est requise` })
    } else {
        const parsedDate = new Date(date)

        if (isNaN(parsedDate.getTime())) {
            errors.push({
                field: fieldName,
                message: `Format de ${fieldName} invalide`
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide une date d'événement (doit être dans le futur)
 */
export function validateEventDate(date: string | Date): ValidationResult {
    const errors: ValidationError[] = []

    if (!date) {
        errors.push({ field: 'eventDate', message: 'La date d\'événement est requise' })
    } else {
        const parsedDate = new Date(date)

        if (isNaN(parsedDate.getTime())) {
            errors.push({
                field: 'eventDate',
                message: 'Format de date invalide'
            })
        } else {
            const now = new Date()
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

            if (parsedDate < today) {
                errors.push({
                    field: 'eventDate',
                    message: 'La date d\'événement ne peut pas être dans le passé'
                })
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide un type d'événement
 */
export function validateEventType(eventType: string): ValidationResult {
    const errors: ValidationError[] = []

    if (!eventType) {
        errors.push({ field: 'eventType', message: 'Le type d\'événement est requis' })
    } else if (!Object.values(EventType).includes(eventType as EventType)) {
        errors.push({
            field: 'eventType',
            message: 'Type d\'événement invalide'
        })
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide une capacité de table
 */
export function validateTableCapacity(capacity: number): ValidationResult {
    const errors: ValidationError[] = []

    if (capacity === undefined || capacity === null) {
        errors.push({ field: 'capacity', message: 'La capacité est requise' })
    } else if (!Number.isInteger(capacity)) {
        errors.push({ field: 'capacity', message: 'La capacité doit être un nombre entier' })
    } else if (capacity < VALIDATION.TABLE.MIN_CAPACITY) {
        errors.push({
            field: 'capacity',
            message: `La capacité doit être d'au moins ${VALIDATION.TABLE.MIN_CAPACITY}`
        })
    } else if (capacity > VALIDATION.TABLE.MAX_CAPACITY) {
        errors.push({
            field: 'capacity',
            message: `La capacité ne peut pas dépasser ${VALIDATION.TABLE.MAX_CAPACITY}`
        })
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// ================================
// VALIDATEURS POUR DTOs
// ================================

/**
 * Valide les données de connexion
 */
export function validateLoginDto(data: LoginDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation email
    const emailValidation = validateEmail(data.email)
    errors.push(...emailValidation.errors)

    // Validation mot de passe
    if (!data.password) {
        errors.push({ field: 'password', message: 'Le mot de passe est requis' })
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide les données d'inscription
 */
export function validateRegisterDto(data: RegisterDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation email
    const emailValidation = validateEmail(data.email)
    errors.push(...emailValidation.errors)

    // Validation mot de passe
    const passwordValidation = validatePassword(data.password)
    errors.push(...passwordValidation.errors)

    // Validation prénom
    const firstNameValidation = validateName(data.firstName, 'prénom')
    errors.push(...firstNameValidation.errors)

    // Validation nom
    const lastNameValidation = validateName(data.lastName, 'nom')
    errors.push(...lastNameValidation.errors)

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide les données de création d'utilisateur
 */
export function validateCreateUserDto(data: CreateUserDto): ValidationResult {
    return validateRegisterDto(data)
}

/**
 * Valide les données de modification d'utilisateur
 */
export function validateUpdateUserDto(data: UpdateUserDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation email (optionnel)
    if (data.email !== undefined) {
        const emailValidation = validateEmail(data.email)
        errors.push(...emailValidation.errors)
    }

    // Validation prénom (optionnel)
    if (data.firstName !== undefined) {
        const firstNameValidation = validateName(data.firstName, 'prénom')
        errors.push(...firstNameValidation.errors)
    }

    // Validation nom (optionnel)
    if (data.lastName !== undefined) {
        const lastNameValidation = validateName(data.lastName, 'nom')
        errors.push(...lastNameValidation.errors)
    }

    // Validation plan d'abonnement (optionnel)
    if (data.subscriptionPlan !== undefined) {
        if (!Object.values(SubscriptionPlan).includes(data.subscriptionPlan)) {
            errors.push({
                field: 'subscriptionPlan',
                message: 'Plan d\'abonnement invalide'
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide les données de création de projet
 */
export function validateCreateProjectDto(data: CreateProjectDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation nom du projet
    if (!data.name) {
        errors.push({ field: 'name', message: 'Le nom du projet est requis' })
    } else if (data.name.length < VALIDATION.PROJECT.NAME_MIN_LENGTH) {
        errors.push({
            field: 'name',
            message: `Le nom doit contenir au moins ${VALIDATION.PROJECT.NAME_MIN_LENGTH} caractères`
        })
    } else if (data.name.length > VALIDATION.PROJECT.NAME_MAX_LENGTH) {
        errors.push({
            field: 'name',
            message: `Le nom ne peut pas dépasser ${VALIDATION.PROJECT.NAME_MAX_LENGTH} caractères`
        })
    }

    // Validation type d'événement
    const eventTypeValidation = validateEventType(data.eventType)
    errors.push(...eventTypeValidation.errors)

    // Validation date d'événement
    const eventDateValidation = validateEventDate(data.eventDate)
    errors.push(...eventDateValidation.errors)

    // Validation lieu
    if (!data.venue) {
        errors.push({ field: 'venue', message: 'Le lieu est requis' })
    } else if (data.venue.length < VALIDATION.PROJECT.VENUE_MIN_LENGTH) {
        errors.push({
            field: 'venue',
            message: `Le lieu doit contenir au moins ${VALIDATION.PROJECT.VENUE_MIN_LENGTH} caractères`
        })
    } else if (data.venue.length > VALIDATION.PROJECT.VENUE_MAX_LENGTH) {
        errors.push({
            field: 'venue',
            message: `Le lieu ne peut pas dépasser ${VALIDATION.PROJECT.VENUE_MAX_LENGTH} caractères`
        })
    }

    // Validation description (optionnelle)
    if (data.description !== undefined && data.description !== null) {
        if (data.description.length > VALIDATION.PROJECT.DESCRIPTION_MAX_LENGTH) {
            errors.push({
                field: 'description',
                message: `La description ne peut pas dépasser ${VALIDATION.PROJECT.DESCRIPTION_MAX_LENGTH} caractères`
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide les données de modification de projet
 */
export function validateUpdateProjectDto(data: UpdateProjectDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation nom du projet (optionnel)
    if (data.name !== undefined) {
        if (!data.name) {
            errors.push({ field: 'name', message: 'Le nom du projet ne peut pas être vide' })
        } else if (data.name.length < VALIDATION.PROJECT.NAME_MIN_LENGTH) {
            errors.push({
                field: 'name',
                message: `Le nom doit contenir au moins ${VALIDATION.PROJECT.NAME_MIN_LENGTH} caractères`
            })
        } else if (data.name.length > VALIDATION.PROJECT.NAME_MAX_LENGTH) {
            errors.push({
                field: 'name',
                message: `Le nom ne peut pas dépasser ${VALIDATION.PROJECT.NAME_MAX_LENGTH} caractères`
            })
        }
    }

    // Validation type d'événement (optionnel)
    if (data.eventType !== undefined) {
        const eventTypeValidation = validateEventType(data.eventType)
        errors.push(...eventTypeValidation.errors)
    }

    // Validation date d'événement (optionnelle)
    if (data.eventDate !== undefined) {
        const eventDateValidation = validateEventDate(data.eventDate)
        errors.push(...eventDateValidation.errors)
    }

    // Validation lieu (optionnel)
    if (data.venue !== undefined) {
        if (!data.venue) {
            errors.push({ field: 'venue', message: 'Le lieu ne peut pas être vide' })
        } else if (data.venue.length < VALIDATION.PROJECT.VENUE_MIN_LENGTH) {
            errors.push({
                field: 'venue',
                message: `Le lieu doit contenir au moins ${VALIDATION.PROJECT.VENUE_MIN_LENGTH} caractères`
            })
        } else if (data.venue.length > VALIDATION.PROJECT.VENUE_MAX_LENGTH) {
            errors.push({
                field: 'venue',
                message: `Le lieu ne peut pas dépasser ${VALIDATION.PROJECT.VENUE_MAX_LENGTH} caractères`
            })
        }
    }

    // Validation description (optionnelle)
    if (data.description !== undefined && data.description !== null) {
        if (data.description.length > VALIDATION.PROJECT.DESCRIPTION_MAX_LENGTH) {
            errors.push({
                field: 'description',
                message: `La description ne peut pas dépasser ${VALIDATION.PROJECT.DESCRIPTION_MAX_LENGTH} caractères`
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide les données de création de table
 */
export function validateCreateTableDto(data: CreateTableDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation nom de table
    if (!data.name) {
        errors.push({ field: 'name', message: 'Le nom de la table est requis' })
    } else if (data.name.length < VALIDATION.TABLE.NAME_MIN_LENGTH) {
        errors.push({
            field: 'name',
            message: `Le nom doit contenir au moins ${VALIDATION.TABLE.NAME_MIN_LENGTH} caractère`
        })
    } else if (data.name.length > VALIDATION.TABLE.NAME_MAX_LENGTH) {
        errors.push({
            field: 'name',
            message: `Le nom ne peut pas dépasser ${VALIDATION.TABLE.NAME_MAX_LENGTH} caractères`
        })
    }

    // Validation capacité
    const capacityValidation = validateTableCapacity(data.capacity)
    errors.push(...capacityValidation.errors)

    // Validation description (optionnelle)
    if (data.description !== undefined && data.description !== null) {
        if (data.description.length > VALIDATION.TABLE.DESCRIPTION_MAX_LENGTH) {
            errors.push({
                field: 'description',
                message: `La description ne peut pas dépasser ${VALIDATION.TABLE.DESCRIPTION_MAX_LENGTH} caractères`
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide les données de modification de table
 */
export function validateUpdateTableDto(data: UpdateTableDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation nom de table (optionnel)
    if (data.name !== undefined) {
        if (!data.name) {
            errors.push({ field: 'name', message: 'Le nom de la table ne peut pas être vide' })
        } else if (data.name.length < VALIDATION.TABLE.NAME_MIN_LENGTH) {
            errors.push({
                field: 'name',
                message: `Le nom doit contenir au moins ${VALIDATION.TABLE.NAME_MIN_LENGTH} caractère`
            })
        } else if (data.name.length > VALIDATION.TABLE.NAME_MAX_LENGTH) {
            errors.push({
                field: 'name',
                message: `Le nom ne peut pas dépasser ${VALIDATION.TABLE.NAME_MAX_LENGTH} caractères`
            })
        }
    }

    // Validation capacité (optionnelle)
    if (data.capacity !== undefined) {
        const capacityValidation = validateTableCapacity(data.capacity)
        errors.push(...capacityValidation.errors)
    }

    // Validation description (optionnelle)
    if (data.description !== undefined && data.description !== null) {
        if (data.description.length > VALIDATION.TABLE.DESCRIPTION_MAX_LENGTH) {
            errors.push({
                field: 'description',
                message: `La description ne peut pas dépasser ${VALIDATION.TABLE.DESCRIPTION_MAX_LENGTH} caractères`
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide les données de création d'invité
 */
export function validateCreateGuestDto(data: CreateGuestDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation prénom
    if (!data.firstName) {
        errors.push({ field: 'firstName', message: 'Le prénom est requis' })
    } else if (data.firstName.length < VALIDATION.GUEST.FIRST_NAME_MIN_LENGTH) {
        errors.push({
            field: 'firstName',
            message: `Le prénom doit contenir au moins ${VALIDATION.GUEST.FIRST_NAME_MIN_LENGTH} caractères`
        })
    } else if (data.firstName.length > VALIDATION.GUEST.FIRST_NAME_MAX_LENGTH) {
        errors.push({
            field: 'firstName',
            message: `Le prénom ne peut pas dépasser ${VALIDATION.GUEST.FIRST_NAME_MAX_LENGTH} caractères`
        })
    } else if (!VALIDATION.NAME.REGEX.test(data.firstName.trim())) {
        errors.push({
            field: 'firstName',
            message: 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'
        })
    }

    // Validation nom
    if (!data.lastName) {
        errors.push({ field: 'lastName', message: 'Le nom est requis' })
    } else if (data.lastName.length < VALIDATION.GUEST.LAST_NAME_MIN_LENGTH) {
        errors.push({
            field: 'lastName',
            message: `Le nom doit contenir au moins ${VALIDATION.GUEST.LAST_NAME_MIN_LENGTH} caractères`
        })
    } else if (data.lastName.length > VALIDATION.GUEST.LAST_NAME_MAX_LENGTH) {
        errors.push({
            field: 'lastName',
            message: `Le nom ne peut pas dépasser ${VALIDATION.GUEST.LAST_NAME_MAX_LENGTH} caractères`
        })
    } else if (!VALIDATION.NAME.REGEX.test(data.lastName.trim())) {
        errors.push({
            field: 'lastName',
            message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
        })
    }

    // Validation email (optionnel)
    if (data.email !== undefined && data.email !== null && data.email.trim() !== '') {
        const emailValidation = validateEmail(data.email)
        errors.push(...emailValidation.errors)
    }

    // Validation régimes alimentaires (optionnel)
    if (data.dietaryRequirements !== undefined && data.dietaryRequirements !== null) {
        if (data.dietaryRequirements.length > VALIDATION.GUEST.DIETARY_REQUIREMENTS_MAX_LENGTH) {
            errors.push({
                field: 'dietaryRequirements',
                message: `Les régimes alimentaires ne peuvent pas dépasser ${VALIDATION.GUEST.DIETARY_REQUIREMENTS_MAX_LENGTH} caractères`
            })
        }
    }

    // Validation tableId (optionnel)
    if (data.tableId !== undefined && data.tableId !== null) {
        if (!REGEX_PATTERNS.UUID.test(data.tableId)) {
            errors.push({
                field: 'tableId',
                message: 'ID de table invalide'
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide les données de modification d'invité
 */
export function validateUpdateGuestDto(data: UpdateGuestDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation prénom (optionnel)
    if (data.firstName !== undefined) {
        if (!data.firstName) {
            errors.push({ field: 'firstName', message: 'Le prénom ne peut pas être vide' })
        } else if (data.firstName.length < VALIDATION.GUEST.FIRST_NAME_MIN_LENGTH) {
            errors.push({
                field: 'firstName',
                message: `Le prénom doit contenir au moins ${VALIDATION.GUEST.FIRST_NAME_MIN_LENGTH} caractères`
            })
        } else if (data.firstName.length > VALIDATION.GUEST.FIRST_NAME_MAX_LENGTH) {
            errors.push({
                field: 'firstName',
                message: `Le prénom ne peut pas dépasser ${VALIDATION.GUEST.FIRST_NAME_MAX_LENGTH} caractères`
            })
        } else if (!VALIDATION.NAME.REGEX.test(data.firstName.trim())) {
            errors.push({
                field: 'firstName',
                message: 'Le prénom ne peut contenir que des lettres, espaces, tirets et apostrophes'
            })
        }
    }

    // Validation nom (optionnel)
    if (data.lastName !== undefined) {
        if (!data.lastName) {
            errors.push({ field: 'lastName', message: 'Le nom ne peut pas être vide' })
        } else if (data.lastName.length < VALIDATION.GUEST.LAST_NAME_MIN_LENGTH) {
            errors.push({
                field: 'lastName',
                message: `Le nom doit contenir au moins ${VALIDATION.GUEST.LAST_NAME_MIN_LENGTH} caractères`
            })
        } else if (data.lastName.length > VALIDATION.GUEST.LAST_NAME_MAX_LENGTH) {
            errors.push({
                field: 'lastName',
                message: `Le nom ne peut pas dépasser ${VALIDATION.GUEST.LAST_NAME_MAX_LENGTH} caractères`
            })
        } else if (!VALIDATION.NAME.REGEX.test(data.lastName.trim())) {
            errors.push({
                field: 'lastName',
                message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
            })
        }
    }

    // Validation email (optionnel)
    if (data.email !== undefined && data.email !== null && data.email.trim() !== '') {
        const emailValidation = validateEmail(data.email)
        errors.push(...emailValidation.errors)
    }

    // Validation régimes alimentaires (optionnel)
    if (data.dietaryRequirements !== undefined && data.dietaryRequirements !== null) {
        if (data.dietaryRequirements.length > VALIDATION.GUEST.DIETARY_REQUIREMENTS_MAX_LENGTH) {
            errors.push({
                field: 'dietaryRequirements',
                message: `Les régimes alimentaires ne peuvent pas dépasser ${VALIDATION.GUEST.DIETARY_REQUIREMENTS_MAX_LENGTH} caractères`
            })
        }
    }

    // Validation tableId (optionnel)
    if (data.tableId !== undefined && data.tableId !== null) {
        if (!REGEX_PATTERNS.UUID.test(data.tableId)) {
            errors.push({
                field: 'tableId',
                message: 'ID de table invalide'
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * Valide les données de recherche d'invité
 */
export function validateSearchGuestDto(data: SearchGuestDto): ValidationResult {
    const errors: ValidationError[] = []

    // Validation query
    if (!data.query) {
        errors.push({ field: 'query', message: 'La requête de recherche est requise' })
    } else if (data.query.trim().length < VALIDATION.NAME.MIN_LENGTH) {
        errors.push({
            field: 'query',
            message: `La requête doit contenir au moins ${VALIDATION.NAME.MIN_LENGTH} caractères`
        })
    } else if (data.query.length > 100) {
        errors.push({
            field: 'query',
            message: 'La requête ne peut pas dépasser 100 caractères'
        })
    }

    // Validation projectId
    if (!data.projectId) {
        errors.push({ field: 'projectId', message: 'L\'ID du projet est requis' })
    } else if (!REGEX_PATTERNS.UUID.test(data.projectId)) {
        errors.push({
            field: 'projectId',
            message: 'ID de projet invalide'
        })
    }

    // Validation limit (optionnel)
    if (data.limit !== undefined) {
        if (!Number.isInteger(data.limit) || data.limit < 1 || data.limit > 50) {
            errors.push({
                field: 'limit',
                message: 'La limite doit être un entier entre 1 et 50'
            })
        }
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

// ================================
// FONCTIONS UTILITAIRES
// ================================

/**
 * Combine plusieurs résultats de validation
 */
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
    const allErrors: ValidationError[] = []

    results.forEach(result => {
        allErrors.push(...result.errors)
    })

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    }
}

/**
 * Valide un objet avec un validateur donné
 */
export function validateObject<T>(
    data: T,
    validator: (data: T) => ValidationResult
): ValidationResult {
    try {
        return validator(data)
    } catch (error) {
        return {
            isValid: false,
            errors: [{
                field: 'general',
                message: 'Erreur de validation inattendue'
            }]
        }
    }
}

/**
 * Formate les erreurs de validation pour l'affichage
 */
export function formatValidationErrors(errors: ValidationError[]): string {
    return errors.map(error => `${error.field}: ${error.message}`).join(', ')
}

/**
 * Groupe les erreurs par champ
 */
export function groupErrorsByField(errors: ValidationError[]): Record<string, string[]> {
    const grouped: Record<string, string[]> = {}

    errors.forEach(error => {
        if (!grouped[error.field]) {
            grouped[error.field] = []
        }
        grouped[error.field].push(error.message)
    })

    return grouped
}

/**
 * Vérifie si un champ spécifique a des erreurs
 */
export function hasFieldError(errors: ValidationError[], field: string): boolean {
    return errors.some(error => error.field === field)
}

/**
 * Récupère les erreurs pour un champ spécifique
 */
export function getFieldErrors(errors: ValidationError[], field: string): string[] {
    return errors
        .filter(error => error.field === field)
        .map(error => error.message)
}

/**
 * Valide une liste d'objets avec un validateur donné
 */
export function validateArray<T>(
    data: T[],
    validator: (item: T, index: number) => ValidationResult
): ValidationResult {
    const allErrors: ValidationError[] = []

    data.forEach((item, index) => {
        const result = validator(item, index)
        if (!result.isValid) {
            // Ajoute l'index à chaque erreur
            result.errors.forEach(error => {
                allErrors.push({
                    ...error,
                    field: `[${index}].${error.field}`
                })
            })
        }
    })

    return {
        isValid: allErrors.length === 0,
        errors: allErrors
    }
}

/**
 * Sanitise une chaîne de caractères
 */
export function sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ')
}

/**
 * Valide et sanitise les données d'entrée
 */
export function validateAndSanitize<T extends Record<string, any>>(
    data: T,
    validator: (data: T) => ValidationResult
): { isValid: boolean; errors: ValidationError[]; sanitizedData?: T } {
    // Sanitisation des chaînes de caractères
    const sanitizedData = { ...data }

    Object.keys(sanitizedData).forEach(key => {
        if (typeof sanitizedData[key] === 'string') {
            // @ts-ignore
            sanitizedData[key] = sanitizeString(sanitizedData[key])
        }
    })

    // Validation
    const validationResult = validator(sanitizedData)

    return {
        isValid: validationResult.isValid,
        errors: validationResult.errors,
        sanitizedData: validationResult.isValid ? sanitizedData : undefined
    }
}