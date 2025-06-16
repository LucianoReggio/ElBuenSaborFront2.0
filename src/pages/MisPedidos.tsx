// src/pages/MisPedidos.tsx
import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Phone, Package, Truck, Store, ChevronDown, ChevronUp } from 'lucide-react';
import { PedidoService } from '../services/PedidoServices';
import { useAuth } from '../hooks/useAuth';
import type { PedidoResponseDTO } from '../types/pedidos/PedidoResponseDTO';

const pedidoService = new PedidoService();

const MisPedidos: React.FC = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<PedidoResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);

  useEffect(() => {
    console.log('🔍 User object:', user);
  console.log('🔍 User ID:', user?.userId);
  console.log('🔍 Is authenticated:', !!user?.userId);
    if (user?.userId) {
      cargarPedidos();
    }
  }, [user]);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.userId) {
        setError('Usuario no autenticado');
        return;
      }

      const pedidosUsuario = await pedidoService.getPedidosByCliente(user.userId);
        console.log('✅ Pedidos recibidos:', pedidosUsuario);
    console.log('📊 Cantidad de pedidos:', pedidosUsuario.length);
      setPedidos(pedidosUsuario);
      console.log('📋 Pedidos cargados:', pedidosUsuario.length);
    } catch (err) {

      console.error('❌ Error al cargar pedidos:', err);
      setError('Error al cargar los pedidos. Por favor, intenta de nuevo.');
    } finally {
        console.log('🏁 Terminando carga, setLoading(false)');
      setLoading(false);
    }
  };

  const toggleExpandir = (idPedido: number) => {
    setPedidoExpandido(pedidoExpandido === idPedido ? null : idPedido);
  };

  const getEstadoConfig = (estado: string) => {
    const estados = {
      'PENDIENTE': { 
        texto: 'Pendiente', 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icono: '⏳',
        descripcion: 'Tu pedido está siendo procesado'
      },
      'PREPARACION': { 
        texto: 'En Preparación', 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icono: '👨‍🍳',
        descripcion: 'Nuestros chefs están preparando tu pedido'
      },
      'ENTREGADO': { 
        texto: 'Entregado', 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icono: '✅',
        descripcion: 'Tu pedido ha sido entregado'
      },
      'CANCELADO': { 
        texto: 'Cancelado', 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icono: '❌',
        descripcion: 'El pedido fue cancelado'
      },
      'RECHAZADO': { 
        texto: 'Rechazado', 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icono: '🚫',
        descripcion: 'El pedido fue rechazado'
      }
    };
    
    return estados[estado as keyof typeof estados] || { 
      texto: estado, 
      color: 'bg-gray-100 text-gray-800 border-gray-200', 
      icono: '❓',
      descripcion: 'Estado desconocido'
    };
  };

  const formatearFecha = (fecha: string) => {
    const fechaObj = new Date(fecha);
    return {
      fecha: fechaObj.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      hora: fechaObj.toLocaleTimeString('es-AR', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-4">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error al cargar pedidos</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={cargarPedidos}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Pedidos</h1>
        <p className="text-gray-600">
          {pedidos.length > 0 
            ? `Tienes ${pedidos.length} pedido${pedidos.length !== 1 ? 's' : ''}`
            : 'Aún no has realizado ningún pedido'
          }
        </p>
      </div>

      {pedidos.length === 0 ? (
        // Sin pedidos
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 mb-2">No tienes pedidos aún</h3>
          <p className="text-gray-400 mb-6">¡Haz tu primer pedido y aparecerá aquí!</p>
          <button
            onClick={() => window.location.href = '/catalogo'}
            className="px-6 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-colors duration-200"
          >
            Ver Catálogo
          </button>
        </div>
      ) : (
        // Lista de pedidos
        <div className="space-y-6">
          {pedidos.map((pedido) => {
            const estadoConfig = getEstadoConfig(pedido.estado);
            const fechaFormateada = formatearFecha(pedido.fecha);
            const expandido = pedidoExpandido === pedido.idPedido;

            return (
              <div key={pedido.idPedido} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                
                {/* Header del pedido */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">
                        Pedido #{pedido.idPedido}
                      </h3>
                      <p className="text-gray-500">
                        {fechaFormateada.fecha} a las {fechaFormateada.hora}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${estadoConfig.color} mb-2`}>
                        <span className="mr-2">{estadoConfig.icono}</span>
                        {estadoConfig.texto}
                      </div>
                      <p className="text-2xl font-bold text-[#CD6C50]">
                        ${pedido.total.toFixed(0)}
                      </p>
                    </div>
                  </div>

                  {/* Info básica */}
                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      {pedido.tipoEnvio === 'DELIVERY' ? (
                        <Truck className="w-5 h-5 text-[#CD6C50]" />
                      ) : (
                        <Store className="w-5 h-5 text-[#CD6C50]" />
                      )}
                      <span className="text-gray-700">
                        {pedido.tipoEnvio === 'DELIVERY' ? 'Delivery' : 'Retiro en local'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-[#CD6C50]" />
                      <span className="text-gray-700">
                        {pedido.tiempoEstimadoTotal} min estimados
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Package className="w-5 h-5 text-[#CD6C50]" />
                      <span className="text-gray-700">
                        {pedido.detalles.length} producto{pedido.detalles.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Estado descripción */}
                  <p className="text-sm text-gray-600 mb-4">{estadoConfig.descripcion}</p>

                  {/* Botón expandir */}
                  <button
                    onClick={() => toggleExpandir(pedido.idPedido)}
                    className="flex items-center space-x-2 text-[#CD6C50] hover:text-[#b85a42] transition-colors duration-200"
                  >
                    <span>{expandido ? 'Ocultar detalles' : 'Ver detalles'}</span>
                    {expandido ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Detalles expandidos */}
                {expandido && (
                  <div className="p-6 bg-gray-50">
                    
                    {/* Productos */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-4">Productos</h4>
                      <div className="space-y-3">
                        {pedido.detalles.map((detalle) => (
                          <div key={detalle.idDetallePedido} className="flex justify-between items-center bg-white rounded-lg p-4">
                            <div>
                              <span className="font-medium text-gray-800">{detalle.denominacionArticulo}</span>
                              <span className="text-gray-500 ml-2">x{detalle.cantidad}</span>
                              {detalle.tiempoPreparacion > 0 && (
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {detalle.tiempoPreparacion} min
                                </div>
                              )}
                            </div>
                            <span className="font-semibold text-gray-800">
                              ${detalle.subtotal.toFixed(0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Domicilio si es delivery */}
                    {pedido.tipoEnvio === 'DELIVERY' && pedido.domicilio && (
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2">Dirección de entrega</h4>
                        <div className="bg-white rounded-lg p-4 flex items-start space-x-3">
                          <MapPin className="w-5 h-5 text-[#CD6C50] mt-0.5" />
                          <div>
                            <p className="text-gray-800">
                              {pedido.domicilio.calle} {pedido.domicilio.numero}
                            </p>
                            <p className="text-gray-600">
                              {pedido.domicilio.localidad} - CP {pedido.domicilio.cp}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Información de contacto */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Información de contacto</h4>
                      <div className="bg-white rounded-lg p-4">
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5 text-[#CD6C50]" />
                          <span className="text-gray-700">{pedido.telefonoCliente}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MisPedidos;