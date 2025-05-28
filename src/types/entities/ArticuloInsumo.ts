import type{ Articulo } from "./Articulo";
import type { ArticuloManufacturadoDetalle } from "./ArticuloManufacturadoDetalle";

export interface ArticuloInsumo extends Articulo {
  precioCompra: number;
  stockActual: number;
  stockMaximo: number;
  esParaElaborar: boolean;
  detallesManufacturados?: ArticuloManufacturadoDetalle[];
}