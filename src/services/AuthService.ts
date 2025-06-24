import { apiClienteService } from "./ApiClientService";
import type {
  ClienteRegisterDTO,
  ClienteResponseDTO,
} from "../types/clientes/Index";

// Tipos de respuesta que coinciden con el backend
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
 * Versión simplificada que coincide con el backend limpio
 */
export class AuthService {
  /**
   * Procesa el login con Auth0 y sincroniza con el backend
   */
  static async processAuth0Login(userData?: any): Promise<LoginResponse> {
    try {
      const response = await apiClienteService.post<LoginResponse>(
        "/auth0/login",
        userData
      );
      return response;
    } catch (error: any) {
      console.error("Error en login Auth0:", error);
      throw error;
    }
  }

  /**
   * Registra un cliente con datos adicionales después del login Auth0
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
      console.error("Error en registro Auth0:", error);
      throw error;
    }
  }

  /**
   * Completa el perfil de un usuario ya autenticado con Auth0
   */
  static async completeProfile(
    clienteData: ClienteRegisterDTO
  ): Promise<ClienteResponseDTO> {
    try {
      const response = await apiClienteService.post<RegisterResponse>(
        "/auth0/complete-profile",
        clienteData
      );
      console.log("✅ Profile completion successful");
      return response.data;
    } catch (error: any) {
      console.error("Error completing profile:", error);
      throw error;
    }
  }

  /**
   * Obtiene información del usuario actual desde Auth0
   */
  static async getCurrentUser(): Promise<UserProfileResponse> {
    try {
      const response = await apiClienteService.get<UserProfileResponse>(
        "/auth0/me"
      );
      return response;
    } catch (error: any) {
      console.error("Error obteniendo usuario actual:", error);
      throw error;
    }
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
      console.error("Error validando token:", error);
      return { valid: false };
    }
  }

  /**
   * Fuerza la actualización de roles desde Auth0
   */
  static async refreshRoles(): Promise<RefreshRolesResponse> {
    try {
      const response = await apiClienteService.post<RefreshRolesResponse>(
        "/auth0/refresh-roles"
      );
      return response;
    } catch (error: any) {
      console.error("Error refreshing roles:", error);
      throw error;
    }
  }

  /**
   * Actualización de roles con token específico (para casos especiales)
   */
  static async refreshRolesWithToken(
    token: string
  ): Promise<RefreshRolesResponse> {
    try {
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
    } catch (error: any) {
      console.error("Error refreshing roles with token:", error);
      throw error;
    }
  }
}