import { z } from 'zod';
import {EventEnum} from "@/types/common.types.ts";


export const CreateProjectSchema = z.object({
    name: z.string().min(5),
    description: z.string().min(10),
    venue: z.string().min(5),
    eventType: EventEnum,
    eventDate: z.string()
});

export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
