import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Percent, DollarSign, Hash, Tag, Image,  X } from 'lucide-react';
import { Button } from '../common/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Alert } from '../common/Alert';
import { useProductos } from '../../hooks/useProductos';
import type { PromocionRequestDTO, PromocionResponseDTO } from '../../types/promociones';
import type { ArticuloManufacturadoResponseDTO } from '../../types/productos/ArticuloManufacturadoResponseDTO';

interface PromocionFormProps {
  promocion?: PromocionResponseDTO | null;
  onGuardar: (data: PromocionRequestDTO) => Promise<void>;
  onCancelar: () => void;
}

interface ProductoSeleccionado {
  id: number;
  nombre: string;
  precio: number;
}

export const PromocionForm: React.FC<PromocionFormProps> = ({
  promocion,
  onGuardar,
  onCancelar
}) => {
  const { productos, loading: loadingProductos } = useProductos();
  
  // Estados del formulario
  const [formData, setFormData] = useState({
    denominacion: '',
    fechaDesde: '',
    fechaHasta: '',
    horaDesde: '00:00',
    horaHasta: '23:59',
    descripcionDescuento: '',
    tipoDescuento: 'PORCENTUAL' as 'PORCENTUAL' | 'MONTO_FIJO',
    valorDescuento: 0,
    cantidadMinima: 1,
    activo: true
  });

  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoSeleccionado[]>([]);
  const [imagenesUrls, setImagenesUrls] = useState<string[]>([]);
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inicializar formulario con datos de la promoción (modo edición)
  useEffect(() => {
    if (promocion) {
      setFormData({
        denominacion: promocion.denominacion,
        fechaDesde: promocion.fechaDesde.split('T')[0], // Extraer solo la fecha
        fechaHasta: promocion.fechaHasta.split('T')[0],
        horaDesde: promocion.horaDesde.slice(0, 5), // "HH:mm:ss" -> "HH:mm"
        horaHasta: promocion.horaHasta.slice(0, 5),
        descripcionDescuento: promocion.descripcionDescuento || '',
        tipoDescuento: promocion.tipoDescuento,
        valorDescuento: promocion.valorDescuento,
        cantidadMinima: promocion.cantidadMinima,
        activo: promocion.activo
      });

      setProductosSeleccionados(
        promocion.articulos.map(art => ({
          id: art.idArticulo,
          nombre: art.denominacion,
          precio: art.precioVenta
        }))
      );

      setImagenesUrls(promocion.urlsImagenes || []);
    }
  }, [promocion]);

  // Manejar cambios en inputs
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  // Agregar producto seleccionado
  const agregarProducto = (producto: ArticuloManufacturadoResponseDTO) => {
    const yaSeleccionado = productosSeleccionados.some(p => p.id === producto.idArticulo);
    if (yaSeleccionado) {
      setError('Este producto ya está seleccionado');
      return;
    }

    setProductosSeleccionados(prev => [...prev, {
      id: producto.idArticulo,
      nombre: producto.denominacion,
      precio: producto.precioVenta
    }]);
    setError(null);
  };

  // Remover producto seleccionado
  const removerProducto = (id: number) => {
    setProductosSeleccionados(prev => prev.filter(p => p.id !== id));
  };

  // Agregar URL de imagen
  const agregarImagen = () => {
    if (!nuevaImagenUrl.trim()) return;
    
    if (imagenesUrls.includes(nuevaImagenUrl)) {
      setError('Esta imagen ya está agregada');
      return;
    }

    setImagenesUrls(prev => [...prev, nuevaImagenUrl.trim()]);
    setNuevaImagenUrl('');
    setError(null);
  };

  // Remover imagen
  const removerImagen = (index: number) => {
    setImagenesUrls(prev => prev.filter((_, i) => i !== index));
  };

  // Validar formulario
  const validarFormulario = (): string | null => {
    if (!formData.denominacion.trim()) {
      return 'El nombre de la promoción es obligatorio';
    }

    if (!formData.fechaDesde || !formData.fechaHasta) {
      return 'Las fechas de vigencia son obligatorias';
    }

    if (new Date(formData.fechaDesde) > new Date(formData.fechaHasta)) {
      return 'La fecha de inicio no puede ser posterior a la fecha de fin';
    }

    if (formData.horaDesde >= formData.horaHasta) {
      return 'La hora de inicio debe ser anterior a la hora de fin';
    }

    if (formData.valorDescuento <= 0) {
      return 'El valor del descuento debe ser mayor a 0';
    }

    if (formData.tipoDescuento === 'PORCENTUAL' && formData.valorDescuento > 100) {
      return 'El descuento porcentual no puede ser mayor al 100%';
    }

    if (formData.cantidadMinima < 1) {
      return 'La cantidad mínima debe ser al menos 1';
    }

    if (productosSeleccionados.length === 0) {
      return 'Debe seleccionar al menos un producto';
    }

    return null;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errorValidacion = validarFormulario();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calcular precio promocional (promedio de precios con descuento aplicado)
      const precioPromocional = productosSeleccionados.length > 0
        ? productosSeleccionados.reduce((sum, producto) => {
            if (formData.tipoDescuento === 'PORCENTUAL') {
              return sum + (producto.precio * (1 - formData.valorDescuento / 100));
            } else {
              return sum + Math.max(0, producto.precio - formData.valorDescuento);
            }
          }, 0) / productosSeleccionados.length
        : 0;

      const promocionRequest: PromocionRequestDTO = {
        denominacion: formData.denominacion.trim(),
        fechaDesde: `${formData.fechaDesde}T00:00:00`,
        fechaHasta: `${formData.fechaHasta}T23:59:59`,
        horaDesde: `${formData.horaDesde}:00`,
        horaHasta: `${formData.horaHasta}:59`,
        descripcionDescuento: formData.descripcionDescuento.trim() || undefined,
        tipoDescuento: formData.tipoDescuento,
        valorDescuento: formData.valorDescuento,
        precioPromocional: Math.round(precioPromocional * 100) / 100, // Redondear a 2 decimales
        cantidadMinima: formData.cantidadMinima,
        activo: formData.activo,
        idsArticulos: productosSeleccionados.map(p => p.id),
        urlsImagenes: imagenesUrls.length > 0 ? imagenesUrls : undefined
      };

      await onGuardar(promocionRequest);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la promoción');
    } finally {
      setLoading(false);
    }
  };

  if (loadingProductos) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error */}
      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Tag className="w-4 h-4 inline mr-1" />
            Nombre de la promoción *
          </label>
          <input
            type="text"
            value={formData.denominacion}
            onChange={(e) => handleInputChange('denominacion', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: 15% descuento en pizzas"
            maxLength={100}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción (opcional)
          </label>
          <input
            type="text"
            value={formData.descripcionDescuento}
            onChange={(e) => handleInputChange('descripcionDescuento', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Descripción adicional del descuento"
            maxLength={200}
          />
        </div>
      </div>

      {/* Tipo y valor del descuento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de descuento *
          </label>
          <select
            value={formData.tipoDescuento}
            onChange={(e) => handleInputChange('tipoDescuento', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PORCENTUAL">Porcentual (%)</option>
            <option value="MONTO_FIJO">Monto fijo ($)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {formData.tipoDescuento === 'PORCENTUAL' ? (
              <>
                <Percent className="w-4 h-4 inline mr-1" />
                Porcentaje de descuento *
              </>
            ) : (
              <>
                <DollarSign className="w-4 h-4 inline mr-1" />
                Monto de descuento *
              </>
            )}
          </label>
          <input
            type="number"
            value={formData.valorDescuento}
            onChange={(e) => handleInputChange('valorDescuento', parseFloat(e.target.value) || 0)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="0"
            max={formData.tipoDescuento === 'PORCENTUAL' ? "100" : undefined}
            step={formData.tipoDescuento === 'PORCENTUAL' ? "1" : "0.01"}
            placeholder={formData.tipoDescuento === 'PORCENTUAL' ? "15" : "50.00"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 inline mr-1" />
            Cantidad mínima *
          </label>
          <input
            type="number"
            value={formData.cantidadMinima}
            onChange={(e) => handleInputChange('cantidadMinima', parseInt(e.target.value) || 1)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="1"
            placeholder="1"
          />
        </div>
      </div>

      {/* Período de vigencia */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Fecha desde *
          </label>
          <input
            type="date"
            value={formData.fechaDesde}
            onChange={(e) => handleInputChange('fechaDesde', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Fecha hasta *
          </label>
          <input
            type="date"
            value={formData.fechaHasta}
            onChange={(e) => handleInputChange('fechaHasta', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Hora desde *
          </label>
          <input
            type="time"
            value={formData.horaDesde}
            onChange={(e) => handleInputChange('horaDesde', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Hora hasta *
          </label>
          <input
            type="time"
            value={formData.horaHasta}
            onChange={(e) => handleInputChange('horaHasta', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Productos incluidos */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Productos incluidos en la promoción *
        </label>
        
        {/* Selector de productos */}
        <div className="mb-4">
          <select
            onChange={(e) => {
              const producto = productos.find(p => p.idArticulo === parseInt(e.target.value));
              if (producto) {
                agregarProducto(producto);
                e.target.value = '';
              }
            }}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            defaultValue=""
          >
            <option value="" disabled>Seleccionar un producto...</option>
            {productos
              .filter(p => !productosSeleccionados.some(ps => ps.id === p.idArticulo))
              .map(producto => (
                <option key={producto.idArticulo} value={producto.idArticulo}>
                  {producto.denominacion} - ${producto.precioVenta}
                </option>
              ))
            }
          </select>
        </div>

        {/* Lista de productos seleccionados */}
        {productosSeleccionados.length > 0 && (
          <div className="space-y-2">
            {productosSeleccionados.map(producto => {
              // Calcular precio con descuento para este producto
              let precioConDescuento = producto.precio;
              if (formData.valorDescuento > 0) {
                if (formData.tipoDescuento === 'PORCENTUAL') {
                  precioConDescuento = producto.precio * (1 - formData.valorDescuento / 100);
                } else {
                  precioConDescuento = Math.max(0, producto.precio - formData.valorDescuento);
                }
              }

              return (
                <div
                  key={producto.id}
                  className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="font-medium">{producto.nombre}</span>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="line-through">${producto.precio}</span>
                      {formData.valorDescuento > 0 && (
                        <span className="ml-2 text-green-600 font-medium">
                          ${precioConDescuento.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removerProducto(producto.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}

            {/* Precio promocional promedio */}
            {formData.valorDescuento > 0 && productosSeleccionados.length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm font-medium text-blue-800">
                  Precio promocional promedio estimado:
                </div>
                <div className="text-lg font-bold text-blue-900">
                  ${(() => {
                    const promedio = productosSeleccionados.reduce((sum, producto) => {
                      if (formData.tipoDescuento === 'PORCENTUAL') {
                        return sum + (producto.precio * (1 - formData.valorDescuento / 100));
                      } else {
                        return sum + Math.max(0, producto.precio - formData.valorDescuento);
                      }
                    }, 0) / productosSeleccionados.length;
                    return promedio.toFixed(2);
                  })()}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Este es el precio que se guardará en la base de datos
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Imágenes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Image className="w-4 h-4 inline mr-1" />
          Imágenes (opcional)
        </label>
        
        {/* Agregar imagen */}
        <div className="flex gap-2 mb-4">
          <input
            type="url"
            value={nuevaImagenUrl}
            onChange={(e) => setNuevaImagenUrl(e.target.value)}
            placeholder="URL de la imagen"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Button
            type="button"
            onClick={agregarImagen}
            variant="outline"
          
          >
            Agregar
          </Button>
        </div>

        {/* Lista de imágenes */}
        {imagenesUrls.length > 0 && (
          <div className="space-y-2">
            {imagenesUrls.map((url, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
              >
                <span className="text-sm text-gray-600 truncate flex-1 mr-2">{url}</span>
                <button
                  type="button"
                  onClick={() => removerImagen(index)}
                  className="text-red-600 hover:text-red-800 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Estado activo */}
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="activo"
          checked={formData.activo}
          onChange={(e) => handleInputChange('activo', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="activo" className="text-sm font-medium text-gray-700">
          Promoción activa (se puede aplicar inmediatamente)
        </label>
      </div>

      {/* Botones de acción */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          onClick={onCancelar}
          variant="outline"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          
        >
          {loading ? 'Guardando...' : promocion ? 'Actualizar' : 'Crear'} Promoción
        </Button>
      </div>
    </form>
  );
};