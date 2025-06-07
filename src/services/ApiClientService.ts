export class ApiClienteService {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:8080/api") {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Agregar token de autenticación si existe
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Manejar errores de autenticación
      if (response.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        // Opcionalmente redirigir al login
        window.location.href = '/login';
      }

      const errorBody = await response.text();
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage = errorJson.message || errorJson.error || errorMessage;
      } catch {
        errorMessage = errorBody || errorMessage;
      }

      throw new Error(errorMessage);
    }

    // Si no hay contenido (ej: DELETE), retornar objeto vacío
    if (
      response.status === 204 ||
      response.headers.get("content-length") === "0"
    ) {
      return {} as T;
    }

    return response.json();
  }

  public async get<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "GET" });
  }

  public async post<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async deleteRequest<T>(url: string): Promise<T> {
    return this.request<T>(url, { method: "DELETE" });
  }
}

export const apiClienteService = new ApiClienteService();