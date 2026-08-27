import vine from '@vinejs/vine'

export const createProjectValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(120),
        eventType: vine.string().trim().maxLength(50),
        eventDate: vine.date({ formats: ['iso8601'] }),
        venue: vine.string().trim().minLength(2).maxLength(200),
        description: vine.string().trim().maxLength(2000).nullable().optional(),
        isActive: vine.boolean().optional(),
    })
)

export const updateProjectValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(120).optional(),
        eventType: vine.string().trim().maxLength(50).optional(),
        eventDate: vine.date({ formats: ['iso8601'] }).optional(),
        venue: vine.string().trim().minLength(2).maxLength(200).optional(),
        description: vine.string().trim().maxLength(2000).nullable().optional(),
        isActive: vine.boolean().optional(),
    })
)
