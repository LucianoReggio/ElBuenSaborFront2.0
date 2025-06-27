import React, { useState, useEffect } from "react";
import type { ArticuloInsumoRequestDTO } from "../../types/insumos/ArticuloInsumoRequestDTO";
import type { ArticuloInsumoResponseDTO } from "../../types/insumos/ArticuloInsumoResponseDTO";
import type { CategoriaResponseDTO } from "../../types/categorias/CategoriaResponseDTO";
import type { ImagenDTO } from "../../types/common/ImagenDTO";
import { FormField } from "../common/FormFieldProps";
import { Select } from "../common/Select";
import { Button } from "../common/Button";
import { ImageUpload } from "../common/ImageUpload";
import type { UnidadMedidaDTO } from "../../services";
import { CategoriaSelector } from "../common/CategoriaSelector";

interface InsumoFormProps {
  insumo?: ArticuloInsumoResponseDTO;
  categorias: CategoriaResponseDTO[];
  unidadesMedida: UnidadMedidaDTO[];
  onSubmit: (data: ArticuloInsumoRequestDTO) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const InsumoForm: React.FC<InsumoFormProps> = ({
  insumo,
  categorias,
  unidadesMedida,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<ArticuloInsumoRequestDTO>({
    denominacion: "",
    precioVenta: 0,
    idUnidadMedida: 0,
    idCategoria: 0,
    precioCompra: 0,
    stockActual: 0,
    stockMaximo: 0,
    esParaElaborar: true,
    imagen: undefined, // Campo para la imagen
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos si es edición
  useEffect(() => {
    if (insumo) {
      setFormData({
        denominacion: insumo.denominacion,
        precioVenta: insumo.precioVenta,
        idUnidadMedida: insumo.idUnidadMedida,
        idCategoria: insumo.idCategoria,
        precioCompra: insumo.precioCompra,
        stockActual: insumo.stockActual,
        stockMaximo: insumo.stockMaximo,
        esParaElaborar: insumo.esParaElaborar,
        imagen: insumo.imagenes && insumo.imagenes.length > 0 ? insumo.imagenes[0] : undefined,
      });
    }
  }, [insumo]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.denominacion.trim()) {
      newErrors.denominacion = "La denominación es obligatoria";
    }

    if (formData.precioVenta <= 0) {
      newErrors.precioVenta = "El precio de venta debe ser mayor a 0";
    }

    if (formData.precioCompra <= 0) {
      newErrors.precioCompra = "El precio de compra debe ser mayor a 0";
    }

    if (!formData.idUnidadMedida) {
      newErrors.idUnidadMedida = "Debe seleccionar una unidad de medida";
    }

    if (!formData.idCategoria) {
      newErrors.idCategoria = "Debe seleccionar una categoría";
    }

    if (formData.stockActual < 0) {
      newErrors.stockActual = "El stock actual no puede ser negativo";
    }

    if (formData.stockMaximo <= 0) {
      newErrors.stockMaximo = "El stock máximo debe ser mayor a 0";
    }

    if (formData.stockActual > formData.stockMaximo) {
      newErrors.stockActual = "El stock actual no puede ser mayor al máximo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error al guardar insumo:", error);
    }
  };

  const updateField = (field: keyof ArticuloInsumoRequestDTO, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (imagen: ImagenDTO | null) => {
    updateField("imagen", imagen || undefined);
    // Limpiar error de imagen si existe
    if (errors.imagen) {
      setErrors(prev => ({ ...prev, imagen: '' }));
    }
  };

  const handleEsParaElaborarChange = (esParaElaborar: boolean) => {
    updateField("esParaElaborar", esParaElaborar);
    
    // Si cambia a "Para Elaborar", limpiar la imagen
    if (esParaElaborar && formData.imagen) {
      updateField("imagen", undefined);
    }
  };

  // Filtrar solo categorías de ingredientes (no subcategorías por simplicidad)
  const categoriasDisponibles = categorias;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Denominación"
          name="denominacion"
          value={formData.denominacion}
          onChange={(value) => updateField("denominacion", value)}
          placeholder="Ej: Harina 000"
          required
          error={errors.denominacion}
        />

        <CategoriaSelector
          categorias={categorias}
          value={formData.idCategoria}
          onChange={(value) => updateField("idCategoria", value)}
          label="Categoría"
          required
          error={errors.idCategoria}
        />

        <Select
          label="Unidad de Medida"
          name="idUnidadMedida"
          value={formData.idUnidadMedida}
          onChange={(value) => updateField("idUnidadMedida", value)}
          options={unidadesMedida.map((um) => ({
            value: um.idUnidadMedida,
            label: um.denominacion,
          }))}
          placeholder="Seleccione unidad"
          required
          error={errors.idUnidadMedida}
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            Uso del Ingrediente
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="esParaElaborar"
                checked={formData.esParaElaborar}
                onChange={() => handleEsParaElaborarChange(true)}
                className="mr-2"
                disabled={loading}
              />
              <span>Para Elaborar (se usa en recetas)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="esParaElaborar"
                checked={!formData.esParaElaborar}
                onChange={() => handleEsParaElaborarChange(false)}
                className="mr-2"
                disabled={loading}
              />
              <span>Para Venta Directa</span>
            </label>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Los ingredientes para venta directa pueden tener imagen
          </p>
        </div>
      </div>

      {/* Imagen del ingrediente - Solo para venta directa */}
      {!formData.esParaElaborar && (
        <div className="border-t pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Imagen del Ingrediente
          </h3>
          
          <div className="max-w-md">
            <ImageUpload
              currentImage={formData.imagen}
              onImageChange={handleImageChange}
              placeholder="Selecciona una imagen del ingrediente para venta"
              maxSize={5}
              disabled={loading}
            />
            {errors.imagen && (
              <p className="mt-2 text-sm text-red-600">{errors.imagen}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              La imagen ayuda a los clientes a identificar el producto en el catálogo.
            </p>
          </div>
        </div>
      )}

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Información de Precios y Stock
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Precio de Compra"
            name="precioCompra"
            type="number"
            value={formData.precioCompra}
            onChange={(value) => updateField("precioCompra", value)}
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            disabled={loading}
            error={errors.precioCompra}
            helperText="Precio al que compra este ingrediente"
          />

          <FormField
            label="Precio de Venta"
            name="precioVenta"
            type="number"
            value={formData.precioVenta}
            onChange={(value) => updateField("precioVenta", value)}
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            disabled={loading}
            error={errors.precioVenta}
            helperText={
              formData.esParaElaborar 
                ? "Precio de referencia (no se vende directamente)" 
                : "Precio de venta al cliente"
            }
          />

          <FormField
            label="Stock Actual"
            name="stockActual"
            type="number"
            value={formData.stockActual}
            onChange={(value) => updateField("stockActual", value)}
            placeholder="0"
            min={0}
            required
            disabled={loading}
            error={errors.stockActual}
          />

          <FormField
            label="Stock Máximo"
            name="stockMaximo"
            type="number"
            value={formData.stockMaximo}
            onChange={(value) => updateField("stockMaximo", value)}
            placeholder="100"
            min={1}
            required
            disabled={loading}
            error={errors.stockMaximo}
          />
        </div>

        {/* Indicadores visuales */}
        {formData.stockMaximo > 0 && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Nivel de Stock</span>
              <span>
                {Math.round(
                  (formData.stockActual / formData.stockMaximo) * 100
                )}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  formData.stockActual / formData.stockMaximo < 0.2
                    ? "bg-red-500"
                    : formData.stockActual / formData.stockMaximo < 0.5
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{
                  width: `${Math.min(
                    (formData.stockActual / formData.stockMaximo) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {insumo ? "Actualizar" : "Crear"} Ingrediente
        </Button>
      </div>
    </form>
  );
};