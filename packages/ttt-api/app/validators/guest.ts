import vine from '@vinejs/vine'

export const createGuestValidator = vine.compile(
    vine.object({
        projectId: vine.string().uuid(),
        firstName: vine.string().trim().minLength(1).maxLength(80),
        lastName: vine.string().trim().minLength(1).maxLength(80),
        email: vine.string().trim().email().normalizeEmail().nullable().optional(),
        dietaryRequirements: vine.string().trim().maxLength(500).nullable().optional(),
    })
)

export const updateGuestValidator = vine.compile(
    vine.object({
        firstName: vine.string().trim().minLength(1).maxLength(80).optional(),
        lastName: vine.string().trim().minLength(1).maxLength(80).optional(),
        email: vine.string().trim().email().normalizeEmail().nullable().optional(),
        dietaryRequirements: vine.string().trim().maxLength(500).nullable().optional(),
    })
)

export const assignGuestValidator = vine.compile(
    vine.object({
        tableId: vine.string().uuid(),
    })
)

/**
 * Le minimum de 2 caractères n'est pas cosmétique : il empêche l'énumération
 * lettre par lettre de la liste d'invités sur une route non authentifiée.
 */
export const searchGuestsValidator = vine.compile(
    vine.object({
        q: vine.string().trim().minLength(2).maxLength(80),
    })
)
