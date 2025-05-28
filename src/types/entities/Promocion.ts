// src/models/Promocion.ts

import type { Articulo } from "./Articulo";
import type { Imagen } from "./Imagen";
import type { SucursalEmpresa } from "./SucursalEmpresa";

export interface Promocion {
  idPromocion: number;
  denominacion: string;
  fechaDesde: Date; // LocalDateTime
  fechaHasta: Date; // LocalDateTime
  horaDesde: string; // LocalTime, puede ser "HH:mm:ss"
  horaHasta: string; // LocalTime
  descripcionDescuento?: string;
  precioPromocional: number;
  articulos?: Articulo[];
  imagenes?: Imagen[];
  sucursales?: SucursalEmpresa[];
}
