import React, { useState } from "react";
import { Modal } from "../common/Modal";
import { FormField } from "../common/FormFieldProps";
import { Button } from "../common/Button";
import type { ArticuloInsumoResponseDTO } from "../../types/insumos/ArticuloInsumoResponseDTO";

interface CompraModalProps {
  isOpen: boolean;
  onClose: () => void;
  insumo?: ArticuloInsumoResponseDTO;
  onSubmit: (cantidad: number, precioCompra: number) => Promise<void>;
  loading?: boolean;
}

export const CompraModal: React.FC<CompraModalProps> = ({
  isOpen,
  onClose,
  insumo,
  onSubmit,
  loading = false,
}) => {
  const [cantidad, setCantidad] = useState<number>(0);
  const [precioCompra, setPrecioCompra] = useState<number>(
    insumo?.precioCompra || 0
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (cantidad <= 0) {
      newErrors.cantidad = "La cantidad debe ser mayor a 0";
    }

    if (precioCompra <= 0) {
      newErrors.precioCompra = "El precio debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(cantidad, precioCompra);
      onClose();
      setCantidad(0);
      setPrecioCompra(insumo?.precioCompra || 0);
    } catch (error) {
      console.error("Error al registrar compra:", error);
    }
  };

  if (!insumo) return null;

  const nuevoStock = insumo.stockActual + cantidad;
  const costoTotal = cantidad * precioCompra;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Registrar Compra - ${insumo.denominacion}`}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">Información Actual</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Stock Actual:</span>
              <span className="ml-2 font-medium">
                {insumo.stockActual} {insumo.denominacionUnidadMedida}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Precio Actual:</span>
              <span className="ml-2 font-medium">
                ${insumo.precioCompra.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Cantidad Comprada"
            name="cantidad"
            type="number"
            value={cantidad}
            onChange={(value) => setCantidad(value as number)}
            placeholder="0"
            min={0}
            step={1}
            required
            error={errors.cantidad}
            helperText={`En ${insumo.denominacionUnidadMedida}`}
          />

          <FormField
            label="Precio de Compra"
            name="precioCompra"
            type="number"
            value={precioCompra}
            onChange={(value) => setPrecioCompra(value as number)}
            placeholder="0.00"
            min={0}
            step={0.01}
            required
            error={errors.precioCompra}
            helperText="Por unidad"
          />
        </div>

        {cantidad > 0 && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">
              Resumen de Compra
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Nuevo Stock:</span>
                <span className="ml-2 font-medium">
                  {nuevoStock} {insumo.denominacionUnidadMedida}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Costo Total:</span>
                <span className="ml-2 font-medium">
                  ${costoTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button type="submit" loading={loading} disabled={loading}>
            Registrar Compra
          </Button>
        </div>
      </form>
    </Modal>
  );
};
