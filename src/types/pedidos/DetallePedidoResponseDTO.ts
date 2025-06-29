
export interface DetallePedidoResponseDTO {
  idDetallePedido: number;
  idArticulo: number;
  denominacionArticulo: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  unidadMedida: string;
  tiempoPreparacion: number; // minutos
  observaciones?: string;

  // ✅ NUEVOS: Campos para promociones
  precioUnitarioOriginal?: number;    // Precio sin promoción
  descuentoPromocion?: number;        // Monto del descuento aplicado
  precioUnitarioFinal?: number;       // Precio después del descuento
  tienePromocion?: boolean;           // Si tiene promoción aplicada
  
  // Detalle de la promoción aplicada
  promocionAplicada?: PromocionAplicadaDTO;
}

export interface PromocionAplicadaDTO {
  idPromocion: number;
  denominacion: string;
  descripcion?: string;
  tipoDescuento: string; // "PORCENTUAL" o "MONTO_FIJO"
  valorDescuento: number;
  resumenDescuento: string; // "15% descuento - Ahorro: $150"
}

