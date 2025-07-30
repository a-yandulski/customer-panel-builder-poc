import { useAuth } from "@/contexts/AuthContext";

interface ApiError extends Error {
  status?: number;
  code?: string;
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  requiresAuth?: boolean;
}

class ApiClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string = "/api", defaultTimeout: number = 30000) {
    this.baseURL = baseURL;
    this.defaultTimeout = defaultTimeout;
  }

  private async createAuthHeaders(getAccessTokenSilently?: () => Promise<string>): Promise<HeadersInit> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (getAccessTokenSilently) {
      try {
        const token = await getAccessTokenSilently();
        headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("Failed to get access token:", error);
        throw new Error("Authentication failed");
      }
    }

    return headers;
  }

  private async fetchWithTimeout(
    url: string,
    config: RequestConfig = {}
  ): Promise<Response> {
    const { timeout = this.defaultTimeout, ...fetchConfig } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchConfig,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorBody = null;

      try {
        if (contentType?.includes("application/json")) {
          errorBody = await response.json();
          errorMessage = errorBody.error || errorBody.message || errorMessage;
        } else {
          errorMessage = await response.text() || errorMessage;
        }
      } catch (parseError) {
        // If we can't parse the error response, use the default message
      }

      const error = new Error(errorMessage) as ApiError;
      error.status = response.status;
      error.code = errorBody?.code;
      throw error;
    }

    if (contentType?.includes("application/json")) {
      return response.json();
    }

    return response.text() as unknown as T;
  }

  async request<T>(
    endpoint: string,
    config: RequestConfig = {},
    getAccessTokenSilently?: () => Promise<string>
  ): Promise<T> {
    const { requiresAuth = true, ...requestConfig } = config;
    
    const url = endpoint.startsWith("http") ? endpoint : `${this.baseURL}${endpoint}`;
    
    const headers = await this.createAuthHeaders(
      requiresAuth ? getAccessTokenSilently : undefined
    );

    const response = await this.fetchWithTimeout(url, {
      ...requestConfig,
      headers: {
        ...headers,
        ...requestConfig.headers,
      },
    });

    return this.handleResponse<T>(response);
  }

  async get<T>(
    endpoint: string,
    config: RequestConfig = {},
    getAccessTokenSilently?: () => Promise<string>
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" }, getAccessTokenSilently);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {},
    getAccessTokenSilently?: () => Promise<string>
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        ...config,
        method: "POST",
        body: data ? JSON.stringify(data) : undefined,
      },
      getAccessTokenSilently
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {},
    getAccessTokenSilently?: () => Promise<string>
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        ...config,
        method: "PUT",
        body: data ? JSON.stringify(data) : undefined,
      },
      getAccessTokenSilently
    );
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {},
    getAccessTokenSilently?: () => Promise<string>
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        ...config,
        method: "PATCH",
        body: data ? JSON.stringify(data) : undefined,
      },
      getAccessTokenSilently
    );
  }

  async delete<T>(
    endpoint: string,
    config: RequestConfig = {},
    getAccessTokenSilently?: () => Promise<string>
  ): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" }, getAccessTokenSilently);
  }
}

// Create a default API client instance
export const apiClient = new ApiClient();

// Custom hook for authenticated API requests
export function useApi() {
  const { getAccessTokenSilently, isAuthenticated } = useAuth();

  const authenticatedClient = {
    get: <T>(endpoint: string, config?: RequestConfig) =>
      apiClient.get<T>(endpoint, config, getAccessTokenSilently),
    
    post: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
      apiClient.post<T>(endpoint, data, config, getAccessTokenSilently),
    
    put: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
      apiClient.put<T>(endpoint, data, config, getAccessTokenSilently),
    
    patch: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
      apiClient.patch<T>(endpoint, data, config, getAccessTokenSilently),
    
    delete: <T>(endpoint: string, config?: RequestConfig) =>
      apiClient.delete<T>(endpoint, config, getAccessTokenSilently),
  };

  const publicClient = {
    get: <T>(endpoint: string, config?: RequestConfig) =>
      apiClient.get<T>(endpoint, { ...config, requiresAuth: false }),
    
    post: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
      apiClient.post<T>(endpoint, data, { ...config, requiresAuth: false }),
    
    put: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
      apiClient.put<T>(endpoint, data, { ...config, requiresAuth: false }),
    
    patch: <T>(endpoint: string, data?: any, config?: RequestConfig) =>
      apiClient.patch<T>(endpoint, data, { ...config, requiresAuth: false }),
    
    delete: <T>(endpoint: string, config?: RequestConfig) =>
      apiClient.delete<T>(endpoint, { ...config, requiresAuth: false }),
  };

  return {
    api: authenticatedClient,
    publicApi: publicClient,
    isAuthenticated,
  };
}

export type { ApiError, RequestConfig };
