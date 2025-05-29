import { ApiClient } from "./ApiClient";

export interface UnidadMedidaDTO {
  id: number;
  denominacion: string;
  activo: boolean;
}

export class UnidadMedidaService extends ApiClient {
  private readonly endpoint = "/unidades-medida";

  async getAll(): Promise<UnidadMedidaDTO[]> {
    return this.get<UnidadMedidaDTO[]>(this.endpoint);
  }

  async getActivas(): Promise<UnidadMedidaDTO[]> {
    return this.get<UnidadMedidaDTO[]>(`${this.endpoint}/activas`);
  }

  async getById(id: number): Promise<UnidadMedidaDTO> {
    return this.get<UnidadMedidaDTO>(`${this.endpoint}/${id}`);
  }
}
