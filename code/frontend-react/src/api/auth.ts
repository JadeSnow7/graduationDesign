import { apiClient } from '@/lib/api-client';
import { authStore, type User } from '@/lib/auth-store';

export interface LoginResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
}

// Response from /auth/me - single source of truth
export interface MeResponse {
    id: number;
    username: string;
    name: string;
    role: string;
    permissions: string[];
}

export const authApi = {
    async login(username: string, password: string): Promise<User> {
        // Clear any existing token before attempting login
        authStore.clearToken();

        const response = await apiClient.post<LoginResponse>('/auth/login', {
            username,
            password,
        });

        const data = response.data;
        authStore.setToken(data.access_token);

        // Immediately fetch full user info from /auth/me
        const user = await this.me();
        return user;
    },

    async me(): Promise<User> {
        const response = await apiClient.get<MeResponse>('/auth/me');
        const data = response.data;

        const user: User = {
            id: String(data.id),
            name: data.name || data.username,
            role: data.role as User['role'],
            permissions: data.permissions || [],
        };

        // Cache user info in localStorage
        authStore.setUser(user);

        return user;
    },

    logout() {
        authStore.clearToken();
    }
};
