// services/ClienteService.ts

import { apiClienteService } from "./ApiClienteService";
import type {
  ClienteResponseDTO,
  ClientePerfilDTO,
  ClienteEstadisticasDTO,
  Auth0ConfigDTO,
} from "../types/clientes/Index";

/**
 * Servicio para operaciones CRUD de clientes
 * ACTUALIZADO: Incluye funcionalidades específicas de perfil
 */
export class ClienteService {
  private static readonly BASE_URL = "/clientes";

  // ==================== ENDPOINTS ADMINISTRATIVOS ====================

  /**
   * Obtiene todos los clientes (requiere rol ADMIN)
   */
  static async getAll(): Promise<ClienteResponseDTO[]> {
    try {
      return await apiClienteService.get<ClienteResponseDTO[]>(this.BASE_URL);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene un cliente por ID
   */
  static async getById(id: number): Promise<ClienteResponseDTO> {
    try {
      return await apiClienteService.get<ClienteResponseDTO>(
        `${this.BASE_URL}/${id}`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualiza un cliente específico (requiere permisos)
   */
  static async update(
    id: number,
    clienteData: ClienteResponseDTO
  ): Promise<ClienteResponseDTO> {
    try {
      return await apiClienteService.put<ClienteResponseDTO>(
        `${this.BASE_URL}/${id}`,
        clienteData
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Elimina un cliente (requiere rol ADMIN)
   */
  static async delete(id: number): Promise<void> {
    try {
      await apiClienteService.deleteRequest<void>(`${this.BASE_URL}/${id}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== ENDPOINTS DE PERFIL ====================

  /**
   * Obtiene el perfil completo del cliente autenticado (incluye domicilios)
   */
  static async getMyProfile(): Promise<ClienteResponseDTO> {
    try {
      return await apiClienteService.get<ClienteResponseDTO>(
        `${this.BASE_URL}/perfil`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene solo la información personal del usuario (sin domicilios)
   * Útil para formularios de edición de perfil
   */
  static async getMyProfileInfo(): Promise<ClientePerfilDTO> {
    try {
      return await apiClienteService.get<ClientePerfilDTO>(
        `${this.BASE_URL}/perfil/info`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualiza solo la información personal del usuario (sin domicilios)
   * Los domicilios se manejan con DomicilioService
   */
  static async updateMyProfileInfo(
    perfilData: ClientePerfilDTO
  ): Promise<ClienteResponseDTO> {
    try {
      return await apiClienteService.put<ClienteResponseDTO>(
        `${this.BASE_URL}/perfil/info`,
        perfilData
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualiza el perfil completo del cliente autenticado
   * @deprecated Usar updateMyProfileInfo para info personal
   */
  static async updateMyProfile(
    clienteData: ClienteResponseDTO
  ): Promise<ClienteResponseDTO> {
    try {
      return await apiClienteService.put<ClienteResponseDTO>(
        `${this.BASE_URL}/perfil`,
        clienteData
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Elimina el perfil del cliente autenticado
   */
  static async deleteMyProfile(): Promise<void> {
    try {
      await apiClienteService.deleteRequest<void>(`${this.BASE_URL}/perfil`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene estadísticas del perfil del usuario
   */
  static async getMyProfileStats(): Promise<ClienteEstadisticasDTO> {
    try {
      return await apiClienteService.get<ClienteEstadisticasDTO>(
        `${this.BASE_URL}/perfil/estadisticas`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene configuración para Auth0 (cambio de contraseña, etc.)
   */
  static async getAuth0Config(): Promise<Auth0ConfigDTO> {
    try {
      return await apiClienteService.get<Auth0ConfigDTO>(
        `${this.BASE_URL}/perfil/auth0-config`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Manejo centralizado de errores
   */
  private static handleError(error: any): Error {
    return error instanceof Error
      ? error
      : new Error("Error en el servicio de clientes");
  }
}
