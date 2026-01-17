import { apiClient } from '@/lib/api-client';

// Types
export interface SystemStats {
    total_users: number;
    total_courses: number;
    total_assignments: number;
    total_submissions: number;
    total_quizzes: number;
    total_resources: number;
    users_by_role: Record<string, number>;
}

export interface UserItem {
    id: number;
    username: string;
    role: 'admin' | 'teacher' | 'assistant' | 'student';
    name: string;
    created_at: string;
}

export interface CreateUserRequest {
    username: string;
    password: string;
    role: 'admin' | 'teacher' | 'assistant' | 'student';
    name: string;
}

export interface UpdateUserRequest {
    password?: string;
    role?: 'admin' | 'teacher' | 'assistant' | 'student';
    name?: string;
}

// API functions
export const adminApi = {
    async getSystemStats(): Promise<SystemStats> {
        const res = await apiClient.get<SystemStats>('/admin/stats');
        return res.data;
    },

    async listUsers(role?: string): Promise<UserItem[]> {
        const params = role ? { role } : {};
        const res = await apiClient.get<{ users: UserItem[] }>('/admin/users', { params });
        return res.data.users;
    },

    async createUser(data: CreateUserRequest): Promise<UserItem> {
        const res = await apiClient.post<UserItem>('/admin/users', data);
        return res.data;
    },

    async updateUser(id: number, data: UpdateUserRequest): Promise<UserItem> {
        const res = await apiClient.put<UserItem>(`/admin/users/${id}`, data);
        return res.data;
    },

    async deleteUser(id: number): Promise<void> {
        await apiClient.delete(`/admin/users/${id}`);
    }
};
