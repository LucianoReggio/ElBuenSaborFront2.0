
import type { Localidad } from "./Localidad";
import type { SucursalEmpresa } from "./SucursalEmpresa";
import type { Pedido } from "./Pedido";
import type { Cliente } from "./Cliente";

export interface Domicilio {
  idDomicilio: number;
  calle: string;
  numero: number;
  cp: number;
  localidad: Localidad;
  sucursalEmpresa?: SucursalEmpresa;
  pedidos?: Pedido[];
  clientes?: Cliente[];
}
