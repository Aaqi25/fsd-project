/**
 * Centralized API service configuration
 * Provides a standardized request interface for REST endpoints with mock fallback.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  statusCode?: number;
}

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number = 500, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

/**
 * Perform an HTTP request with authentication token header if present.
 */
export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('smarthome_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = API_BASE_URL ? `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}` : endpoint;

  // If no backend URL configured or running in frontend-only preview,
  // callers will route to mock layer or catch network errors.
  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      if (response.status === 401) {
        // Clear expired or invalid token
        localStorage.removeItem('smarthome_token');
        localStorage.removeItem('smarthome_user');
      }
      throw new ApiError(
        data?.message || `Request failed with status ${response.status}`,
        response.status,
        data
      );
    }

    return {
      success: true,
      data,
      statusCode: response.status,
    };
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(error.message || 'Network communication error', 0);
  }
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'GET' }),
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    request<T>(endpoint, { ...options, method: 'DELETE' }),
};
