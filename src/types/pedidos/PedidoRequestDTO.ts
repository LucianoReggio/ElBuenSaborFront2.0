import type { DetallePedidoRequestDTO } from "./DetallePedidoRequestDTO";

export interface PedidoRequestDTO {
  idCliente: number;
  idSucursal: number;
  tipoEnvio: 'DELIVERY' | 'TAKE_AWAY';
  idDomicilio?: number; // Solo si es DELIVERY
  detalles: DetallePedidoRequestDTO[];
  observaciones?: string;
}