// src/models/Imagen.ts

import type { Articulo } from "./Articulo";
import type { Promocion } from "./Promocion";
import type { Cliente } from "./Cliente";

export interface Imagen {
  idImagen: number;
  denominacion: string;
  articulo: Articulo;
  promocion: Promocion;
  cliente?: Cliente;
}
