import vine from '@vinejs/vine'

export const createTableValidator = vine.compile(
    vine.object({
        projectId: vine.string().uuid(),
        name: vine.string().trim().minLength(1).maxLength(80),
        description: vine.string().trim().maxLength(500).nullable().optional(),
        capacity: vine.number().min(1).max(50),
    })
)

export const updateTableValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(1).maxLength(80).optional(),
        description: vine.string().trim().maxLength(500).nullable().optional(),
        capacity: vine.number().min(1).max(50).optional(),
    })
)
