import { ApiClient } from "./ApiClient";

export interface UnidadMedidaDTO {
  idUnidadMedida: number;
  denominacion: string;
}

export class UnidadMedidaService extends ApiClient {
  private readonly endpoint = "/unidades-medida";

  async getAll(): Promise<UnidadMedidaDTO[]> {
    return this.get<UnidadMedidaDTO[]>(this.endpoint);
  }

  async getById(id: number): Promise<UnidadMedidaDTO> {
    return this.get<UnidadMedidaDTO>(`${this.endpoint}/${id}`);
  }
}
