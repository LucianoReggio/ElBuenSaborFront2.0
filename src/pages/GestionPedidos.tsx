import React, { useState } from 'react';
import { usePedidosGestion, type EstadoFiltro } from '../hooks/usePedidosGestion';
import { PedidosGestionTable } from '../components/cajero/PedidoGestionTable';

const ESTADOS_FILTRO: { value: EstadoFiltro; label: string; color: string }[] = [
  { value: 'TODOS', label: 'Todos', color: 'bg-gray-100 text-gray-800' },
  { value: 'PENDIENTE', label: 'A Confirmar', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'PREPARACION', label: 'En Cocina', color: 'bg-blue-100 text-blue-800' },
  { value: 'LISTO', label: 'Listos', color: 'bg-green-100 text-green-800' },
  { value: 'ENTREGADO', label: 'Entregados', color: 'bg-green-100 text-green-800' },
  { value: 'CANCELADO', label: 'Cancelados', color: 'bg-red-100 text-red-800' }
];

export const GestionPedidos: React.FC = () => {
  const {
    pedidos,
    loading,
    error,
    filtroEstado,
    busquedaCodigo,
    setFiltroEstado,
    setBusquedaCodigo,
    refreshPedidos,
    cambiarEstadoPedido,
    pedidosFiltrados
  } = usePedidosGestion();

  const [showMore, setShowMore] = useState(false);
  const ITEMS_PER_PAGE = 20;

  // Paginación simple
  const pedidosAMostrar = showMore 
    ? pedidosFiltrados 
    : pedidosFiltrados.slice(0, ITEMS_PER_PAGE);

  const handleRefresh = async () => {
    try {
      await refreshPedidos();
    } catch (error) {
      console.error('Error al refrescar:', error);
    }
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestión de Pedidos
            </h1>
            <p className="mt-2 text-gray-600">
              Administra y controla el estado de todos los pedidos
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span className={`mr-2 ${loading ? 'animate-spin' : ''}`}>
              🔄
            </span>
            Actualizar
          </button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
          {ESTADOS_FILTRO.slice(1).map((estado) => {
            const count = pedidos.filter(p => p.estado === estado.value).length;
            return (
              <div key={estado.value} className="bg-white p-4 rounded-lg shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{estado.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${estado.color}`}>
                    {estado.value === 'PENDIENTE' ? '⏳' :
                     estado.value === 'PREPARACION' ? '👨‍🍳' :
                     estado.value === 'LISTO' ? '🍽️' :
                     estado.value === 'ENTREGADO' ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Búsqueda por código */}
          <div>
            <label htmlFor="busqueda" className="block text-sm font-medium text-gray-700 mb-2">
              Buscar por código de pedido
            </label>
            <div className="relative">
              <input
                type="text"
                id="busqueda"
                placeholder="Ej: 123"
                value={busquedaCodigo}
                onChange={(e) => setBusquedaCodigo(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">🔍</span>
              </div>
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <label htmlFor="filtro-estado" className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado
            </label>
            <select
              id="filtro-estado"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoFiltro)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {ESTADOS_FILTRO.map((estado) => (
                <option key={estado.value} value={estado.value}>
                  {estado.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Información de resultados */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-600">
          <span>
            Mostrando {pedidosAMostrar.length} de {pedidosFiltrados.length} pedidos
            {filtroEstado !== 'TODOS' && ` (filtrado por: ${ESTADOS_FILTRO.find(e => e.value === filtroEstado)?.label})`}
            {busquedaCodigo && ` (búsqueda: "${busquedaCodigo}")`}
          </span>
          {busquedaCodigo || filtroEstado !== 'TODOS' ? (
            <button
              onClick={() => {
                setBusquedaCodigo('');
                setFiltroEstado('TODOS');
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          ) : null}
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">❌</span>
            <span className="text-red-700">{error}</span>
            <button
              onClick={handleRefresh}
              className="ml-auto text-red-600 hover:text-red-800 underline"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Tabla de pedidos */}
      <PedidosGestionTable
        pedidos={pedidosAMostrar}
        loading={loading}
        onCambiarEstado={cambiarEstadoPedido}
      />

      {/* Botón "Ver más" */}
      {pedidosFiltrados.length > ITEMS_PER_PAGE && !showMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowMore(true)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Ver más pedidos ({pedidosFiltrados.length - ITEMS_PER_PAGE} restantes)
          </button>
        </div>
      )}

      {/* Botón "Ver menos" */}
      {showMore && pedidosFiltrados.length > ITEMS_PER_PAGE && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowMore(false)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Ver menos
          </button>
        </div>
      )}

      {/* Footer con información adicional */}
      <div className="mt-8 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Estados disponibles:</h4>
            <ul className="space-y-1">
              <li>⏳ <strong>Pendiente:</strong> Esperando confirmación</li>
              <li>👨‍🍳 <strong>En Preparación:</strong> Siendo cocinado</li>
              <li>🍽️ <strong>Listo:</strong> Preparado para entrega/retiro</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Acciones disponibles:</h4>
            <ul className="space-y-1">
              <li>🔍 <strong>Ver detalle:</strong> Información completa</li>
              <li>✅ <strong>Cambiar estado:</strong> Según flujo del pedido</li>
              <li>❌ <strong>Anular:</strong> Cancelar pedido (si no está entregado)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Tipos de entrega:</h4>
            <ul className="space-y-1">
              <li>🚚 <strong>Delivery:</strong> Entrega a domicilio</li>
              <li>📦 <strong>Take Away:</strong> Retiro en local</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};