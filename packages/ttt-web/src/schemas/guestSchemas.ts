import { z } from 'zod';

export const CreateGuestSchema = z.object({
    firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères").max(50, "Le prénom ne peut pas dépasser 50 caractères"),
    lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50, "Le nom ne peut pas dépasser 50 caractères"),
    email: z.email("Adresse email invalide").optional(),
    dietary_requirements: z.string().max(200, "Les exigences alimentaires ne peuvent pas dépasser 200 caractères").optional(),
    tableId: z.uuid().optional().nullable()
});

export const UpdateGuestSchema = CreateGuestSchema.partial();

export type CreateGuestInput = z.infer<typeof CreateGuestSchema>;
export type UpdateGuestInput = z.infer<typeof UpdateGuestSchema>;

export const DIETARY_REQUIREMENTS_OPTIONS = [
    { value: '', label: 'Aucun' },
    { value: 'vegetarian', label: 'Végétarien' },
    { value: 'vegan', label: 'Végétalien' },
    { value: 'gluten-free', label: 'Sans gluten' },
    { value: 'lactose-free', label: 'Sans lactose' },
    { value: 'halal', label: 'Halal' },
    { value: 'kosher', label: 'Casher' },
    { value: 'nut-free', label: 'Sans noix' },
    { value: 'other', label: 'Autre' }
];
