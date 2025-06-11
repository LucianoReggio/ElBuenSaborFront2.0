import { apiClienteService } from './ApiClientService';
import type{ ClienteRegisterDTO, ClienteResponseDTO } from '../types/clientes/Index';

export class ClienteService {
  private static readonly BASE_URL = '/clientes'; // Cambié de '/api/clientes' a '/clientes'

  /**
   * Registra un nuevo cliente
   */
  static async register(clienteData: ClienteRegisterDTO): Promise<ClienteResponseDTO> {
    try {
      const response = await apiClienteService.post<ClienteResponseDTO>(`${this.BASE_URL}/register`, clienteData);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene todos los clientes (requiere autenticación de admin)
   */
  static async getAll(): Promise<ClienteResponseDTO[]> {
    try {
      const response = await apiClienteService.get<ClienteResponseDTO[]>(this.BASE_URL);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Obtiene un cliente por ID
   */
  static async getById(id: number): Promise<ClienteResponseDTO> {
    try {
      const response = await apiClienteService.get<ClienteResponseDTO>(`${this.BASE_URL}/${id}`);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Actualiza un cliente
   */
  static async update(id: number, clienteData: ClienteResponseDTO): Promise<ClienteResponseDTO> {
    try {
      const response = await apiClienteService.put<ClienteResponseDTO>(`${this.BASE_URL}/${id}`, clienteData);
      return response;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Elimina un cliente
   */
  static async delete(id: number): Promise<void> {
    try {
      await apiClienteService.deleteRequest<void>(`${this.BASE_URL}/${id}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private static handleError(error: any): Error {
    // El error ya viene procesado desde ApiClienteService, simplemente lo retornamos
    return error instanceof Error ? error : new Error('Error en el servicio de clientes');
  }
}