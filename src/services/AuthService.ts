import { apiClienteService } from "./ApiClienteService";
import type {
  ClienteRegisterDTO,
  ClienteResponseDTO,
} from "../types/clientes/Index";

/**
 * Servicio de autenticación para Auth0
 */
export class AuthService {
  /**
   * Procesa el login con Auth0 y sincroniza con el backend
   */
  static async processAuth0Login(userData?: any): Promise<any> {
    try {
      const response = await apiClienteService.post("/auth0/login", userData);
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
      const response = await apiClienteService.post<{
        success: boolean;
        cliente: ClienteResponseDTO;
        message: string;
      }>("/auth0/register", clienteData);

      return response.cliente;
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
      const response = await apiClienteService.post<{
        success: boolean;
        cliente: ClienteResponseDTO;
        message: string;
      }>("/auth0/complete-profile", clienteData);

      console.log("✅ Profile completion response:", response);

      // Retornar el cliente directamente
      return response.cliente;
    } catch (error: any) {
      console.error("Error completing profile:", error);
      throw error;
    }
  }

  /**
   * Obtiene información del usuario actual desde Auth0
   */
  static async getCurrentUser(): Promise<any> {
    try {
      const response = await apiClienteService.get("/auth0/me");
      return response;
    } catch (error: any) {
      console.error("Error obteniendo usuario actual:", error);
      throw error;
    }
  }

  /**
   * Valida el token actual de Auth0
   */
  static async validateToken(): Promise<boolean> {
    try {
      const response = await apiClienteService.get<{ valid: boolean }>(
        "/auth0/validate"
      );
      return response.valid;
    } catch (error) {
      console.error("Error validando token:", error);
      return false;
    }
  }

  /**
   * Obtiene información de roles actual (para debugging)
   */
  static async getCurrentRoles(): Promise<{
    tokenRoles: any;
    extractedRole: string;
    dbRole: string;
    rolesMatch: boolean;
    userId: string;
  }> {
    try {
      const response = await apiClienteService.get<{
        tokenRoles: any;
        extractedRole: string;
        dbRole: string;
        rolesMatch: boolean;
        userId: string;
      }>("/auth0/current-roles");
      return response;
    } catch (error: any) {
      console.error("Error getting current roles:", error);
      throw error;
    }
  }

  /**
   * Fuerza la actualización de roles desde Auth0 con token específico
   */
  static async refreshRolesWithToken(token: string): Promise<{
    success: boolean;
    oldRole?: string;
    newRole?: string;
    currentRole?: string;
    message: string;
  }> {
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
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error("Error refreshing roles with explicit token:", error);
      throw error;
    }
  }

  /**
   * Versión original que usa apiClienteService (token automático)
   */
  static async refreshRoles(): Promise<{
    success: boolean;
    oldRole?: string;
    newRole?: string;
    currentRole?: string;
    message: string;
  }> {
    try {
      const response = await apiClienteService.post<{
        success: boolean;
        oldRole?: string;
        newRole?: string;
        currentRole?: string;
        message: string;
      }>("/auth0/refresh-roles");

      return response;
    } catch (error: any) {
      console.error("Error refreshing roles:", error);
      throw error;
    }
  }
}
