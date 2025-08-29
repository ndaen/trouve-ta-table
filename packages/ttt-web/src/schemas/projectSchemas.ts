import { z } from 'zod';
import {EventEnum, type EventType} from "@/types/common.types.ts";

export const CreateProjectSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères").max(100, "Le nom ne peut pas dépasser 100 caractères"),
    eventType: EventEnum,
    eventDate: z.string().refine((date) => {
        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return inputDate >= today;
    }, "La date doit être dans le futur"),
    venue: z.string().min(1, "Le lieu est obligatoire").max(200, "Le lieu ne peut pas dépasser 200 caractères"),
    description: z.string().max(500, "La description ne peut pas dépasser 500 caractères").optional()
});

export const UpdateProjectSchema = CreateProjectSchema;

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;

export const EVENT_TYPE_OPTIONS = [
    { value: 'wedding' as EventType, label: 'Mariage', icon: 'heart' as const },
    { value: 'bar_mitzvah' as EventType, label: 'Bar Mitzvah', icon: 'star' as const },
    { value: 'anniversary' as EventType, label: 'Anniversaire', icon: 'cake' as const },
    { value: 'corporate' as EventType, label: 'Entreprise', icon: 'building' as const },
    { value: 'other' as EventType, label: 'Autre', icon: 'calendar' as const }
];
