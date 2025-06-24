import { apiClienteService } from "./ApiClientService";
import type { ClienteResponseDTO } from "../types/clientes/Index";

/**
 * Servicio para operaciones CRUD de clientes
 * El registro ahora se maneja en AuthService con Auth0
 */
export class ClienteService {
  private static readonly BASE_URL = "/clientes";

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
   * Obtiene el perfil del cliente autenticado actual
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
   * Actualiza el perfil del cliente autenticado
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
   * Elimina un cliente (requiere rol ADMIN)
   */
  static async delete(id: number): Promise<void> {
    try {
      await apiClienteService.deleteRequest<void>(`${this.BASE_URL}/${id}`);
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
   * Manejo centralizado de errores
   */
  private static handleError(error: any): Error {
    return error instanceof Error
      ? error
      : new Error("Error en el servicio de clientes");
  }
}