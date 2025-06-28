export class ApiClienteService {
  private baseUrl: string;
  private auth0: any; // Instancia de Auth0

  constructor(baseUrl: string = "http://localhost:8080/api") {
    this.baseUrl = baseUrl;
  }

  /**
   * Getter para obtener la baseUrl (para casos especiales)
   */
  get baseURL(): string {
    return this.baseUrl;
  }

  /**
   * Configura la instancia de Auth0 ✅ CORREGIDO
   */
  setAuth0Instance(auth0Instance: any) {
    console.log('🔧 Configurando Auth0 instance:', !!auth0Instance);
    this.auth0 = auth0Instance;
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    try {
      // ✅ MEJORADO: Verificar Auth0 con más detalles
      if (this.auth0 && this.auth0.isAuthenticated && this.auth0.getAccessTokenSilently) {
        console.log('🔍 Obteniendo token Auth0...');
        const token = await this.auth0.getAccessTokenSilently();
        
        if (token) {
          headers.Authorization = `Bearer ${token}`;
          console.log('✅ Token Auth0 agregado al header:', token.substring(0, 50) + '...');
        } else {
          console.warn('⚠️ Token Auth0 vacío');
        }
      } else {
        console.warn('⚠️ Auth0 no configurado o no autenticado:', {
          hasAuth0: !!this.auth0,
          isAuthenticated: this.auth0?.isAuthenticated,
          hasTokenMethod: !!this.auth0?.getAccessTokenSilently
        });
      }
    } catch (error) {
      console.error("❌ Error obteniendo token Auth0:", error);
      // Para endpoints públicos, continuar sin token
    }

    return headers;
  }

  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const authHeaders = await this.getAuthHeaders();

    console.log('📡 Haciendo request a:', `${this.baseUrl}${url}`);
    console.log('📡 Headers enviados:', Object.keys(authHeaders));

    const response = await fetch(`${this.baseUrl}${url}`, {
      headers: {
        ...authHeaders,
        ...options?.headers,
      },
      ...options,
    });

    console.log('📡 Response status:', response.status);

    // ✅ SECCIÓN MEJORADA DE MANEJO DE ERRORES
    if (!response.ok) {
      console.error(`❌ Error ${response.status}: ${response.statusText}`);
      
      // Para errores 401/403, Auth0 manejará la redirección automáticamente
      if (response.status === 401 || response.status === 403) {
        console.warn("❌ Error de autenticación/autorización");
      }

      const errorBody = await response.text();
      console.error('❌ Error response body:', errorBody); // ✅ NUEVO LOG
      
      let errorMessage = `Error ${response.status}: ${response.statusText}`;

      try {
        const errorJson = JSON.parse(errorBody);
        console.error('❌ Error JSON parsed:', errorJson); // ✅ NUEVO LOG
        errorMessage = errorJson.error || errorJson.message || errorJson.mensaje || errorMessage;
      } catch (parseError) {
        console.error('❌ Error parsing response body:', parseError); // ✅ NUEVO LOG
        errorMessage = errorBody || errorMessage;
      }

      console.error('❌ Final error message:', errorMessage); // ✅ NUEVO LOG
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