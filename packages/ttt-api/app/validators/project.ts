import vine from '@vinejs/vine'

const EVENT_TYPES = ['wedding', 'bar_mitzvah', 'anniversary', 'corporate', 'other'] as const

export const createProjectValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(120),
        eventType: vine.enum(EVENT_TYPES),
        eventDate: vine.date({ formats: ['iso8601'] }),
        venue: vine.string().trim().minLength(2).maxLength(200),
        description: vine.string().trim().maxLength(2000).nullable().optional(),
        isActive: vine.boolean().optional(),
    })
)

export const updateProjectValidator = vine.compile(
    vine.object({
        name: vine.string().trim().minLength(2).maxLength(120).optional(),
        eventType: vine.enum(EVENT_TYPES).optional(),
        eventDate: vine.date({ formats: ['iso8601'] }).optional(),
        venue: vine.string().trim().minLength(2).maxLength(200).optional(),
        description: vine.string().trim().maxLength(2000).nullable().optional(),
        isActive: vine.boolean().optional(),
    })
)
