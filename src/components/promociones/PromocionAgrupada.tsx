// ✅ CREAR ARCHIVO: src/components/promociones/PromocionAgrupada.tsx

import React from 'react';
import { Gift, ShoppingCart, Flame } from 'lucide-react';
import type { PromocionCompletaDTO } from '../../types/promociones';

interface PromocionAgrupadaProps {
  promocion: PromocionCompletaDTO;
  onAgregarAlCarrito: (promocion: PromocionCompletaDTO) => void;
  className?: string;
}

export const PromocionAgrupada: React.FC<PromocionAgrupadaProps> = ({
  promocion,
  onAgregarAlCarrito,
  className = ""
}) => {
  // Calcular precio total original y con descuento
  const precioOriginalTotal = promocion.articulos.reduce((sum, art) => sum + art.precioVenta, 0);
  
  const precioConDescuento = promocion.tipoDescuento === 'PORCENTUAL' 
    ? precioOriginalTotal * (1 - promocion.valorDescuento / 100)
    : precioOriginalTotal - promocion.valorDescuento;
  
  const ahorroTotal = precioOriginalTotal - precioConDescuento;

  const textoDescuento = promocion.tipoDescuento === 'PORCENTUAL'
    ? `${promocion.valorDescuento}% OFF`
    : `$${promocion.valorDescuento} OFF`;

  return (
    <div className={`bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-6 text-white shadow-xl overflow-hidden relative ${className}`}>
      
      {/* Efecto de brillo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
      
      {/* Header */}
      <div className="text-center mb-4">
        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold mb-2">
          <Flame className="w-4 h-4 mr-1" />
          ¡OFERTA ESPECIAL!
        </div>
        <h3 className="text-2xl font-bold">{promocion.denominacion}</h3>
        <div className="text-lg font-semibold mt-1 text-yellow-300">
          {textoDescuento}
        </div>
      </div>

      {/* Artículos incluidos */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-4">
        <h4 className="text-sm font-semibold mb-3 flex items-center">
          <Gift className="w-4 h-4 mr-1" />
          Incluye:
        </h4>
        <div className="space-y-2">
          {promocion.articulos.map((articulo, index) => (
            <div key={articulo.idArticulo} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                {articulo.imagenUrl ? (
                  <img
                    src={articulo.imagenUrl}
                    alt={articulo.denominacion}
                    className="w-8 h-8 rounded-lg object-cover mr-2 border border-white/20"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center mr-2 text-xs">
                    {index + 1}
                  </div>
                )}
                <span className="font-medium">{articulo.denominacion}</span>
              </div>
              <span className="text-white/80 line-through text-xs">
                ${articulo.precioVenta.toFixed(0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Precios */}
      <div className="bg-white/15 backdrop-blur-sm rounded-xl p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm opacity-90">Precio original:</span>
          <span className="text-lg line-through opacity-80">
            ${precioOriginalTotal.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="font-bold text-lg">Precio promocional:</span>
          <span className="font-bold text-2xl text-yellow-300">
            ${precioConDescuento.toFixed(0)}
          </span>
        </div>
        <div className="text-center pt-2 border-t border-white/20">
          <span className="text-green-300 font-bold">
            ¡Ahorras ${ahorroTotal.toFixed(0)}!
          </span>
        </div>
      </div>

      {/* Botón de acción */}
      <button
        onClick={() => onAgregarAlCarrito(promocion)}
        className="w-full bg-white text-red-600 font-bold py-3 px-6 rounded-xl hover:bg-yellow-100 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg transform hover:scale-105"
      >
        <ShoppingCart className="w-5 h-5" />
        <span>Agregar Promoción Completa</span>
      </button>

      {/* Descripción adicional */}
      {promocion.descripcionDescuento && (
        <p className="text-center text-xs opacity-80 mt-3">
          {promocion.descripcionDescuento}
        </p>
      )}
    </div>
  );
};

export default PromocionAgrupada;