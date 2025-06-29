export class ApiClienteService {
  private baseUrl: string;
  private auth0: any;

  constructor(baseUrl: string = "http://localhost:8080/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Getter para obtener la baseUrl
   */
  get baseURL(): string {
    return this.baseUrl;
  }

  /**
   * Configura la instancia de Auth0
   */
  setAuth0Instance(auth0Instance: any) {
    this.auth0 = auth0Instance;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    try {
      if (
        this.auth0 &&
        this.auth0.isAuthenticated &&
        this.auth0.getAccessTokenSilently
      ) {
        const token = await this.auth0.getAccessTokenSilently();

        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (error) {
      // Para endpoints públicos, continuar sin token
    }

    return headers;
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const authHeaders = await this.getAuthHeaders();

    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        ...authHeaders,
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      // Para errores 401/403, Auth0 manejará la redirección automáticamente
      if (response.status === 401 || response.status === 403) {
        // Log mínimo para debugging
      }

      const errorBody = await response.text();
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorBody);
        errorMessage =
          errorJson.error ||
          errorJson.message ||
          errorJson.mensaje ||
          errorMessage;
      } catch (parseError) {
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

  public async get<T = any>(url: string): Promise<T> {
    return this.request<T>(url, { method: "GET" });
  }

  public async post<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async put<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async patch<T = any>(url: string, data?: any): Promise<T> {
    return this.request<T>(url, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  public async deleteRequest<T = any>(url: string): Promise<T> {
    return this.request<T>(url, { method: "DELETE" });
  }
}

export const apiClienteService = new ApiClienteService();
