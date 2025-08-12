// === USER INTERFACE ===
import type {UUID} from "@/types/common.types.ts";

export interface User {
    id: UUID;
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
    isEmailVerified: boolean;
    subscriptionType: 'free' | 'premium' | 'pro';
    createdAt: string;
    updatedAt: string;
}