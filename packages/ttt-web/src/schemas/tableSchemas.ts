import { z } from 'zod';

export const CreateTableSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(50, "Le nom ne peut pas dépasser 50 caractères"),
    capacity: z.number().min(1, "La capacité doit être d'au moins 1 personne").max(20, "La capacité ne peut pas dépasser 20 personnes"),
    description: z.string().max(200, "La description ne peut pas dépasser 200 caractères").optional()
});

export const UpdateTableSchema = CreateTableSchema;

export type CreateTableInput = z.infer<typeof CreateTableSchema>;
export type UpdateTableInput = z.infer<typeof UpdateTableSchema>;

// Options prédéfinies pour les capacités courantes
export const TABLE_CAPACITY_OPTIONS = [
    { value: 2, label: '2 personnes' },
    { value: 4, label: '4 personnes' },
    { value: 6, label: '6 personnes' },
    { value: 8, label: '8 personnes' },
    { value: 10, label: '10 personnes' },
    { value: 12, label: '12 personnes' }
];