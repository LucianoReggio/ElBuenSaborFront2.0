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
}
