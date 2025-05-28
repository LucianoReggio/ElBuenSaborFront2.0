
import type { UnidadMedida } from "./UnidadMedida";
import type { Imagen } from "./Imagen";
import type { Categoria } from "./Categoria";
import type { DetallePedido } from "./DetallePedido";
import type{ Promocion } from "./Promocion";

export interface Articulo {
  idArticulo: number;
  denominacion: string;
  precioVenta: number;
  unidadMedida: UnidadMedida;
  imagenes: Imagen[];
  categoria: Categoria;
  detallesPedido?: DetallePedido[];
  promociones?: Promocion[];
}