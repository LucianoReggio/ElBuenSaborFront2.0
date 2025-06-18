import type { DomicilioDTO } from "../clientes/Index";
import type { DetallePedidoResponseDTO } from "./DetallePedidoResponseDTO";

export interface PedidoResponseDTO {
  idPedido: number;
  fecha: string; // ISO string
  horaEstimadaFinalizacion: string; // time string "HH:mm:ss"
  total: number;
  estado: 'PREPARACION' | 'PENDIENTE' | 'CANCELADO' | 'LISTO' | 'ENTREGADO';
  tipoEnvio: 'DELIVERY' | 'TAKE_AWAY';
  
  // Información del cliente
  idCliente: number;
  nombreCliente: string;
  apellidoCliente: string;
  telefonoCliente: string;
  
  // Información del domicilio (si es delivery)
  domicilio?: DomicilioDTO;
  
  // Detalles del pedido
  detalles: DetallePedidoResponseDTO[];
  
  // Información adicional
  tiempoEstimadoTotal: number; // en minutos
  stockSuficiente: boolean;

  observaciones?: string; // opcional
}