import React, { useState, useEffect } from 'react';
import {
  X, Plus, Minus, Trash2, ShoppingCart, Clock, Truck, Store, Tag, Calculator,
  Gift, Percent, DollarSign, Zap, ChevronDown, Star, Flame
} from 'lucide-react';
import { useCarritoMercadoPago } from '../../hooks/useCarritoMercadoPago';
import CheckoutModalMercadoPago from './CheckoutModalMercadoPago';
import { PromocionSelector } from '../promociones/PromocionSelector';
import type { PromocionResponseDTO } from '../../types/promociones';
import type { PromocionCompletaDTO } from '../../types/promociones';

interface CarritoModalProps {
  abierto: boolean;
  onCerrar: () => void;
}

interface ItemCarritoProps {
  item: any;
  carrito: any;
}

const ItemCarritoConPromociones: React.FC<ItemCarritoProps> = ({ item, carrito }) => {
  console.log('🔍 ItemCarritoConPromociones - Estado DETALLADO:', {
    itemId: item.id,
    itemNombre: item.nombre,
    tienePromocionAgrupada: carrito.tienePromocionAgrupada,
    promocionAgrupada: carrito.promocionAgrupada,
    promocionAgrupadaNombre: carrito.promocionAgrupada?.denominacion || 'No hay',
    descuentoPromocionAgrupada: carrito.getDescuentoPromocionAgrupada()
  });

  const [expandido, setExpandido] = useState(false);
  const [cargandoPromociones, setCargandoPromociones] = useState(false);

  const promocionesDisponibles = carrito.getPromocionesDisponibles(item.id);
  const tienePromocion = carrito.itemTienePromocion(item.id);
  const infoPromocion = carrito.getInfoPromocionItem(item.id);

  useEffect(() => {
    console.log('🛒 CarritoModal - Estado actual:', {
      tipoEnvio: carrito.datosEntrega.tipoEnvio,
      subtotal: carrito.subtotal,
      tieneDescuentoRetiro: carrito.tieneDescuentoRetiro,
      descuentoRetiro: carrito.descuentoRetiro,
      total: carrito.total
    });
  }, [carrito.datosEntrega.tipoEnvio, carrito.subtotal, carrito.tieneDescuentoRetiro, carrito.descuentoRetiro, carrito.total]);

  useEffect(() => {
    if (promocionesDisponibles.length === 0 && !cargandoPromociones) {
      setCargandoPromociones(true);
      carrito.cargarPromocionesParaItem(item.id).finally(() => {
        setCargandoPromociones(false);
      });
    }
  }, [item.id, promocionesDisponibles.length, carrito, cargandoPromociones]);

  const precioUnitarioOriginal = item.precio;
  const precioUnitarioFinal = tienePromocion
    ? (() => {
      const promocionSeleccionada = promocionesDisponibles.find((p: PromocionResponseDTO) => p.idPromocion === infoPromocion?.id);
      if (!promocionSeleccionada) return precioUnitarioOriginal;

      const descuentoTotal = promocionSeleccionada.tipoDescuento === 'PORCENTUAL'
        ? (precioUnitarioOriginal * item.cantidad * promocionSeleccionada.valorDescuento) / 100
        : Math.min(promocionSeleccionada.valorDescuento * item.cantidad, precioUnitarioOriginal * item.cantidad);

      return precioUnitarioOriginal - (descuentoTotal / item.cantidad);
    })()
    : precioUnitarioOriginal;
  const subtotalOriginal = precioUnitarioOriginal * item.cantidad;
  const subtotalFinal = precioUnitarioFinal * item.cantidad;
  const descuentoItem = subtotalOriginal - subtotalFinal;

  const handleSeleccionarPromocion = async (idPromocion: number | undefined) => {
    await carrito.seleccionarPromocion(item.id, idPromocion);
  };

  // ✅ FORZAR DETECCIÓN DE PROMOCIÓN AGRUPADA
  const esPromocionAgrupada = carrito.tienePromocionAgrupada || carrito.promocionAgrupada || carrito.getDescuentoPromocionAgrupada() > 0;
  
  console.log(`🎮 [DEFINITIVO] Controles para ${item.nombre}:`, {
    tienePromocionAgrupada: carrito.tienePromocionAgrupada,
    promocionAgrupada: carrito.promocionAgrupada?.denominacion,
    descuentoCalculado: carrito.getDescuentoPromocionAgrupada(),
    esPromocionAgrupada,
    deberiaOcultarControles: esPromocionAgrupada
  });

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center flex-shrink-0 relative">
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

          {(tienePromocion || esPromocionAgrupada) && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center">
              <Gift className="w-3 h-3" />
            </div>
          )}
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-gray-800 text-lg">{item.nombre}</h4>

          <div className="flex items-center space-x-2">
            {(tienePromocion || esPromocionAgrupada) ? (
              <>
                <span className="text-sm text-gray-500 line-through">
                  ${precioUnitarioOriginal.toFixed(0)}
                </span>
                <span className="text-[#CD6C50] font-bold text-lg">
                  ${precioUnitarioFinal.toFixed(0)}
                </span>
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                  -{Math.round(((precioUnitarioOriginal - precioUnitarioFinal) / precioUnitarioOriginal) * 100)}%
                </div>
              </>
            ) : (
              <span className="text-[#CD6C50] font-bold text-lg">
                ${precioUnitarioOriginal.toFixed(0)}
              </span>
            )}
          </div>

          {esPromocionAgrupada && (
            <div className="mt-1 text-xs text-red-600 flex items-center">
              <Gift className="w-3 h-3 mr-1" />
              Incluido en: {carrito.promocionAgrupada?.denominacion || 'Promoción especial'}
            </div>
          )}

          {tienePromocion && infoPromocion && !esPromocionAgrupada && (
            <div className="mt-1 text-xs text-green-600 flex items-center">
              <Gift className="w-3 h-3 mr-1" />
              {infoPromocion.nombre} - Ahorras ${descuentoItem.toFixed(0)}
            </div>
          )}

          {item.tiempoPreparacion && (
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Clock className="w-4 h-4 mr-1" />
              {item.tiempoPreparacion} min
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {esPromocionAgrupada ? (
            <div className="flex items-center space-x-2 bg-red-100 p-2 rounded border-2 border-red-200">
              <span className="font-semibold text-lg text-red-700">
                Cantidad: {item.cantidad}
              </span>
              <span className="text-xs text-red-600">
                (Promoción especial)
              </span>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>

        <div className="flex flex-col items-end space-y-2">
          <div className="text-right">
            {(tienePromocion || esPromocionAgrupada) ? (
              <>
                <div className="text-sm text-gray-500 line-through">
                  ${subtotalOriginal.toFixed(0)}
                </div>
                <div className="font-bold text-lg text-gray-800">
                  ${subtotalFinal.toFixed(0)}
                </div>
              </>
            ) : (
              <span className="font-bold text-lg text-gray-800">
                ${(item.precio * item.cantidad).toFixed(0)}
              </span>
            )}
          </div>

          {esPromocionAgrupada ? (
            <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded border border-red-200">
              No editable individualmente
            </div>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => carrito.removerItem(item.id)}
                className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors duration-200"
                title="Eliminar producto"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CarritoModal: React.FC<CarritoModalProps> = ({ abierto, onCerrar }) => {
  const carrito = useCarritoMercadoPago();
  const [observaciones, setObservaciones] = useState('');
  const [checkoutAbierto, setCheckoutAbierto] = useState(false);
  const [pedidoExitoso, setPedidoExitoso] = useState(false);

  useEffect(() => {
    setObservaciones(carrito.datosEntrega.observaciones || '');
  }, [carrito.datosEntrega.observaciones]);

  const estadisticasPromociones = {
    itemsConPromocion: carrito.items.filter(item => carrito.itemTienePromocion(item.id)).length,
    totalDescuentosPromociones: carrito.getTotalDescuentosPromociones(),
    tienePromociones: carrito.tienePromociones()
  };

  // ✅ VARIABLES FORZADAS PARA PROMOCIÓN AGRUPADA
  const promocionAgrupadaActiva = carrito.promocionAgrupada || (carrito.getDescuentoPromocionAgrupada() > 0 ? { denominacion: 'Promoción especial', valorDescuento: 10 } : null);
  const tienePromocionAgrupadaForzada = carrito.tienePromocionAgrupada || carrito.getDescuentoPromocionAgrupada() > 0;
  const descuentoPromocionForzado = carrito.getDescuentoPromocionAgrupada();

  console.log('🛒 CarritoModal - Estado FORZADO:', {
    tienePromocionAgrupada: carrito.tienePromocionAgrupada,
    promocionAgrupada: carrito.promocionAgrupada,
    descuentoCalculado: carrito.getDescuentoPromocionAgrupada(),
    // ✅ NUEVOS VALORES FORZADOS
    promocionAgrupadaActiva,
    tienePromocionAgrupadaForzada,
    descuentoPromocionForzado
  });

  if (!abierto) return null;

  const handleFinalizarCompra = () => {
    if (carrito.estaVacio) {
      alert('El carrito está vacío');
      return;
    }

    carrito.setDatosEntrega({
      ...carrito.datosEntrega,
      observaciones
    });

    setCheckoutAbierto(true);
  };

  const handlePedidoExitoso = (data?: any) => {
    console.log('🎉 Pedido creado exitosamente:', data);
    setPedidoExitoso(true);
    alert('¡Pedido creado exitosamente! Puedes verlo en "Mis Pedidos"');
    setCheckoutAbierto(false);
    onCerrar();
    setTimeout(() => {
      setPedidoExitoso(false);
    }, 3000);
  };

  const handleTipoEnvioChange = (tipoEnvio: 'DELIVERY' | 'TAKE_AWAY') => {
    carrito.setDatosEntrega({
      ...carrito.datosEntrega,
      tipoEnvio,
      observaciones
    });
  };

  const handleObservacionesChange = (value: string) => {
    setObservaciones(value);
    carrito.setDatosEntrega({
      ...carrito.datosEntrega,
      observaciones: value
    });
  };

   return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      {/* ✅ CAMBIO PRINCIPAL: Altura dinámica y mejor manejo del espacio */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col" 
           style={{ 
             height: '90vh', 
             maxHeight: '800px',
             minHeight: '500px' 
           }}>

        {/* Header - FIJO */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#CD6C50] to-[#e07d5f] text-white flex-shrink-0">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="w-6 h-6" />
            <div>
              <h2 className="text-xl font-bold">Mi Carrito</h2>
              <p className="text-orange-100">
                {carrito.cantidadTotal} producto{carrito.cantidadTotal !== 1 ? 's' : ''}
                {tienePromocionAgrupadaForzada && (
                  <span className="ml-2 bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                    🎁 Promoción especial
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onCerrar}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* ✅ ÁREA PRINCIPAL SCROLLEABLE - ocupará el espacio disponible */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: 0 }}>
          {carrito.estaVacio ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
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
            <div className="p-6">

              {/* Banner promoción agrupada */}
              {tienePromocionAgrupadaForzada && promocionAgrupadaActiva && (
                <div className="p-6 border-b border-gray-200 mb-6">
                  <div className="bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                          <Gift className="w-6 h-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-red-800 text-lg">
                            🎁 {promocionAgrupadaActiva.denominacion}
                          </h3>
                          <p className="text-red-600 text-sm">
                            {promocionAgrupadaActiva.valorDescuento}% OFF en todo el paquete
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="text-red-700 text-sm">Ahorras</div>
                          <div className="text-2xl font-bold text-red-800">
                            ${descuentoPromocionForzado.toFixed(0)}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => {
                            console.log('🗑️ Eliminando promoción agrupada completa');
                            carrito.quitarPromocionAgrupada();
                            carrito.limpiarCarrito();
                          }}
                          className="p-3 text-red-500 hover:bg-red-50 rounded-full transition-colors duration-200 border-2 border-red-200"
                          title="Eliminar promoción completa"
                        >
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-red-100 rounded-lg">
                      <div className="text-sm text-red-700">
                        <strong>🛍️ Incluye:</strong> {carrito.items.map(item => item.nombre).join(', ')}
                      </div>
                      <div className="text-xs text-red-600 mt-1">
                        💡 Para modificar cantidades, elimina la promoción y agrega productos individualmente
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de productos */}
              <div className="space-y-4">
                {carrito.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`${tienePromocionAgrupadaForzada 
                      ? 'ring-2 ring-red-200 bg-red-50 rounded-lg' 
                      : ''}`}
                  >
                    <ItemCarritoConPromociones
                      item={item}
                      carrito={carrito}
                    />
                  </div>
                ))}
              </div>

              {/* ✅ AGREGAR ESPACIO AL FINAL para evitar que el último item se corte */}
              <div className="h-6"></div>
            </div>
          )}
        </div>

        {/* ✅ FOOTER FIJO - siempre visible */}
        {!carrito.estaVacio && (
          <div className="border-t border-gray-200 bg-gray-50 flex-shrink-0">
            {/* ✅ CONTENIDO DEL FOOTER CON ALTURA MÁXIMA CONTROLADA */}
            <div className="p-6 max-h-80 overflow-y-auto">

              {/* Tipo de entrega */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-800 mb-3">Tipo de entrega</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleTipoEnvioChange('TAKE_AWAY')}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${carrito.datosEntrega.tipoEnvio === 'TAKE_AWAY'
                      ? 'border-[#CD6C50] bg-[#CD6C50] bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Store className="w-5 h-5 mx-auto mb-2 text-[#CD6C50]" />
                    <div className="text-sm font-medium">Retiro en local</div>
                    <div className="text-xs text-green-600 font-bold">✨ 10% descuento</div>
                  </button>

                  <button
                    onClick={() => handleTipoEnvioChange('DELIVERY')}
                    className={`p-3 rounded-lg border-2 transition-all duration-200 ${carrito.datosEntrega.tipoEnvio === 'DELIVERY'
                      ? 'border-[#CD6C50] bg-[#CD6C50] bg-opacity-10'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <Truck className="w-5 h-5 mx-auto mb-2 text-[#CD6C50]" />
                    <div className="text-sm font-medium">Delivery</div>
                    <div className="text-xs text-gray-500">+$200</div>
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
              </div>

              {/* Resumen de totales */}
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <Calculator className="w-5 h-5 text-[#CD6C50]" />
                  <h3 className="font-semibold text-gray-800">Resumen del pedido</h3>
                  {carrito.cargandoTotales && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#CD6C50]"></div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${carrito.subtotal.toFixed(0)}</span>
                  </div>
                  
                  {descuentoPromocionForzado > 0 && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <span className="flex items-center">
                        <Gift className="w-3 h-3 mr-1" />
                        🎁 {promocionAgrupadaActiva?.denominacion || 'Promoción especial'} ({promocionAgrupadaActiva?.valorDescuento || 10}% OFF)
                      </span>
                      <span>-${descuentoPromocionForzado.toFixed(0)}</span>
                    </div>
                  )}
                  
                  {carrito.tieneDescuentoRetiro && carrito.descuentoRetiro > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center">
                        <Tag className="w-3 h-3 mr-1" />
                        💰 Descuento retiro (10%)
                      </span>
                      <span>-${carrito.descuentoRetiro.toFixed(0)}</span>
                    </div>
                  )}

                  {!tienePromocionAgrupadaForzada && carrito.tienePromociones() && carrito.getTotalDescuentosPromociones() > 0 && (
                    <div className="flex justify-between text-purple-600">
                      <span className="flex items-center">
                        <Gift className="w-3 h-3 mr-1" />
                        Promociones aplicadas
                      </span>
                      <span>-${carrito.getTotalDescuentosPromociones().toFixed(0)}</span>
                    </div>
                  )}

                  {carrito.costoEnvio > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center">
                        <Truck className="w-3 h-3 mr-1" />
                        Envío
                      </span>
                      <span>+${carrito.costoEnvio.toFixed(0)}</span>
                    </div>
                  )}

                  {carrito.tiempoEstimadoTotal > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Tiempo estimado
                      </span>
                      <span>{carrito.tiempoEstimadoTotal} min</span>
                    </div>
                  )}

                  <div className="border-t pt-2">
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span className="text-[#CD6C50]">
                        ${Math.max(0, carrito.subtotal - (descuentoPromocionForzado + carrito.descuentoRetiro) + carrito.costoEnvio).toFixed(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {(carrito.tieneDescuento || tienePromocionAgrupadaForzada) && (
                  <div className="mt-3 space-y-2">
                    {tienePromocionAgrupadaForzada && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-700 text-sm">
                          🎁 <strong>Promoción especial aplicada:</strong> {promocionAgrupadaActiva?.denominacion}
                        </p>
                      </div>
                    )}

                    {carrito.tieneDescuentoRetiro && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm">
                          ✨ 10% descuento por retiro en local
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {carrito.errorTotales && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-orange-700 text-sm">
                      ⚠️ {carrito.errorTotales}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ BOTONES COMPLETAMENTE FIJOS EN LA PARTE INFERIOR */}
            <div className="border-t border-gray-200 p-6 bg-white">
              <div className="flex space-x-3">
                <button
                  onClick={onCerrar}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Seguir comprando
                </button>
                <button
                  onClick={handleFinalizarCompra}
                  className="flex-1 px-6 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-colors duration-200 font-medium relative"
                >
                  Finalizar compra
                  {(tienePromocionAgrupadaForzada || estadisticasPromociones.tienePromociones) && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                      🎁
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <CheckoutModalMercadoPago
        abierto={checkoutAbierto}
        onCerrar={() => setCheckoutAbierto(false)}
        onExito={handlePedidoExitoso}
      />
    </div>
  );
};


export default CarritoModal;