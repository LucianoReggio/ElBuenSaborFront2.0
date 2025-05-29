import { ApiClient } from "./ApiClient";
import type { ArticuloInsumoRequestDTO } from "../types/insumos/ArticuloInsumoRequestDTO";
import type { ArticuloInsumoResponseDTO } from "../types/insumos/ArticuloInsumoResponseDTO";

export interface CompraInsumoDTO {
  idInsumo: number;
  cantidad: number;
  precioCompra: number;
}

export class InsumoService extends ApiClient {
  private readonly endpoint = "/insumos";

  async getAll(): Promise<ArticuloInsumoResponseDTO[]> {
    return this.get<ArticuloInsumoResponseDTO[]>(this.endpoint);
  }

  async getById(id: number): Promise<ArticuloInsumoResponseDTO> {
    return this.get<ArticuloInsumoResponseDTO>(`${this.endpoint}/${id}`);
  }

  async create(
    data: ArticuloInsumoRequestDTO
  ): Promise<ArticuloInsumoResponseDTO> {
    return this.post<ArticuloInsumoResponseDTO>(this.endpoint, data);
  }

  async update(
    id: number,
    data: ArticuloInsumoRequestDTO
  ): Promise<ArticuloInsumoResponseDTO> {
    return this.put<ArticuloInsumoResponseDTO>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return this.deleteRequest<void>(`${this.endpoint}/${id}`);
  }

  // Métodos específicos para insumos
  async getInsumosParaElaborar(): Promise<ArticuloInsumoResponseDTO[]> {
    return this.get<ArticuloInsumoResponseDTO[]>(
      `${this.endpoint}/para-elaborar`
    );
  }

  async getInsumosStockBajo(): Promise<ArticuloInsumoResponseDTO[]> {
    return this.get<ArticuloInsumoResponseDTO[]>(`${this.endpoint}/stock-bajo`);
  }

  async getInsumosStockCritico(): Promise<ArticuloInsumoResponseDTO[]> {
    return this.get<ArticuloInsumoResponseDTO[]>(
      `${this.endpoint}/stock-critico`
    );
  }

  async registrarCompra(
    data: CompraInsumoDTO
  ): Promise<ArticuloInsumoResponseDTO> {
    return this.post<ArticuloInsumoResponseDTO>(
      `${this.endpoint}/compra`,
      data
    );
  }

  async getByCategoria(
    idCategoria: number
  ): Promise<ArticuloInsumoResponseDTO[]> {
    return this.get<ArticuloInsumoResponseDTO[]>(
      `${this.endpoint}/categoria/${idCategoria}`
    );
  }
}
