import React, { useState } from 'react';
import type { PedidoResponseDTO } from '../../types/pedidos';
import { PedidoService } from '../../services/PedidoServices';
import { PedidoDetalleModal } from './PedidoDetalleModal';

interface PedidosGestionTableProps {
  pedidos: PedidoResponseDTO[];
  loading: boolean;
  onCambiarEstado: (id: number, nuevoEstado: string) => Promise<void>;
}

export const PedidosGestionTable: React.FC<PedidosGestionTableProps> = ({
  pedidos,
  loading,
  onCambiarEstado
}) => {
  const [selectedPedido, setSelectedPedido] = useState<PedidoResponseDTO | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  const formatearPrecio = (precio: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(precio);
  };

  const formatearFechaHora = (fecha: string) => {
    const fechaObj = new Date(fecha);
    return {
      fecha: fechaObj.toLocaleDateString('es-AR'),
      hora: fechaObj.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const handleCambiarEstado = async (pedido: PedidoResponseDTO, nuevoEstado: string) => {
    try {
      setProcessingId(pedido.idPedido);
      await onCambiarEstado(pedido.idPedido, nuevoEstado);
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del pedido');
    } finally {
      setProcessingId(null);
    }
  };

  const getEstadoStyle = (estado: string) => {
    const estadoInfo = PedidoService.formatearEstado(estado);
    const colorClasses = {
      yellow: 'bg-yellow-100 text-yellow-800',
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    };
    return `${colorClasses[estadoInfo.color as keyof typeof colorClasses]} px-2 py-1 rounded-full text-xs font-medium`;
  };

  const getAccionesDisponibles = (pedido: PedidoResponseDTO) => {
    const acciones = [];

    switch (pedido.estado) {
      case 'PENDIENTE':
        acciones.push({
          texto: 'Cocina',
          estado: 'PREPARACION',
          color: 'bg-blue-500 hover:bg-blue-600',
          icono: '👨‍🍳'
        });
        acciones.push({
          texto: 'Anular',
          estado: 'CANCELADO',
          color: 'bg-red-500 hover:bg-red-600',
          icono: '❌'
        });
        break;

      case 'PREPARACION':
        acciones.push({
          texto: 'Listo',
          estado: 'LISTO',
          color: 'bg-green-500 hover:bg-green-600',
          icono: '🍽️'
        });
        acciones.push({
          texto: 'Anular',
          estado: 'CANCELADO',
          color: 'bg-red-500 hover:bg-red-600',
          icono: '❌'
        });
        break;

      case 'LISTO':
        if (pedido.tipoEnvio === 'DELIVERY') {
          acciones.push({
            texto: 'Delivery',
            estado: 'ENTREGADO',
            color: 'bg-purple-500 hover:bg-purple-600',
            icono: '🚚'
          });
        } else {
          acciones.push({
            texto: 'Entregar',
            estado: 'ENTREGADO',
            color: 'bg-green-500 hover:bg-green-600',
            icono: '📦'
          });
        }
        break;
    }

    return acciones;
  };

  const handleVerDetalle = (pedido: PedidoResponseDTO) => {
    setSelectedPedido(pedido);
    setModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha/Hora
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entrega
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pedidos.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  No hay pedidos para mostrar
                </td>
              </tr>
            ) : (
              pedidos.map((pedido) => {
                const fechaHora = formatearFechaHora(pedido.fecha);
                const acciones = getAccionesDisponibles(pedido);
                const isProcessing = processingId === pedido.idPedido;

                return (
                  <tr key={pedido.idPedido} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        #{pedido.idPedido}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{fechaHora.fecha}</div>
                      <div className="text-sm text-gray-500">{fechaHora.hora}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {pedido.nombreCliente} {pedido.apellidoCliente}
                      </div>
                      <div className="text-sm text-gray-500">{pedido.telefonoCliente}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        pedido.tipoEnvio === 'DELIVERY' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {pedido.tipoEnvio === 'DELIVERY' ? '🚚 Delivery' : '📦 Take Away'}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatearPrecio(pedido.total)}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getEstadoStyle(pedido.estado)}>
                        {PedidoService.formatearEstado(pedido.estado).icono}{' '}
                        {PedidoService.formatearEstado(pedido.estado).texto}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleVerDetalle(pedido)}
                        className="text-blue-600 hover:text-blue-900 px-3 py-1 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        Ver detalle
                      </button>

                      {acciones.map((accion, index) => (
                        <button
                          key={index}
                          onClick={() => handleCambiarEstado(pedido, accion.estado)}
                          disabled={isProcessing}
                          className={`text-white px-3 py-1 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${accion.color}`}
                        >
                          {isProcessing ? (
                            <span className="animate-spin">⏳</span>
                          ) : (
                            <>
                              {accion.icono} {accion.texto}
                            </>
                          )}
                        </button>
                      ))}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <PedidoDetalleModal
        pedido={selectedPedido}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedPedido(null);
        }}
      />
    </>
  );
};