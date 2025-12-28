import { apiClient } from './api/client';
import { setToken, clearToken } from './api/getAuthHeaders';

const MOCK_MODE = import.meta.env.VITE_MOCK_API === 'true';

export interface User {
    id: string;
    name: string;
    role: 'admin' | 'teacher' | 'assistant' | 'student';
    permissions: string[];
}

export interface LoginResponse {
    token: string;
    user: User;
}

const MOCK_USER: User = {
    id: '1',
    name: 'Mock User',
    role: 'student',
    permissions: ['ai:use', 'sim:use', 'course:read'],
};

export const authService = {
    async login(username: string, password: string): Promise<LoginResponse> {
        if (MOCK_MODE) {
            const token = 'mock-jwt-token';
            setToken(token);
            return { token, user: MOCK_USER };
        }

        const response = await apiClient.post<LoginResponse>('/auth/login', {
            username,
            password,
        });
        setToken(response.data.token);
        return response.data;
    },

    async me(): Promise<User> {
        if (MOCK_MODE) {
            return MOCK_USER;
        }

        const response = await apiClient.get<User>('/auth/me');
        return response.data;
    },

    logout(): void {
        clearToken();
    },
};
