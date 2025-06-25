// src/components/cart/CarritoModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, Clock, Truck, Store } from 'lucide-react';
import { useCarritoContext } from '../../context/CarritoContext';
import CheckoutModal from './CheckoutModal';

interface CarritoModalProps {
  abierto: boolean;
  onCerrar: () => void;
  items: CarritoItem[];
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
    <div className="fixed inset-0  bg-opacity-30 z-50 flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#CD6C50]">Carrito de Compras</h2>
          <button
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold"
            onClick={onCerrar}
            title="Cerrar"
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">¡El carrito está vacío!</p>
          ) : (
            <ul className="divide-y">
              {items.map((item) => (
                <li key={item.id} className="py-4 flex justify-between items-center">
                  <div>
                    <span className="font-semibold">{item.nombre}</span>
                    <span className="text-sm text-gray-400 ml-2">x{item.cantidad}</span>
                  </div>
                  <div className="font-semibold text-[#CD6C50]">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </div>
                </li>
              ))}
            </ul>
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
    </div>
  );
};

export default CarritoModal;
