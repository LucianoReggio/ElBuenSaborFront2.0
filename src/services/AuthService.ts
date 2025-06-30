import { apiClienteService } from "./ApiClienteService";
import type {
  ClienteRegisterDTO,
  ClienteResponseDTO,
} from "../types/clientes/Index";

// Tipos de respuesta
interface LoginResponse {
  success: boolean;
  data: any;
  message: string;
}

interface RegisterResponse {
  success: boolean;
  data: ClienteResponseDTO;
  message: string;
}

interface UserProfileResponse {
  authenticated: boolean;
  auth_provider?: string;
  sub?: string;
  email?: string;
  name?: string;
  roles?: any[];
  token_type?: string;
}

interface TokenValidationResponse {
  valid: boolean;
  sub?: string;
  auth_provider?: string;
  token_type?: string;
}

interface RefreshRolesResponse {
  success: boolean;
  data?: {
    oldRole?: string;
    newRole?: string;
    currentRole?: string;
  };
  message: string;
}

/**
 * Servicio de autenticación para Auth0
 */
export class AuthService {
  private static pendingRequests = new Map<string, Promise<any>>();

  /**
   * Procesa el login con Auth0 y sincroniza con el backend
   */
  static async processAuth0Login(userData?: any): Promise<LoginResponse> {
    const cacheKey = `login-${JSON.stringify(userData)}`;

    // Verificar si ya hay una request pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const request = this._performLogin(userData);
    this.pendingRequests.set(cacheKey, request);

    try {
      const result = await request;
      return result;
    } finally {
      // Limpiar cache después de 5 segundos
      setTimeout(() => {
        this.pendingRequests.delete(cacheKey);
      }, 5000);
    }
  }

  /**
   * Ejecutar login real
   */
  private static async _performLogin(userData?: any): Promise<LoginResponse> {
    try {
      const response = await apiClienteService.post<LoginResponse>(
        "/auth0/login",
        userData
      );

      return response;
    } catch (error: any) {
      // Manejo específico de usuario desactivado
      if (
        error.message?.includes("Usuario desactivado") ||
        error.message?.includes("USER_DEACTIVATED") ||
        error.message?.includes("403")
      ) {
        throw new Error("USUARIO_DESACTIVADO");
      }

      // Manejo específico de errores comunes
      if (error.message?.includes("Duplicate entry")) {
        try {
          // Intentar obtener el usuario existente
          const profile = await this.getCurrentUser();
          if (profile.authenticated) {
            return {
              success: true,
              data: {
                email: profile.email,
                nombre: profile.name?.split(" ")[0] || "Usuario",
                apellido: profile.name?.split(" ")[1] || "Auth0",
                rol: "CLIENTE",
              },
              message: "Usuario recuperado exitosamente",
            };
          }
        } catch (recoveryError) {
          // Continuar con el error original
        }
      }

      throw error;
    }
  }

  /**
   * Registra un cliente con protección contra duplicados
   */
  static async registerClienteAuth0(
    clienteData: ClienteRegisterDTO
  ): Promise<ClienteResponseDTO> {
    try {
      const response = await apiClienteService.post<RegisterResponse>(
        "/auth0/register",
        clienteData
      );

      return response.data;
    } catch (error: any) {
      // Si el usuario ya existe, intentar usar complete-profile
      if (
        error.message?.includes("ya está registrado") ||
        error.message?.includes("already registered")
      ) {
        try {
          return await this.completeProfile(clienteData);
        } catch (completeError) {
          throw error; // Lanzar error original
        }
      }

      throw error;
    }
  }

  /**
   * Completa el perfil con validaciones
   */
  static async completeProfile(
    clienteData: ClienteRegisterDTO
  ): Promise<ClienteResponseDTO> {
    // Validar datos antes de enviar
    this._validateClienteData(clienteData);

    const response = await apiClienteService.post<RegisterResponse>(
      "/auth0/complete-profile",
      clienteData
    );

    return response.data;
  }

  /**
   * Validar datos del cliente antes de enviar
   */
  private static _validateClienteData(clienteData: ClienteRegisterDTO): void {
    const errors: string[] = [];

    if (!clienteData.nombre?.trim()) {
      errors.push("Nombre es requerido");
    }

    if (!clienteData.apellido?.trim()) {
      errors.push("Apellido es requerido");
    }

    if (!clienteData.email?.trim()) {
      errors.push("Email es requerido");
    } else if (!/\S+@\S+\.\S+/.test(clienteData.email)) {
      errors.push("Email debe tener formato válido");
    }

    if (!clienteData.telefono?.trim()) {
      errors.push("Teléfono es requerido");
    }

    if (errors.length > 0) {
      throw new Error(`Datos inválidos: ${errors.join(", ")}`);
    }
  }

  /**
   * Obtiene información del usuario con cache
   */
  static async getCurrentUser(): Promise<UserProfileResponse> {
    const cacheKey = "current-user";

    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey)!;
    }

    const request = this._getCurrentUserRequest();
    this.pendingRequests.set(cacheKey, request);

    try {
      return await request;
    } finally {
      // Cache más corto para current user
      setTimeout(() => {
        this.pendingRequests.delete(cacheKey);
      }, 2000);
    }
  }

  private static async _getCurrentUserRequest(): Promise<UserProfileResponse> {
    const response = await apiClienteService.get<UserProfileResponse>(
      "/auth0/me"
    );
    return response;
  }

  /**
   * Valida el token actual de Auth0
   */
  static async validateToken(): Promise<TokenValidationResponse> {
    try {
      const response = await apiClienteService.get<TokenValidationResponse>(
        "/auth0/validate"
      );
      return response;
    } catch (error: any) {
      return { valid: false };
    }
  }

  /**
   * Fuerza la actualización de roles desde Auth0
   */
  static async refreshRoles(): Promise<RefreshRolesResponse> {
    const response = await apiClienteService.post<RefreshRolesResponse>(
      "/auth0/refresh-roles"
    );
    return response;
  }

  /**
   * Actualización de roles con token específico
   */
  static async refreshRolesWithToken(
    token: string
  ): Promise<RefreshRolesResponse> {
    const response = await fetch(
      "http://localhost:8080/api/auth0/refresh-roles",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: "Error desconocido" }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Limpiar cache manualmente
   */
  static clearCache(): void {
    this.pendingRequests.clear();
  }

  /**
   * Obtener estado del cache
   */
  static getCacheStatus(): { pendingRequests: number; cacheKeys: string[] } {
    return {
      pendingRequests: this.pendingRequests.size,
      cacheKeys: Array.from(this.pendingRequests.keys()),
    };
  }
}
