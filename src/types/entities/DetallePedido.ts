// src/models/DetallePedido.ts

import type { Articulo } from "./Articulo";
import type { Pedido } from "./Pedido";

export interface DetallePedido {
  idDetallePedido: number;
  cantidad: number;
  subtotal: number;
  articulo: Articulo;
  pedido: Pedido;
}
