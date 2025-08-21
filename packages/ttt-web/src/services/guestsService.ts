import {api} from "@/utils/apiClient.ts";
import type {Guest} from "@/types/guest.types.ts";
import type {Email} from "@/types/common.types.ts";

interface ApiResponse {
    message: string;
    data: Guest;
}

export const guestsService = {
    async getGuestTable(projectId: string, firstName: string, lastName: string, email: Email | null): Promise<ApiResponse> {

        let query = `${firstName.toLowerCase()}+${lastName.toLowerCase()}`;
        if (email) {
            query =`${query}+${email.toLowerCase()}`;
        }
        query = encodeURIComponent(query);
        return await api.get<ApiResponse>(`/api/projects/${projectId}/guests/search?q=${query}`);
    }
}