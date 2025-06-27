import React, { useState } from 'react';
import { useCocina } from '../../hooks/useCocina';
import { PedidoService } from '../../services/PedidoServices';
import type { PedidoResponseDTO, DetallePedidoResponseDTO } from '../../types/pedidos';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Alert } from '../common/Alert';
import { PedidoDetalleCocinaModal } from '../cocina/PedidoDetalleCocinaModal';
import { RecetaModal } from '../cocina/RecetaModal';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../hooks/useAuth';
import NavbarCocinero from '../layout/navbar/NavbarCocinero';

// Tipo para el usuario transformado
interface TransformedUser {
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  imagen?: {
    url: string;
    denominacion: string;
  };
}

// Componente para una tarjeta de pedido individual
interface PedidoCardProps {
  pedido: PedidoResponseDTO;
  onSiguienteEstado: (id: number, estadoActual: string) => void;
  onExtenderTiempo: (id: number) => void;
  onVerDetalle: (pedido: PedidoResponseDTO) => void;
  loading?: boolean;
}

const PedidoCard: React.FC<PedidoCardProps> = ({ 
  pedido, 
  onSiguienteEstado, 
  onExtenderTiempo, 
  onVerDetalle,
  loading = false 
}) => {
  const [procesando, setProcesando] = useState(false);
  
  const handleSiguienteEstado = async () => {
    setProcesando(true);
    try {
      await onSiguienteEstado(pedido.idPedido, pedido.estado);
    } finally {
      setProcesando(false);
    }
  };

  const handleExtenderTiempo = () => {
    onExtenderTiempo(pedido.idPedido);
  };

  // Formatear tiempos
  const { fecha, hora, horaEstimada } = PedidoService.formatearTiempos(
    pedido.fecha, 
    pedido.horaEstimadaFinalizacion
  );

  // Calcular si está retrasado (solo para pedidos en preparación)
  const ahora = new Date();
  const horaEstimadaDate = new Date();
  const [horas, minutos] = pedido.horaEstimadaFinalizacion.split(':').map(Number);
  horaEstimadaDate.setHours(horas, minutos, 0, 0);
  const estaRetrasado = pedido.estado === 'PREPARACION' && ahora > horaEstimadaDate;

  // Obtener botón según estado
  const getBotonSiguiente = () => {
    switch (pedido.estado) {
      case 'PENDIENTE':
        return 'Iniciar Preparación';
      case 'PREPARACION':
        return 'Marcar Listo';
      default:
        return null;
    }
  };

  const botonTexto = getBotonSiguiente();

  return (
    <div className={`bg-white rounded-lg shadow-md border-l-4 p-4 mb-3 transition-all hover:shadow-lg ${
      estaRetrasado ? 'border-l-red-500 bg-red-50' : 
      pedido.estado === 'PENDIENTE' ? 'border-l-yellow-500' :
      pedido.estado === 'PREPARACION' ? 'border-l-blue-500' : 'border-l-green-500'
    }`}>
      {/* Header con número de pedido */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800">
            Pedido #{pedido.idPedido}
          </h3>
          <p className="text-sm text-gray-600">
            {pedido.nombreCliente} {pedido.apellidoCliente}
          </p>
          <p className="text-xs text-gray-500">
            {pedido.tipoEnvio === 'DELIVERY' ? '🚚 Delivery' : '📦 Take Away'}
          </p>
        </div>
        {estaRetrasado && (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
            ⚠️ Retrasado
          </span>
        )}
      </div>

      {/* Productos resumidos */}
      <div className="mb-3">
        <p className="text-sm font-medium text-gray-700 mb-1">Productos:</p>
        <div className="text-sm text-gray-600">
          {pedido.detalles.slice(0, 2).map((detalle, index) => (
            <div key={detalle.idDetallePedido} className="flex justify-between">
              <span>{detalle.cantidad}x {detalle.denominacionArticulo}</span>
            </div>
          ))}
          {pedido.detalles.length > 2 && (
            <p className="text-xs text-gray-500 italic">
              +{pedido.detalles.length - 2} productos más...
            </p>
          )}
        </div>
      </div>

      {/* Información de tiempo */}
      <div className="mb-3 p-2 bg-gray-50 rounded">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tiempo estimado:</span>
          <span className={`font-medium ${estaRetrasado ? 'text-red-600' : 'text-gray-800'}`}>
            {horaEstimada}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total:</span>
          <span className="font-medium text-gray-800">{pedido.tiempoEstimadoTotal} min</span>
        </div>
      </div>

      {/* Observaciones si las hay */}
      {pedido.observaciones && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs font-medium text-yellow-800">Observaciones:</p>
          <p className="text-sm text-yellow-700">{pedido.observaciones}</p>
        </div>
      )}

      {/* Botones de acción */}
      <div className="flex gap-2">
        {/* Botón ver detalle - siempre disponible para pedidos en preparación */}
        {pedido.estado === 'PREPARACION' && (
          <button
            onClick={() => onVerDetalle(pedido)}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm py-2 px-3 rounded-md font-medium transition-colors"
          >
            Ver Detalle
          </button>
        )}

        {/* Botón +10 min - solo para pedidos en preparación */}
        {pedido.estado === 'PREPARACION' && (
          <button
            onClick={handleExtenderTiempo}
            className="bg-orange-100 hover:bg-orange-200 text-orange-800 text-sm py-2 px-3 rounded-md font-medium transition-colors"
            disabled={procesando}
          >
            +10 min
          </button>
        )}

        {/* Botón siguiente estado */}
        {botonTexto && (
          <button
            onClick={handleSiguienteEstado}
            disabled={procesando || loading}
            className={`flex-1 text-white text-sm py-2 px-3 rounded-md font-medium transition-colors disabled:opacity-50 ${
              pedido.estado === 'PENDIENTE' 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {procesando ? 'Procesando...' : botonTexto}
          </button>
        )}
      </div>
    </div>
  );
};

// Componente para una columna del Kanban
interface ColumnaKanbanProps {
  titulo: string;
  pedidos: PedidoResponseDTO[];
  color: string;
  onSiguienteEstado: (id: number, estadoActual: string) => void;
  onExtenderTiempo: (id: number) => void;
  onVerDetalle: (pedido: PedidoResponseDTO) => void;
  loading?: boolean;
}

const ColumnaKanban: React.FC<ColumnaKanbanProps> = ({
  titulo,
  pedidos,
  color,
  onSiguienteEstado,
  onExtenderTiempo,
  onVerDetalle,
  loading = false
}) => {
  return (
    <div className="flex-1 min-w-80">
      {/* Header de la columna */}
      <div className={`${color} text-white p-3 rounded-t-lg`}>
        <h2 className="font-bold text-lg text-center">
          {titulo}
        </h2>
        <p className="text-center text-sm opacity-90">
          {pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Contenido de la columna */}
      <div className="bg-gray-100 min-h-96 p-3 rounded-b-lg">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <LoadingSpinner />
          </div>
        ) : pedidos.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">No hay pedidos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <PedidoCard
                key={pedido.idPedido}
                pedido={pedido}
                onSiguienteEstado={onSiguienteEstado}
                onExtenderTiempo={onExtenderTiempo}
                onVerDetalle={onVerDetalle}
                loading={loading}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal del Dashboard
export const CocinaDashboard: React.FC = () => {
  const { logout } = useAuth0();
  const { user } = useAuth();
  
  const {
    pedidosPendientes,
    pedidosEnPreparacion,
    pedidosListos,
    loading,
    error,
    refreshPedidos,
    moverPedidoASiguienteEstado,
    extenderTiempo,
    totalPedidos,
    pedidoSeleccionado,
    setPedidoSeleccionado
  } = useCocina();

  const [refreshing, setRefreshing] = useState(false);
  const [showDetalleModal, setShowDetalleModal] = useState(false);
  const [showRecetaModal, setShowRecetaModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<DetallePedidoResponseDTO | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Función para transformar el usuario al formato esperado por NavbarCocinero
  const transformarUsuario = (usuario: any): TransformedUser | undefined => {
    if (!usuario) return undefined;
    
    try {
      // Si es un usuario de Auth0 con información básica
      if (usuario.name || usuario.email) {
        return {
          nombre: usuario.given_name || usuario.name?.split(' ')[0] || 'Usuario',
          apellido: usuario.family_name || usuario.name?.split(' ').slice(1).join(' ') || '',
          email: usuario.email || '',
          rol: usuario.usuario?.rol || usuario.rol || 'COCINERO',
          imagen: usuario.picture ? {
            url: usuario.picture,
            denominacion: 'Avatar'
          } : undefined
        };
      }
      
      // Si viene del backend con estructura anidada (usuario.usuario)
      if (usuario.usuario) {
        return {
          nombre: usuario.usuario.nombre || usuario.nombre || 'Usuario',
          apellido: usuario.usuario.apellido || usuario.apellido || '',
          email: usuario.usuario.email || usuario.email || '',
          rol: usuario.usuario.rol || usuario.rol || 'COCINERO',
          imagen: usuario.usuario.imagen || usuario.imagen
        };
      }
      
      // Si ya tiene la estructura directa
      return {
        nombre: usuario.nombre || 'Usuario',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        rol: usuario.rol || 'COCINERO',
        imagen: usuario.imagen
      };
    } catch (error) {
      console.error('Error transformando usuario:', error);
      // Fallback seguro
      return {
        nombre: 'Usuario',
        apellido: '',
        email: '',
        rol: 'COCINERO'
      };
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshPedidos();
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al actualizar pedidos:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    logout({ 
      logoutParams: { 
        returnTo: window.location.origin 
      } 
    });
  };

  const handleExtenderTiempo = async (id: number) => {
    try {
      await extenderTiempo(id, 10); // Extender 10 minutos
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al extender tiempo:', error);
    }
  };

  const handleVerDetalle = (pedido: PedidoResponseDTO) => {
    setPedidoSeleccionado(pedido);
    setShowDetalleModal(true);
  };

  const handleCerrarDetalle = () => {
    setShowDetalleModal(false);
    setPedidoSeleccionado(null);
  };

  const handleVerReceta = (producto: DetallePedidoResponseDTO) => {
    setProductoSeleccionado(producto);
    setShowRecetaModal(true);
  };

  const handleCerrarReceta = () => {
    setShowRecetaModal(false);
    setProductoSeleccionado(null);
  };

  const handleMarcarListo = async (id: number) => {
    try {
      await moverPedidoASiguienteEstado(id, 'PREPARACION');
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al marcar como listo:', error);
      throw error;
    }
  };

  const handleSiguienteEstado = async (id: number, estadoActual: string) => {
    try {
      await moverPedidoASiguienteEstado(id, estadoActual);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar específico de cocina */}
      <NavbarCocinero
        user={transformarUsuario(user)}
        onLogout={handleLogout}
        totalPedidos={totalPedidos}
        pedidosPendientes={pedidosPendientes.length}
        pedidosEnPreparacion={pedidosEnPreparacion.length}
        onRefresh={handleRefresh}
        isRefreshing={refreshing || loading}
        lastUpdate={lastUpdate}
      />

      {/* Contenido principal */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                👨‍🍳 Dashboard de Cocina
              </h1>
              <p className="text-gray-600 mt-1">
                Gestión de pedidos • {totalPedidos} pedidos activos
              </p>
            </div>
          </div>

          {/* Indicadores de estado */}
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-center">
              <p className="text-yellow-800 font-bold text-xl">{pedidosPendientes.length}</p>
              <p className="text-yellow-700 text-sm">Pendientes</p>
            </div>
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center">
              <p className="text-blue-800 font-bold text-xl">{pedidosEnPreparacion.length}</p>
              <p className="text-blue-700 text-sm">En Preparación</p>
            </div>
            <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-center">
              <p className="text-green-800 font-bold text-xl">{pedidosListos.length}</p>
              <p className="text-green-700 text-sm">Listos</p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert
            type="error"
            message={error}
            className="mb-4"
          />
        )}

        {/* Kanban Board */}
        <div className="flex gap-6 overflow-x-auto pb-4">
          <ColumnaKanban
            titulo="⏳ Pendiente"
            pedidos={pedidosPendientes}
            color="bg-yellow-600"
            onSiguienteEstado={handleSiguienteEstado}
            onExtenderTiempo={handleExtenderTiempo}
            onVerDetalle={handleVerDetalle}
            loading={loading}
          />
          
          <ColumnaKanban
            titulo="👨‍🍳 En Preparación"
            pedidos={pedidosEnPreparacion}
            color="bg-blue-600"
            onSiguienteEstado={handleSiguienteEstado}
            onExtenderTiempo={handleExtenderTiempo}
            onVerDetalle={handleVerDetalle}
            loading={loading}
          />
          
          <ColumnaKanban
            titulo="🍽️ Listo"
            pedidos={pedidosListos}
            color="bg-green-600"
            onSiguienteEstado={handleSiguienteEstado}
            onExtenderTiempo={handleExtenderTiempo}
            onVerDetalle={handleVerDetalle}
            loading={loading}
          />
        </div>

        {/* Modales */}
        <PedidoDetalleCocinaModal
          pedido={pedidoSeleccionado}
          isOpen={showDetalleModal}
          onClose={handleCerrarDetalle}
          onMarcarListo={handleMarcarListo}
          onVerReceta={handleVerReceta}
        />

        <RecetaModal
          producto={productoSeleccionado}
          isOpen={showRecetaModal}
          onClose={handleCerrarReceta}
        />
      </div>
    </div>
  );
};