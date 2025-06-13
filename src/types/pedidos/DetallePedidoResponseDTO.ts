
export interface DetallePedidoResponseDTO {
  idDetallePedido: number;
  idArticulo: number;
  denominacionArticulo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  unidadMedida: string;
  tiempoPreparacion: number; // minutos
}
