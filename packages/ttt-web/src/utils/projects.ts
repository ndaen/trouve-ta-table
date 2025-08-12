import type {EventType} from "@/types/common.types.ts";

export const getEventTypeLabel = (eventType: EventType): string => {
    switch (eventType) {
        case 'wedding':
            return 'Mariage';
        case 'bar_mitzvah':
            return 'Bar Mitzvah';
        case 'anniversary':
        case 'birthday':
            return 'Anniversaire';
        case 'corporate':
            return 'Événement d\'entreprise';
        case 'other':
            return 'Autre';
        default:
            return 'Événement inconnu';
    }
}