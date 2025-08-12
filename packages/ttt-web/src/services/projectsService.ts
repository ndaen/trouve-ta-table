import {api, ApiError} from '@/utils/apiClient'
import type {Project} from "@/types/project.types.ts";
import {type CreateProjectInput, CreateProjectSchema} from "@/schemas/projectSchemas.ts";

interface ProjectsResponse {
    message: string;
    data: Project[];
}

interface ProjectResponse {
    message: string;
    project: Project;
}

export const projectsService = {
    async getAll() {
        try {
            const response = await api.get<ProjectsResponse>('/api/projects');
            return response.data;
        } catch (error) {
            if (error instanceof ApiError) {
                return error.data;
            }
            throw error;
        }
    },

    async getById(id: string): Promise<Project | ApiError> {
        try {
            const response = await api.get<ProjectResponse>(`/api/projects/user/${id}`);
            return response.project;
        } catch (error) {
            console.log(error)
            if (error instanceof ApiError) {
                return error;
            }
            throw error;
        }
    },

    async getByUser(): Promise<Project[] | ApiError> {
        try {
            const response = await api.get<ProjectsResponse>('/api/projects/user/all');
            return response.data;
        } catch (error) {
            if (error instanceof ApiError) {
                return error.data;
            }
            throw error;
        }
    },

    async create(data: CreateProjectInput): Promise<Project | ApiError> {
        try {
            const parsedData = CreateProjectSchema.parse(data);
            const response = await api.post<ProjectResponse>('/api/projects', parsedData);
            return response.project;
        } catch (error) {
            if (error instanceof ApiError) {
                return error;
            }
            throw error;
        }

    },

    async update(id: string, data: Partial<Project>): Promise<Project | ApiError> {
        try {
            const response = await api.patch<ProjectResponse>(`/api/projects/${id}`, data);
            return response.project;
        } catch (error) {
            if (error instanceof ApiError) {
                return error;
            }
            throw error;
        }
    },

    async delete(id: string): Promise<string | ApiError> {
        try {
            const response = await api.delete<{ message: string }>(`/api/projects/${id}`);
            return response.message;
        } catch (error) {
            if (error instanceof ApiError) {
                return error;
            }
            throw error;
        }
    }
}