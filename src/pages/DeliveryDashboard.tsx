// src/pages/DeliveryDashboard.tsx
import { useState, useEffect } from 'react';
import { RefreshCw, Eye, Truck, Phone, MapPin } from 'lucide-react';
import { PedidoService } from '../services/PedidoServices';
import type { PedidoResponseDTO } from '../types/pedidos';
import {LoadingSpinner} from '../components/common/LoadingSpinner';
import PedidoDetalleModal from '../components/delivery/PedidoDetalleModal';

export default function DeliveryDashboard() {
  const [pedidos, setPedidos] = useState<PedidoResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para el modal
  const [selectedPedido, setSelectedPedido] = useState<PedidoResponseDTO | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEntregando, setIsEntregando] = useState(false);

  const pedidoService = new PedidoService();

  // Cargar pedidos listos para entrega
  const cargarPedidos = async () => {
    try {
      setError(null);
      const response = await pedidoService.getPedidosListosParaEntrega();
      setPedidos(response);
    } catch (err) {
      setError('Error al cargar los pedidos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Refrescar pedidos
  const handleRefresh = async () => {
    setRefreshing(true);
    await cargarPedidos();
  };

  // Cargar pedidos al montar el componente
  useEffect(() => {
    cargarPedidos();
  }, []);

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

  // Abrir modal de detalle
  const handleVerDetalle = (pedido: PedidoResponseDTO) => {
    setSelectedPedido(pedido);
    setIsModalOpen(true);
  };

  // Cerrar modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPedido(null);
  };

  // Marcar pedido como entregado
  const handleEntregar = async (idPedido: number) => {
    try {
      setIsEntregando(true);
      await pedidoService.marcarEntregado(idPedido);
      
      // Remover el pedido de la lista
      setPedidos(prev => prev.filter(p => p.idPedido !== idPedido));
      
      // Cerrar el modal
      handleCloseModal();
      
      // Mostrar mensaje de éxito (opcional)
      console.log('✅ Pedido entregado correctamente');
      
    } catch (error) {
      console.error('❌ Error al entregar pedido:', error);
      setError('Error al marcar el pedido como entregado');
    } finally {
      setIsEntregando(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Pedidos a Entregar
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} listo{pedidos.length !== 1 ? 's' : ''} para entrega
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors duration-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {pedidos.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <Truck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay pedidos para entregar
            </h3>
            <p className="text-gray-600">
              Todos los pedidos han sido entregados. ¡Buen trabajo!
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-orange-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pedido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dirección
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Departamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidos.map((pedido) => {
                    const { fecha, hora } = formatearFechaHora(pedido.fecha);
                    return (
                      <tr key={pedido.idPedido} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            #{pedido.idPedido}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{fecha}</div>
                          <div className="text-sm text-gray-500">{hora}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {pedido.nombreCliente} {pedido.apellidoCliente}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs">
                            <div className="flex items-start space-x-1">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span>
                                {pedido.domicilio?.calle} {pedido.domicilio?.numero}
                              </span>
                            </div>
                            {pedido.domicilio?.localidad && (
                              <div className="text-xs text-gray-500 ml-5">
                                {pedido.domicilio.localidad}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {pedido.domicilio?.localidad || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a 
                              href={`tel:${pedido.telefonoCliente}`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              {pedido.telefonoCliente}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleVerDetalle(pedido)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Ver Detalle
                            </button>
                            <button
                              onClick={() => handleEntregar(pedido.idPedido)}
                              disabled={isEntregando}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Entregar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {selectedPedido && (
        <PedidoDetalleModal
          pedido={selectedPedido}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onEntregar={handleEntregar}
          isEntregando={isEntregando}
        />
      )}
    </div>
  );
}