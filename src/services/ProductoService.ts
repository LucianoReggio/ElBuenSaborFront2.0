import { apiClienteService } from "./ApiClienteService";
import type { ArticuloManufacturadoRequestDTO } from "../types/productos/ArticuloManufacturadoRequestDTO";
import type { ArticuloManufacturadoResponseDTO } from "../types/productos/ArticuloManufacturadoResponseDTO";

/**
 * Servicio para operaciones CRUD de productos manufacturados
 * Usa apiClienteService que maneja automáticamente los tokens de Auth0
 */
export class ProductoService {
  private readonly endpoint = "/articulos-manufacturados";

  async getAll(): Promise<ArticuloManufacturadoResponseDTO[]> {
    try {
      return await apiClienteService.get<ArticuloManufacturadoResponseDTO[]>(
        this.endpoint
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getById(id: number): Promise<ArticuloManufacturadoResponseDTO> {
    try {
      return await apiClienteService.get<ArticuloManufacturadoResponseDTO>(
        `${this.endpoint}/${id}`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async create(
    data: ArticuloManufacturadoRequestDTO
  ): Promise<ArticuloManufacturadoResponseDTO> {
    try {
      return await apiClienteService.post<ArticuloManufacturadoResponseDTO>(
        this.endpoint,
        data
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
  
   async desactivar(id: number): Promise<void> {
    return this.deleteRequest<void>(`${this.endpoint}/${id}/desactivar`);
  }

  async activar(id: number): Promise<void> {
    return this.put<void>(`${this.endpoint}/${id}/activar`);
  }

  async update(
    id: number,
    data: ArticuloManufacturadoRequestDTO
  ): Promise<ArticuloManufacturadoResponseDTO> {
    try {
      return await apiClienteService.put<ArticuloManufacturadoResponseDTO>(
        `${this.endpoint}/${id}`,
        data
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await apiClienteService.deleteRequest<void>(`${this.endpoint}/${id}`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  // Métodos específicos para productos
  async getByCategoria(
    idCategoria: number
  ): Promise<ArticuloManufacturadoResponseDTO[]> {
    try {
      return await apiClienteService.get<ArticuloManufacturadoResponseDTO[]>(
        `${this.endpoint}/categoria/${idCategoria}`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getProductosDisponibles(): Promise<ArticuloManufacturadoResponseDTO[]> {
    try {
      return await apiClienteService.get<ArticuloManufacturadoResponseDTO[]>(
        `${this.endpoint}/disponibles`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async calcularCosto(
    id: number
  ): Promise<{ costoTotal: number; margenGanancia: number }> {
    try {
      return await apiClienteService.get<{
        costoTotal: number;
        margenGanancia: number;
      }>(`${this.endpoint}/${id}/costo`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async verificarStock(
    id: number
  ): Promise<{ stockSuficiente: boolean; cantidadMaximaPreparable: number }> {
    try {
      return await apiClienteService.get<{
        stockSuficiente: boolean;
        cantidadMaximaPreparable: number;
      }>(`${this.endpoint}/${id}/stock`);
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(error: any): Error {
    return error instanceof Error
      ? error
      : new Error("Error en el servicio de productos");
  }
}
