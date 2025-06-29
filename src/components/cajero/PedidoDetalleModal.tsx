import React, { useState, useEffect } from 'react';
import type { PedidoResponseDTO } from '../../types/pedidos';
import { PedidoService } from '../../services/PedidoServices';
import { PagoService, type PagoResponseDTO } from '../../services/PagoService'; // ✅ NUEVO

interface PedidoDetalleModalProps {
  pedido: PedidoResponseDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onPagoConfirmado?: () => void; // ✅ NUEVO: Callback para refrescar datos
}

export const PedidoDetalleModal: React.FC<PedidoDetalleModalProps> = ({
  pedido,
  isOpen,
  onClose,
  onPagoConfirmado
}) => {
  // ✅ NUEVO: Estados para manejo de pagos
  const [pagosFactura, setPagosFactura] = useState<PagoResponseDTO[]>([]);
  const [loadingPagos, setLoadingPagos] = useState(false);
  const [confirmandoPago, setConfirmandoPago] = useState<number | null>(null);
  const [facturaInfo, setFacturaInfo] = useState<{ idFactura: number; totalVenta: number } | null>(null);
  const pagoService = new PagoService();

  // ✅ NUEVO: Cargar pagos cuando se abre el modal
  useEffect(() => {
    if (isOpen && pedido?.idPedido) {
      cargarFacturaYPagos();
    }
  }, [isOpen, pedido?.idPedido]);

  // ✅ NUEVO: Función para cargar factura y pagos
  const cargarFacturaYPagos = async () => {
    if (!pedido?.idPedido) return;

    try {
      setLoadingPagos(true);
      
      // Primero obtener la factura
      const factura = await pagoService.getFacturaPedido(pedido.idPedido);
      setFacturaInfo(factura);
      
      // Luego obtener los pagos de esa factura
      const pagos = await pagoService.getPagosByFactura(factura.idFactura);
      setPagosFactura(pagos);
      console.log('💳 Pagos cargados:', pagos);
    } catch (error: any) {
      console.error('❌ Error al cargar factura y pagos:', error);
      setPagosFactura([]);
      setFacturaInfo(null);
    } finally {
      setLoadingPagos(false);
    }
  };

  // ✅ NUEVO: Función para cargar solo pagos (reutilizar facturaInfo existente)
  const cargarPagosFactura = async () => {
    if (!facturaInfo?.idFactura) return;

    try {
      setLoadingPagos(true);
      const pagos = await pagoService.getPagosByFactura(facturaInfo.idFactura);
      setPagosFactura(pagos);
      console.log('💳 Pagos recargados:', pagos);
    } catch (error: any) {
      console.error('❌ Error al recargar pagos:', error);
      setPagosFactura([]);
    } finally {
      setLoadingPagos(false);
    }
  };

  // ✅ NUEVO: Función para confirmar pago específico
  const confirmarPago = async (pago: PagoResponseDTO) => {
    try {
      setConfirmandoPago(pago.idPago);
      
      await pagoService.confirmarPagoEfectivo(pago.idPago);
      
      // Recargar pagos para mostrar estado actualizado
      await cargarPagosFactura();
      
      // Notificar al componente padre
      if (onPagoConfirmado) {
        onPagoConfirmado();
      }

      alert(`¡Pago confirmado! Monto: ${pago.monto}`);
      
    } catch (error: any) {
      console.error('❌ Error al confirmar pago:', error);
      alert('Error al confirmar el pago. Intenta de nuevo.');
    } finally {
      setConfirmandoPago(null);
    }
  };

  // ✅ NUEVO: Verificar si hay pagos pendientes en efectivo
  const tienePagosPendientesEfectivo = () => {
    return pagosFactura.some(pago => 
      pago.formaPago === 'EFECTIVO' && pago.estado === 'PENDIENTE'
    );
  };

  // ✅ NUEVO: Obtener pagos pendientes en efectivo
  const getPagosPendientesEfectivo = () => {
    return pagosFactura.filter(pago => 
      pago.formaPago === 'EFECTIVO' && pago.estado === 'PENDIENTE'
    );
  };

  if (!isOpen || !pedido) return null;

  const estadoInfo = PedidoService.formatearEstado(pedido.estado);
  const tiempos = PedidoService.formatearTiempos(pedido.fecha, pedido.horaEstimadaFinalizacion);

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Pedido #{pedido.idPedido}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  estadoInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  estadoInfo.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  estadoInfo.color === 'green' ? 'bg-green-100 text-green-800' :
                  estadoInfo.color === 'red' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {estadoInfo.icono} {estadoInfo.texto}
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  pedido.tipoEnvio === 'DELIVERY' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {pedido.tipoEnvio === 'DELIVERY' ? '🚚 Delivery' : '📦 Take Away'}
                </span>
                {/* ✅ NUEVO: Indicador de pago pendiente */}
                {tienePagosPendientesEfectivo() && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    💵 Pago pendiente
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda: Información del pedido */}
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Información del Pedido</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{tiempos.fecha}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora:</span>
                    <span className="font-medium">{tiempos.hora}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hora estimada:</span>
                    <span className="font-medium">{tiempos.horaEstimada}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiempo estimado:</span>
                    <span className="font-medium">{pedido.tiempoEstimadoTotal} min</span>
                  </div>
                </div>
              </div>

              {/* Información del cliente */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Cliente</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nombre:</span>
                    <span className="font-medium">
                      {pedido.nombreCliente} {pedido.apellidoCliente}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Teléfono:</span>
                    <span className="font-medium">{pedido.telefonoCliente}</span>
                  </div>
                </div>
              </div>

              {/* Información de entrega */}
              {pedido.tipoEnvio === 'DELIVERY' && pedido.domicilio && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3">Dirección de Entrega</h3>
                  <div className="text-sm">
                    <p className="font-medium">{pedido.domicilio.calle} {pedido.domicilio.numero}</p>
                    <p className="text-gray-600">
                      {pedido.domicilio.localidad}
                    </p>
                  </div>
                </div>
              )}

              {/* ✅ NUEVO: Sección de información de pagos */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-3">Estado de Pagos</h3>
                {loadingPagos ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-sm text-gray-600">Cargando pagos...</span>
                  </div>
                ) : pagosFactura.length === 0 ? (
                  <p className="text-sm text-gray-500">No hay información de pagos</p>
                ) : (
                  <div className="space-y-3">
                    {pagosFactura.map((pago) => {
                      const estadoPago = PagoService.formatearEstado(pago.estado);
                      const formaPago = PagoService.formatearFormaPago(pago.formaPago);
                      
                      return (
                        <div key={pago.idPago} className="bg-white p-3 rounded border">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium">
                                  {formaPago.icono} {formaPago.texto}
                                </span>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  estadoPago.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                  estadoPago.color === 'green' ? 'bg-green-100 text-green-800' :
                                  estadoPago.color === 'red' ? 'bg-red-100 text-red-800' :
                                  estadoPago.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {estadoPago.icono} {estadoPago.texto}
                                </span>
                              </div>
                              <div className="text-sm text-gray-600">
                                Monto: {formatearPrecio(pago.monto)}
                              </div>
                              {pago.descripcion && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {pago.descripcion}
                                </div>
                              )}
                            </div>
                            
                            {/* ✅ NUEVO: Botón para confirmar pago específico */}
                            {pago.formaPago === 'EFECTIVO' && pago.estado === 'PENDIENTE' && (
                              <button
                                onClick={() => confirmarPago(pago)}
                                disabled={confirmandoPago === pago.idPago}
                                className="ml-3 px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {confirmandoPago === pago.idPago ? (
                                  <span className="animate-spin">⏳</span>
                                ) : (
                                  '✅ Confirmar'
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Observaciones */}
              {pedido.observaciones && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Observaciones</h3>
                  <p className="text-sm text-gray-700">{pedido.observaciones}</p>
                </div>
              )}
            </div>

            {/* Columna derecha: Detalles del pedido */}
            <div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-4">Productos</h3>
                <div className="space-y-3">
                  {pedido.detalles.map((detalle, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{detalle.denominacionArticulo}</p>
                        <p className="text-sm text-gray-600">
                          Cantidad: {detalle.cantidad}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatearPrecio(detalle.subtotal)}</p>
                        <p className="text-sm text-gray-600">
                          {formatearPrecio(detalle.subtotal / detalle.cantidad)} c/u
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-xl font-bold text-green-600">
                      {formatearPrecio(pedido.total)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ✅ NUEVO: Sección de acciones rápidas para pagos */}
          {tienePagosPendientesEfectivo() && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-semibold text-yellow-800 mb-3">⚡ Acciones Rápidas de Pago</h3>
              <div className="flex flex-wrap gap-2">
                {getPagosPendientesEfectivo().map((pago) => (
                  <button
                    key={pago.idPago}
                    onClick={() => confirmarPago(pago)}
                    disabled={confirmandoPago === pago.idPago}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {confirmandoPago === pago.idPago ? (
                      <span className="animate-spin">⏳</span>
                    ) : (
                      <>💵 Confirmar {formatearPrecio(pago.monto)}</>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};