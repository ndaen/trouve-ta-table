import {z} from 'zod';
// === TYPES DE BASE ===
export type UUID = string;

const Event = [
    'wedding',
    'bar_mitzvah',
    'anniversary',
    'birthday',
    'corporate',
    'other'
] as const;

export const EventEnum = z.enum(Event);
export type EventType = z.infer<typeof EventEnum>;