// === PROJECT INTERFACE ===
import type {User} from "@/types/user.types.ts";
import type {EventType, UUID} from "@/types/common.types.ts";
import type {Table} from "@/types/table.types.ts";
import type {Guest} from "@/types/guest.types.ts";

export interface Project {
    id: UUID;
    userId: UUID;
    name: string;
    eventType: EventType;
    eventDate: string;
    venue: string;
    description?: string;
    qrCodeUrl?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt?: string | null;

    user?: User;
    tables?: Table[];
    guests?: Guest[];
}