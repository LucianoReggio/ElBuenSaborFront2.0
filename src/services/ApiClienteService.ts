// src/services/ApiClienteService.ts

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
}

export class ApiClienteService {
  private baseUrl: string;
  private auth0: any;

  constructor(baseUrl: string = "http://localhost:8080/api") {
    this.baseUrl = baseUrl;
  }

  setAuth0Instance(auth0Instance: any): void {
    this.auth0 = auth0Instance;
  }

private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    try {
      // Condición segura de HEAD + Lógica de Incoming Change
      if (this.auth0 && this.auth0.isAuthenticated && this.auth0.getAccessTokenSilently) { 
        const token = await this.auth0.getAccessTokenSilently();
        headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn("No se pudo obtener token de Auth0:", error);
    }

    return headers;
}
  
  // --- 👇 MÉTODO CORREGIDO ---
  private async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const authHeaders = await this.getAuthHeaders();

    let fullUrl = `${this.baseUrl}${url}`;
    
    // 1. Si hay parámetros, los procesamos y los añadimos a la URL
    if (options.params) {
      const queryParams = new URLSearchParams(options.params).toString();
      if (queryParams) {
        fullUrl += `?${queryParams}`;
      }
    }
    
    // 2. Eliminamos 'params' del objeto de opciones para que no interfiera con fetch
    const fetchOptions: RequestInit = { ...options };
    delete (fetchOptions as any).params;

    // 3. Realizamos la llamada con la URL ya construida
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers: {
        ...authHeaders,
        ...fetchOptions.headers,
      },
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

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return {} as T;
    }

    return response.json();
  }

  // --- El resto de los métodos usan 'request' y ahora funcionarán correctamente ---
  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(url, { method: "GET", params });
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