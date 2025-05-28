// src/models/Pedido.ts

import type { Estado } from "./enums/Estado";
import type { TipoEnvio } from "./enums/TipoEnvio";
import type { Cliente } from "./Cliente";
import type { Domicilio } from "./Domicilio";
import type { SucursalEmpresa } from "./SucursalEmpresa";
import type { DetallePedido } from "./DetallePedido";
import type { Factura } from "./Factura";

export interface Pedido {
  idPedido: number;
  fecha: Date; // LocalDateTime -> Date
  horaEstimadaFinalizacion?: string; // LocalTime, guardar como string "HH:mm:ss" o similar
  total: number;
  totalCosto: number;
  estado: Estado;
  tipoEnvio: TipoEnvio;
  cliente: Cliente;
  domicilio?: Domicilio;
  sucursal: SucursalEmpresa;
  detalles?: DetallePedido[];
  factura?: Factura;
}
