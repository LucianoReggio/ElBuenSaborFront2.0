// src/components/delivery/PedidoDetalleModal.tsx
import React from 'react';
import { X, MapPin, Phone, Clock, DollarSign, Package, Truck } from 'lucide-react';
import type { PedidoResponseDTO } from '../../types/pedidos';

interface PedidoDetalleModalProps {
  pedido: PedidoResponseDTO;
  isOpen: boolean;
  onClose: () => void;
  onEntregar: (idPedido: number) => void;
  isEntregando?: boolean;
}

export default function PedidoDetalleModal({
  pedido,
  isOpen,
  onClose,
  onEntregar,
  isEntregando = false
}: PedidoDetalleModalProps) {
  if (!isOpen) return null;

  // Formatear fecha y hora
  const formatearFechaHora = (fecha: string) => {
    const fechaObj = new Date(fecha);
    return {
      fecha: fechaObj.toLocaleDateString('es-AR'),
      hora: fechaObj.toLocaleTimeString('es-AR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const { fecha, hora } = formatearFechaHora(pedido.fecha);

  // Formatear hora estimada
  const horaEstimada = pedido.horaEstimadaFinalizacion.slice(0, 5); // "HH:mm:ss" -> "HH:mm"

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header del Modal */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Detalle del Pedido #{pedido.idPedido}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {fecha} a las {hora}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Información del Cliente */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-500" />
              Información del Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Cliente</p>
                <p className="text-gray-900">
                  {pedido.nombreCliente} {pedido.apellidoCliente}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Teléfono</p>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-1 text-gray-400" />
                  <a 
                    href={`tel:${pedido.telefonoCliente}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {pedido.telefonoCliente}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Dirección de Entrega */}
          {pedido.domicilio && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-500" />
                Dirección de Entrega
              </h3>
              <div className="space-y-2">
                <p className="text-gray-900">
                  <span className="font-medium">Dirección:</span> {pedido.domicilio.calle} {pedido.domicilio.numero}
                </p>
              
                {pedido.domicilio.localidad && (
                  <p className="text-gray-900">
                    <span className="font-medium">Localidad:</span> {pedido.domicilio.localidad}
                  </p>
                )}
                {pedido.observaciones && (
                  <p className="text-gray-700">
                    <span className="font-medium">Observaciones:</span> {pedido.observaciones}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Tiempo Estimado */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-yellow-500" />
              Tiempo de Entrega
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Hora Estimada</p>
                <p className="text-gray-900 font-semibold">{horaEstimada}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Tiempo Total</p>
                <p className="text-gray-900 font-semibold">{pedido.tiempoEstimadoTotal} minutos</p>
              </div>
            </div>
          </div>

          {/* Observaciones del Pedido */}
          {pedido.observaciones && (
            <div className="bg-orange-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-5 h-5 mr-2 text-orange-500" />
                Observaciones del Pedido
              </h3>
              <p className="text-gray-800 bg-white p-3 rounded border">
                {pedido.observaciones}
              </p>
            </div>
          )}

          {/* Lista de Productos */}
          <div className="bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 p-4 border-b border-gray-200 flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-500" />
              Productos del Pedido
            </h3>
            <div className="divide-y divide-gray-200">
              {pedido.detalles.map((detalle, index) => (
                <div key={index} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {detalle.denominacionArticulo}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span>Cantidad: {detalle.cantidad}</span>
                        <span>Precio: ${detalle.precioUnitario.toFixed(2)}</span>
                        {detalle.unidadMedida && (
                          <span>({detalle.unidadMedida})</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ${detalle.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total del Pedido */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Total del Pedido
              </h3>
              <p className="text-2xl font-bold text-green-600">
                ${pedido.total.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer con Botones */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Cerrar
          </button>
          <button
            onClick={() => onEntregar(pedido.idPedido)}
            disabled={isEntregando}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isEntregando ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Entregando...
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 mr-2" />
                Marcar como Entregado
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}