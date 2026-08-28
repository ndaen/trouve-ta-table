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
 * Seule la borne haute est vérifiée ici. La borne basse porte sur la requête
 * *normalisée*, pas sur la chaîne brute : `q=e-` fait bien deux caractères
 * mais ne produit qu'un token d'une lettre. Elle est donc appliquée dans
 * `GuestService.searchPublic`, après normalisation.
 */
export const searchGuestsValidator = vine.compile(
    vine.object({
        q: vine.string().trim().maxLength(80),
    })
)
