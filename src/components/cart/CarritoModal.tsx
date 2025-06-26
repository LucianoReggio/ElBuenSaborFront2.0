import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, Clock, Truck, Store } from 'lucide-react';
import { useCarritoContext } from '../../context/CarritoContext';
import CheckoutModal from './CheckoutModal';

interface CarritoModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

const CarritoModal: React.FC<CarritoModalProps> = ({ abierto, onCerrar }) => {
  const carrito = useCarritoContext();
  const [observaciones, setObservaciones] = useState('');
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);

  // Sincronizar observaciones con el contexto
  useEffect(() => {
    setObservaciones(carrito.datosEntrega.observaciones || '');
  }, [carrito.datosEntrega.observaciones]);

  if (!abierto) return null;

  const handleFinalizarCompra = () => {
    if (carrito.estaVacio) {
      alert('El carrito está vacío');
      return;
    }
    
    // Asegurar que las observaciones estén guardadas antes de abrir checkout
    carrito.setDatosEntrega({
      ...carrito.datosEntrega,
      observaciones
    });
    
    // Abrir modal de checkout
    setCheckoutAbierto(true);
  };

  // Función para manejar éxito del pedido:
  const handlePedidoExitoso = () => {
    alert('¡Pedido creado exitosamente! Puedes verlo en "Mis Pedidos"');
    onCerrar(); // Cerrar el carrito también
  };

  const handleTipoEnvioChange = (tipoEnvio: 'DELIVERY' | 'TAKE_AWAY') => {
    carrito.setDatosEntrega({
      ...carrito.datosEntrega,
      tipoEnvio,
      observaciones // ← Incluir observaciones actuales
    });
  };

  // Manejar cambio de observaciones y actualizar contexto
  const handleObservacionesChange = (value: string) => {
    setObservaciones(value);
    carrito.setDatosEntrega({
      ...carrito.datosEntrega,
      observaciones: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-1 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6 text-[#CD6C50]" />
            <h2 className="text-2xl font-bold text-gray-800">Mi Carrito</h2>
            {carrito.cantidadTotal > 0 && (
              <span className="bg-[#CD6C50] text-white px-3 py-1 rounded-full text-sm font-semibold">
                {carrito.cantidadTotal} productos
              </span>
            )}
          </div>
          <button
            onClick={onCerrar}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex-1 overflow-y-auto">
          {carrito.estaVacio ? (
            // Carrito vacío
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">Tu carrito está vacío</h3>
              <p className="text-gray-400 mb-6">¡Agrega algunos productos deliciosos!</p>
              <button
                onClick={onCerrar}
                className="px-6 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-colors duration-200"
              >
                Seguir comprando
              </button>
            </div>
          ) : (
            // Lista de productos
            <div className="p-10 space-y-2">
              {carrito.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 bg-gray-50 rounded-lg p-4">
                  
                  {/* Imagen del producto */}
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    {item.imagen ? (
                      <img 
                        src={item.imagen} 
                        alt={item.nombre}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-[#CD6C50] font-bold text-lg">
                        {item.nombre.charAt(0)}
                      </span>
                    )}
                  </div>

                  {/* Información del producto */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800 text-lg">{item.nombre}</h4>
                    <p className="text-[#CD6C50] font-bold text-lg">${item.precio.toFixed(0)}</p>
                    {item.tiempoPreparacion && (
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="w-4 h-4 mr-1" />
                        {item.tiempoPreparacion} min
                      </div>
                    )}
                  </div>

                  {/* Controles de cantidad */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => carrito.decrementarCantidad(item.id)}
                      className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors duration-200"
                    >
                      <Minus className="w-4 h-4 text-gray-600" />
                    </button>
                    
                    <span className="font-semibold text-lg min-w-[2rem] text-center">
                      {item.cantidad}
                    </span>
                    
                    <button
                      onClick={() => carrito.incrementarCantidad(item.id)}
                      className="w-8 h-8 rounded-full bg-[#CD6C50] hover:bg-[#b85a42] text-white flex items-center justify-center transition-colors duration-200"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Subtotal y eliminar */}
                  <div className="flex flex-col items-end space-y-2">
                    <span className="font-bold text-lg text-gray-800">
                      ${(item.precio * item.cantidad).toFixed(0)}
                    </span>
                    <button
                      onClick={() => carrito.removerItem(item.id)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                      title="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Solo si hay productos */}
        {!carrito.estaVacio && (
          <div className="border-t border-gray-200 p-3 bg-gray-50">
            
            {/* Tipo de envío */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Tipo de entrega</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleTipoEnvioChange('TAKE_AWAY')}
                  className={`p-1 rounded-lg border-2 transition-all duration-200 ${
                    carrito.datosEntrega.tipoEnvio === 'TAKE_AWAY'
                      ? 'border-[#CD6C50] bg-[#CD6C50] bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store className="w-4 h- mx-auto mb-2 text-[#CD6C50]" />
                  <div className="text-sm font-medium">Retiro en local</div>
                  <div className="text-xs text-gray-500">Gratis</div>
                </button>
                
                <button
                  onClick={() => handleTipoEnvioChange('DELIVERY')}
                  className={`p-2 rounded-lg border-2 transition-all duration-200 ${
                    carrito.datosEntrega.tipoEnvio === 'DELIVERY'
                      ? 'border-[#CD6C50] bg-[#CD6C50] bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Truck className="w-6 h-6 mx-auto mb-2 text-[#CD6C50]" />
                  <div className="text-sm font-medium">Delivery</div>
                  <div className="text-xs text-gray-500">$200</div>
                </button>
              </div>
            </div>

            {/* Observaciones */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones (opcional)
              </label>
              <textarea
                value={observaciones}
                onChange={(e) => handleObservacionesChange(e.target.value)}
                placeholder="Ej: Sin cebolla, extra queso..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent resize-none"
                rows={2}
              />
              {/* Debug - Remover en producción */}
              {observaciones && (
                <p className="text-xs text-gray-500 mt-1">
                  ✓ Observaciones guardadas: "{observaciones}"
                </p>
              )}
            </div>

            {/* Resumen de totales */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${carrito.subtotal.toFixed(0)}</span>
              </div>
              {carrito.costoEnvio > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>${carrito.costoEnvio.toFixed(0)}</span>
                </div>
              )}
              {carrito.tiempoEstimadoTotal > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Tiempo estimado</span>
                  <span>{carrito.tiempoEstimadoTotal} min</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between text-xl font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-[#CD6C50]">${carrito.total.toFixed(0)}</span>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex space-x-3">
              <button
                onClick={onCerrar}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Seguir comprando
              </button>
              <button
                onClick={handleFinalizarCompra}
                className="flex-1 px-6 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-colors duration-200 font-medium"
              >
                Finalizar compra
              </button>
            </div>
          </div>
        )}
      </div>
      <CheckoutModal
        abierto={checkoutAbierto}
        onCerrar={() => setCheckoutAbierto(false)}
        onExito={handlePedidoExitoso}
      />
    </div>
  );
};

export default CarritoModal;