import {api} from "@/utils/apiClient.ts";
import type {Guest} from "@/types/guest.types.ts";
import type { CreateGuestInput, UpdateGuestInput } from "@/schemas/guestSchemas";

interface ApiResponse {
    message: string;
    data: Guest;
}

interface ApiListResponse {
    message: string;
    data: Guest[];
}

export interface GuestSearchResult {
    firstName: string;
    lastName: string;
    fullName: string;
    table: {
        name: string;
        description: string | null;
    } | null;
}

interface GuestSearchResponse {
    message: string;
    data: GuestSearchResult[];
    tooManyMatches: boolean;
}

export const guestsService = {
    async searchGuests(projectId: string, q: string): Promise<GuestSearchResponse> {
        return await api.get<GuestSearchResponse>(
            `/api/projects/${projectId}/guests/search?q=${encodeURIComponent(q)}`
        );
    },

    async getByProjectId(projectId: string): Promise<Guest[]> {
        try {
            const response = await api.get<ApiListResponse>(`/api/projects/${projectId}/guests`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch guests:', error);
            throw new Error('Unable to load guests. Please try again.', { cause: error });
        }
    },

    async getById(guestId: string): Promise<Guest> {
        const response = await api.get<ApiResponse>(`/api/guests/${guestId}`);
        return response.data;
    },

    async create(projectId: string, data: CreateGuestInput): Promise<Guest> {
        const response = await api.post<ApiResponse>(`/api/guests`, {
            ...data,
            projectId: projectId
        });
        return response.data;
    },

    async update(guestId: string, data: UpdateGuestInput): Promise<Guest> {
        const response = await api.patch<ApiResponse>(`/api/guests/${guestId}`, data);
        return response.data;
    },

    async delete(guestId: string): Promise<void> {
        await api.delete<{ message: string }>(`/api/guests/${guestId}`);
    },

    async assignToTable(guestId: string, tableId: string): Promise<Guest> {
        const response = await api.post<ApiResponse>(`/api/guests/${guestId}/assign`, {
            tableId
        });
        return response.data;
    },

    async unassignFromTable(guestId: string): Promise<Guest> {
        const response = await api.post<ApiResponse>(`/api/guests/${guestId}/unassign`);
        return response.data;
    }
}