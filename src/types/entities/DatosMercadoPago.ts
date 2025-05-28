// src/models/DatosMercadoPago.ts

import type { Factura } from "./Factura";

export interface DatosMercadoPago {
  idMercadoPago: number;
  paymentId: number;
  status: string;
  statusDetail?: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  dateCreated?: string;     // Usar string si los datos vienen en formato ISO desde el backend
  dateApproved?: string;
  factura: Factura;
}
