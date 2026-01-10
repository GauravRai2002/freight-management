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

interface RequestOptions extends RequestInit {
    token?: string;
    orgId?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T> {
        const { token, orgId, ...fetchOptions } = options;
        const url = `${this.baseUrl}${endpoint}`;

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add existing headers
        if (fetchOptions.headers) {
            const existingHeaders = new Headers(fetchOptions.headers);
            existingHeaders.forEach((value, key) => {
                headers[key] = value;
            });
        }

        // Add authorization header if token provided
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Add organization ID header if provided
        if (orgId) {
            headers['x-organization-id'] = orgId;
        }

        const config: RequestInit = {
            ...fetchOptions,
            headers,
        };

        // Debug logging
        console.log(`[API] ${fetchOptions.method || 'GET'} ${endpoint}`, {
            hasToken: !!token,
            hasOrgId: !!orgId,
            headers: Object.keys(headers),
        });

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

    async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T>(endpoint: string, data: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put<T>(endpoint: string, data: unknown, options?: RequestOptions): Promise<T> {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint: string, options?: RequestOptions): Promise<void> {
        return this.request<void>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const api = new ApiClient(API_BASE_URL);
