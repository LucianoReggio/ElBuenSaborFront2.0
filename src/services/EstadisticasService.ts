import { ApiClienteService } from "./ApiClienteService"; 
import { apiClienteService } from "./ApiClienteService"; 
import type { RankingProductoDTO } from "../types/estadisticas/RankingProductoDTO";
import type { MovimientosMonetariosDTO } from '../types/estadisticas/MovimientosMonetariosDTO';

/**
 * Servicio para obtener estadísticas
 */
export class EstadisticasService {
  private static readonly endpoint = "/estadisticas";

  // Este método ya es estático, lo mantenemos igual
  static async getRankingProductos(
    fechaDesde: string,
    fechaHasta: string,
    limit: number = 10
  ): Promise<RankingProductoDTO[]> {
    try {
      const response = await apiClienteService.get<RankingProductoDTO[]>(
        `${this.endpoint}/ranking-productos`,
        {
          params: {
            fechaDesde,
            fechaHasta,
            limit,
          }
        }
      );
      return response;
    } catch (error: any) {
      throw error instanceof Error
        ? error
        : new Error("Error en el servicio de estadísticas");
    }
  }

  // --- 👇 ASEGÚRATE DE QUE ESTE MÉTODO TENGA LA PALABRA 'static' 👇 ---
   static async getMovimientosMonetarios(
    fechaDesde: string,
    fechaHasta: string
  ): Promise<MovimientosMonetariosDTO> {
    return await apiClienteService.get<MovimientosMonetariosDTO>(
      `/estadisticas/movimientos`,
      { fechaDesde, fechaHasta }
    );
  }
}
