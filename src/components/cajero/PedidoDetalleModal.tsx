import React from 'react';
import type { PedidoResponseDTO } from '../../types/pedidos';
import { PedidoService } from '../../services/PedidoServices';

interface PedidoDetalleModalProps {
  pedido: PedidoResponseDTO | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PedidoDetalleModal: React.FC<PedidoDetalleModalProps> = ({
  pedido,
  isOpen,
  onClose
}) => {
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
            {/* Información del pedido */}
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

              {/* Observaciones */}
              {pedido.observaciones && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Observaciones</h3>
                  <p className="text-sm text-gray-700">{pedido.observaciones}</p>
                </div>
              )}
            </div>

            {/* Detalles del pedido */}
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