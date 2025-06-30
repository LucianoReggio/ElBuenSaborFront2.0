import React, { useState } from 'react';
import { Tag, ChevronDown, Percent, DollarSign } from 'lucide-react';
import type { PromocionResponseDTO } from '../../types/promociones';

interface PromocionSelectorProps {
  promociones: PromocionResponseDTO[];
  promocionSeleccionada?: number;
  onSeleccionar: (idPromocion: number | undefined) => void;
  precioUnitario: number;
  cantidad: number;
  loading?: boolean;
}

export const PromocionSelector: React.FC<PromocionSelectorProps> = ({
  promociones,
  promocionSeleccionada,
  onSeleccionar,
  precioUnitario,
  cantidad,
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (!promociones || promociones.length === 0) {
    return null;
  }

  const promocionActual = promociones.find(p => p.idPromocion === promocionSeleccionada);

  const calcularDescuentoLocal = (promocion: PromocionResponseDTO): number => {
    const total = precioUnitario * cantidad;
    
    if (promocion.tipoDescuento === 'PORCENTUAL') {
      return total * (promocion.valorDescuento / 100);
    } else {
      return Math.min(promocion.valorDescuento * cantidad, total);
    }
  };

  const formatearDescuento = (promocion: PromocionResponseDTO): string => {
    const descuento = calcularDescuentoLocal(promocion);
    if (promocion.tipoDescuento === 'PORCENTUAL') {
      return `${promocion.valorDescuento}% (-$${descuento.toFixed(0)})`;
    } else {
      return `$${promocion.valorDescuento} (-$${descuento.toFixed(0)})`;
    }
  };

  const getIconoTipo = (tipo: string) => {
    return tipo === 'PORCENTUAL' ? (
      <Percent className="w-3 h-3" />
    ) : (
      <DollarSign className="w-3 h-3" />
    );
  };

  const getColorPromocion = (promocion: PromocionResponseDTO) => {
    if (!promocion.estaVigente) return 'text-gray-400 bg-gray-100';
    if (promocion.tipoDescuento === 'PORCENTUAL') return 'text-blue-600 bg-blue-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="relative">
      {/* Selector Principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full px-3 py-2 text-sm border rounded-lg transition-colors ${
          promocionActual
            ? 'border-green-300 bg-green-50 text-green-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center space-x-2">
          <Tag className="w-4 h-4" />
          <span>
            {promocionActual ? (
              <span className="flex items-center space-x-1">
                {getIconoTipo(promocionActual.tipoDescuento)}
                <span>{formatearDescuento(promocionActual)}</span>
              </span>
            ) : (
              'Agregar promoción'
            )}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown de Promociones */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          
          {/* Opción "Sin promoción" */}
          <button
            onClick={() => {
              onSeleccionar(undefined);
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
              !promocionSeleccionada ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            Sin promoción
          </button>

          <hr className="border-gray-100" />

          {/* Lista de Promociones */}
          {promociones.map((promocion) => {
            const descuento = calcularDescuentoLocal(promocion);
            const isSelected = promocionSeleccionada === promocion.idPromocion;
            const colorClasses = getColorPromocion(promocion);

            return (
              <button
                key={promocion.idPromocion}
                onClick={() => {
                  if (promocion.estaVigente) {
                    onSeleccionar(promocion.idPromocion);
                    setIsOpen(false);
                  }
                }}
                disabled={!promocion.estaVigente}
                className={`w-full px-3 py-3 text-left hover:bg-gray-50 transition-colors disabled:cursor-not-allowed ${
                  isSelected ? 'bg-blue-50 border-l-4 border-blue-400' : ''
                }`}
              >
                <div className="space-y-1">
                  {/* Título de la promoción */}
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                      {promocion.denominacion}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
                      {getIconoTipo(promocion.tipoDescuento)}
                      <span className="ml-1">
                        {promocion.tipoDescuento === 'PORCENTUAL' 
                          ? `${promocion.valorDescuento}%`
                          : `$${promocion.valorDescuento}`
                        }
                      </span>
                    </span>
                  </div>

                  {/* Descripción y ahorro */}
                  <div className="text-xs text-gray-600">
                    {promocion.descripcionDescuento && (
                      <p className="mb-1">{promocion.descripcionDescuento}</p>
                    )}
                    {promocion.estaVigente ? (
                      <p className="text-green-600 font-medium">
                        ✨ Ahorras: ${descuento.toFixed(0)}
                      </p>
                    ) : (
                      <p className="text-red-500">
                        ⚠️ {promocion.estadoDescripcion}
                      </p>
                    )}
                  </div>

                  {/* Condiciones */}
                  {promocion.cantidadMinima > 1 && (
                    <div className="text-xs text-gray-500">
                      Mínimo {promocion.cantidadMinima} unidades
                      {cantidad < promocion.cantidadMinima && (
                        <span className="text-orange-500 ml-1">
                          (necesitas {promocion.cantidadMinima - cantidad} más)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Footer informativo */}
          <div className="px-3 py-2 bg-gray-50 text-xs text-gray-500 border-t">
            💡 Los descuentos se aplicarán automáticamente al confirmar el pedido
          </div>
        </div>
      )}

      {/* Overlay para cerrar dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};