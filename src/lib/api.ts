/**
 * API client for making HTTP requests to the backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    error?: {
        code: string;
        message: string;
        field?: string;
    };
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;

        const config: RequestInit = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        };

        const response = await fetch(url, config);

        // Handle 204 No Content (for DELETE)
        if (response.status === 204) {
            return undefined as T;
        }

        const json: ApiResponse<T> = await response.json();

        if (!response.ok || !json.success) {
            const errorMessage = json.error?.message || `API Error: ${response.status}`;
            console.error(`API Error [${endpoint}]:`, json.error || response.statusText);
            throw new Error(errorMessage);
        }

        return json.data;
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T>(endpoint: string, data: unknown): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint: string): Promise<void> {
        return this.request<void>(endpoint, { method: 'DELETE' });
    }
}

export const api = new ApiClient(API_BASE_URL);
