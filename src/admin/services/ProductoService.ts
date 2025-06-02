import { ApiClient } from "./ApiClient";
import type { ArticuloManufacturadoRequestDTO } from "../types/productos/ArticuloManufacturadoRequestDTO";
import type { ArticuloManufacturadoResponseDTO } from "../types/productos/ArticuloManufacturadoResponseDTO";

export class ProductoService extends ApiClient {
  private readonly endpoint = "/articulos-manufacturados";

  async getAll(): Promise<ArticuloManufacturadoResponseDTO[]> {
    return this.get<ArticuloManufacturadoResponseDTO[]>(this.endpoint);
  }

  async getById(id: number): Promise<ArticuloManufacturadoResponseDTO> {
    return this.get<ArticuloManufacturadoResponseDTO>(`${this.endpoint}/${id}`);
  }

  async create(
    data: ArticuloManufacturadoRequestDTO
  ): Promise<ArticuloManufacturadoResponseDTO> {
    return this.post<ArticuloManufacturadoResponseDTO>(this.endpoint, data);
  }

  async update(
    id: number,
    data: ArticuloManufacturadoRequestDTO
  ): Promise<ArticuloManufacturadoResponseDTO> {
    return this.put<ArticuloManufacturadoResponseDTO>(
      `${this.endpoint}/${id}`,
      data
    );
  }

  async delete(id: number): Promise<void> {
    return this.deleteRequest<void>(`${this.endpoint}/${id}`);
  }

  // Métodos específicos para productos
  async getByCategoria(
    idCategoria: number
  ): Promise<ArticuloManufacturadoResponseDTO[]> {
    return this.get<ArticuloManufacturadoResponseDTO[]>(
      `${this.endpoint}/categoria/${idCategoria}`
    );
  }

  async getProductosDisponibles(): Promise<ArticuloManufacturadoResponseDTO[]> {
    return this.get<ArticuloManufacturadoResponseDTO[]>(
      `${this.endpoint}/disponibles`
    );
  }

  async calcularCosto(
    id: number
  ): Promise<{ costoTotal: number; margenGanancia: number }> {
    return this.get<{ costoTotal: number; margenGanancia: number }>(
      `${this.endpoint}/${id}/costo`
    );
  }

  async verificarStock(
    id: number
  ): Promise<{ stockSuficiente: boolean; cantidadMaximaPreparable: number }> {
    return this.get<{
      stockSuficiente: boolean;
      cantidadMaximaPreparable: number;
    }>(`${this.endpoint}/${id}/stock`);
  }
}
