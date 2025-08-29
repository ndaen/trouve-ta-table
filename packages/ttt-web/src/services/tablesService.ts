import { api } from '@/utils/apiClient';
import type { Table } from '@/types/table.types';
import type { CreateTableInput, UpdateTableInput } from '@/schemas/tableSchemas';

export const tablesService = {
    async getByProjectId(projectId: string): Promise<Table[]> {
        const response = await api.get<{ message: string; data: Table[] }>(`/api/projects/${projectId}/tables`);
        return response.data;
    },

    async getById(tableId: string): Promise<Table> {
        const response = await api.get<{ message: string; data: Table }>(`/api/tables/${tableId}`);
        return response.data;
    },

    async create(projectId: string, data: CreateTableInput): Promise<Table> {
        const response = await api.post<{ message: string; data: Table }>(`/api/tables`, {
            ...data,
            projectId: projectId
        });
        return response.data;
    },

    async update(tableId: string, data: UpdateTableInput): Promise<Table> {
        const response = await api.patch<{ message: string; data: Table }>(`/api/tables/${tableId}`, data);
        return response.data;
    },

    async delete(tableId: string): Promise<void> {
        await api.delete<{ message: string }>(`/api/tables/${tableId}`);
    }
};