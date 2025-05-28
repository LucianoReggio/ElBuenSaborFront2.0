

import type { SucursalEmpresa } from "./SucursalEmpresa";

export interface Empresa {
  idEmpresa: number;
  nombre: string;
  razonSocial: string;
  cuil: number;
  sucursales?: SucursalEmpresa[];
}
