import type { CategoriaRequestDTO } from "../types/categorias/CategoriaRequestDTO";
import type { CategoriaResponseDTO } from "../types/categorias/CategoriaResponseDTO";
import { ApiClient } from "./ApiClient";

export class CategoriaService extends ApiClient {
  private readonly endpoint = "/categorias";

  async getAll(): Promise<CategoriaResponseDTO[]> {
    return this.get<CategoriaResponseDTO[]>(this.endpoint);
  }

  async getById(id: number): Promise<CategoriaResponseDTO> {
    return this.get<CategoriaResponseDTO>(`${this.endpoint}/${id}`);
  }

  async create(data: CategoriaRequestDTO): Promise<CategoriaResponseDTO> {
    return this.post<CategoriaResponseDTO>(this.endpoint, data);
  }

  async update(
    id: number,
    data: CategoriaRequestDTO
  ): Promise<CategoriaResponseDTO> {
    return this.put<CategoriaResponseDTO>(`${this.endpoint}/${id}`, data);
  }

  async delete(id: number): Promise<void> {
    return this.deleteRequest<void>(`${this.endpoint}/${id}`);
  }

  // Métodos específicos para categorías
  async getCategoriasIngredientes(): Promise<CategoriaResponseDTO[]> {
    return this.get<CategoriaResponseDTO[]>(`${this.endpoint}/ingredientes`);
  }

  async getCategoriasProductos(): Promise<CategoriaResponseDTO[]> {
    return this.get<CategoriaResponseDTO[]>(`${this.endpoint}/productos`);
  }

  async getSubcategorias(
    idCategoriaPadre: number
  ): Promise<CategoriaResponseDTO[]> {
    return this.get<CategoriaResponseDTO[]>(
      `${this.endpoint}/${idCategoriaPadre}/subcategorias`
    );
  }
}
