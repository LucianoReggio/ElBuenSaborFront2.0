import { apiClienteService } from "./ApiClienteService";
import type { ArticuloInsumoRequestDTO } from "../types/insumos/ArticuloInsumoRequestDTO";
import type { ArticuloInsumoResponseDTO } from "../types/insumos/ArticuloInsumoResponseDTO";

export interface CompraInsumoDTO {
  idInsumo: number;
  cantidad: number;
  precioCompra: number;
}

/**
 * Servicio para operaciones CRUD de insumos
 * Usa apiClienteService que maneja automáticamente los tokens de Auth0
 */
export class InsumoService {
  private readonly endpoint = "/articulos-insumo";

  async getAll(): Promise<ArticuloInsumoResponseDTO[]> {
    try {
      return await apiClienteService.get<ArticuloInsumoResponseDTO[]>(
        this.endpoint
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getById(id: number): Promise<ArticuloInsumoResponseDTO> {
    try {
      return await apiClienteService.get<ArticuloInsumoResponseDTO>(
        `${this.endpoint}/${id}`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async create(
    data: ArticuloInsumoRequestDTO
  ): Promise<ArticuloInsumoResponseDTO> {
    try {
      return await apiClienteService.post<ArticuloInsumoResponseDTO>(
        this.endpoint,
        data
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async update(
    id: number,
    data: ArticuloInsumoRequestDTO
  ): Promise<ArticuloInsumoResponseDTO> {
    try {
      return await apiClienteService.put<ArticuloInsumoResponseDTO>(
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

  // Métodos específicos para insumos
  async getInsumosParaElaborar(): Promise<ArticuloInsumoResponseDTO[]> {
    try {
      return await apiClienteService.get<ArticuloInsumoResponseDTO[]>(
        `${this.endpoint}/para-elaborar`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getInsumosStockBajo(): Promise<ArticuloInsumoResponseDTO[]> {
    try {
      return await apiClienteService.get<ArticuloInsumoResponseDTO[]>(
        `${this.endpoint}/stock-bajo`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getInsumosStockCritico(): Promise<ArticuloInsumoResponseDTO[]> {
    try {
      return await apiClienteService.get<ArticuloInsumoResponseDTO[]>(
        `${this.endpoint}/stock-critico`
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async registrarCompra(
    data: CompraInsumoDTO
  ): Promise<ArticuloInsumoResponseDTO> {
    try {
      return await apiClienteService.post<ArticuloInsumoResponseDTO>(
        `${this.endpoint}/compra`,
        data
      );
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async getByCategoria(
    idCategoria: number
  ): Promise<ArticuloInsumoResponseDTO[]> {
    try {
      return await apiClienteService.get<ArticuloInsumoResponseDTO[]>(
        `${this.endpoint}/categoria/${idCategoria}`
      );
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
      : new Error("Error en el servicio de insumos");
  }
}
