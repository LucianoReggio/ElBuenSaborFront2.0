import type { ArticuloManufacturado } from "./ArticuloManufacturado";
import type { ArticuloInsumo } from "./ArticuloInsumo";

export interface ArticuloManufacturadoDetalle {
  idDetalleManufacturado: number;
  cantidad: number;
  articuloManufacturado: ArticuloManufacturado;
  articuloInsumo: ArticuloInsumo;
}