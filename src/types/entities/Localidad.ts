// src/models/Localidad.ts

import type { Provincia } from "./Provincia";
import type { Domicilio } from "./Domicilio";

export interface Localidad {
  idLocalidad: number;
  nombre: string;
  provincia: Provincia;
  domicilios?: Domicilio[];
}
