import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export interface User {
    id: string;
    name: string;
    role: 'admin' | 'teacher' | 'assistant' | 'student';
    permissions: string[];
}

interface JWTPayload {
    uid: number;
    username: string;
    role: string;
    exp: number;
    iat: number;
}

export const authStore = {
    setToken(token: string) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    getToken(): string | null {
        return localStorage.getItem(TOKEN_KEY);
    },

    clearToken() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    // Set full user info from /auth/me
    setUser(user: User) {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    },

    // Get cached user info, or decode from JWT as fallback
    getUser(): User | null {
        const token = this.getToken();
        if (!token) return null;

        // Check token expiry first
        try {
            const decoded = jwtDecode<JWTPayload>(token);
            if (decoded.exp * 1000 < Date.now()) {
                this.clearToken();
                return null;
            }
        } catch (e) {
            console.error('Failed to decode token', e);
            this.clearToken();
            return null;
        }

        // Try to get cached user from /auth/me
        const cachedUser = localStorage.getItem(USER_KEY);
        if (cachedUser) {
            try {
                return JSON.parse(cachedUser) as User;
            } catch (e) {
                // Fall through to JWT decode
            }
        }

        // Fallback to JWT-only info (without full permissions)
        try {
            const decoded = jwtDecode<JWTPayload>(token);
            return {
                id: String(decoded.uid),
                name: decoded.username,
                role: decoded.role as User['role'],
                permissions: [], // Will be populated after /auth/me call
            };
        } catch (e) {
            this.clearToken();
            return null;
        }
    },

    isAuthenticated(): boolean {
        return !!this.getToken() && !!this.getUser();
    }
};
