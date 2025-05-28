// src/models/Pais.ts

import type { Provincia } from "./Provincia";

export interface Pais {
  idPais: number;
  nombre: string;
  provincias?: Provincia[];
}
