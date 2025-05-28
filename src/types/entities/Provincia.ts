// src/models/Provincia.ts

import type { Pais } from "./Pais";
import type { Localidad } from "./Localidad";

export interface Provincia {
  idProvincia: number;
  nombre: string;
  pais: Pais;
  localidades?: Localidad[];
}
