import {api} from '@/utils/apiClient'
import type {Project} from "@/types/project.types.ts";
import {type CreateProjectInput} from "@/schemas/projectSchemas.ts";

interface ApiResponse<T> {
    message: string;
    data: T;
}

export const projectsService = {
    async getAll(): Promise<Project[]> {
        const response = await api.get<ApiResponse<Project[]>>('/api/projects');
        return response.data;
    },

    async getById(id: string): Promise<Project> {
        const response = await api.get<ApiResponse<Project>>(`/api/projects/${id}`);
        return response.data;
    },

    async getByUser(): Promise<Project[]> {
        const response = await api.get<ApiResponse<Project[]>>('/api/projects/user/all');
        return response.data;
    },

    async create(data: CreateProjectInput): Promise<Project> {
        const response = await api.post<ApiResponse<Project>>('/api/projects', data);
        return response.data;

    },

    async update(id: string, data: Partial<Project>): Promise<Project> {
        const response = await api.patch<ApiResponse<Project>>(`/api/projects/${id}`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete<{ message: string }>(`/api/projects/${id}`);
    }
}