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
