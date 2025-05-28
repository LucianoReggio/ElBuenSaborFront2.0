// src/models/Factura.ts

import type { FormaPago } from "./enums/FormaPago";
import type { DatosMercadoPago } from "./DatosMercadoPago";
import type { Pedido } from "./Pedido";

export interface Factura {
  idFactura: number;
  fechaFactura: string; // ISO date string
  nroComprobante: string;
  formaPago: FormaPago;
  subTotal: number;
  descuento: number;
  gastosEnvio: number;
  totalVenta: number;
  datosMercadoPago?: DatosMercadoPago;
  pedido?: Pedido;
}
