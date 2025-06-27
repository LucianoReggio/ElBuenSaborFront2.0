import React from "react";
import { Table, type TableColumn } from "../common/Table";
import { Button } from "../common/Button";
import type { ArticuloInsumoResponseDTO } from "../../types/insumos/ArticuloInsumoResponseDTO";

interface InsumosListProps {
  insumos: ArticuloInsumoResponseDTO[];
  loading?: boolean;
  onEdit: (insumo: ArticuloInsumoResponseDTO) => void;
  onDelete: (id: number) => void;
}

export const InsumosList: React.FC<InsumosListProps> = ({
  insumos,
  loading = false,
  onEdit,
  onDelete,
}) => {
  const getStockBadge = (insumo: ArticuloInsumoResponseDTO) => {
    const { estadoStock } = insumo;
    const colors = {
      CRITICO: "bg-red-100 text-red-800",
      BAJO: "bg-yellow-100 text-yellow-800",
      NORMAL: "bg-green-100 text-green-800",
      ALTO: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${colors[estadoStock]}`}
      >
        {estadoStock}
      </span>
    );
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://via.placeholder.com/40x40/f3f4f6/6b7280?text=Sin+Imagen";
  };

  const columns: TableColumn<ArticuloInsumoResponseDTO>[] = [
    {
      key: "imagen",
      title: "Imagen",
      width: "8%",
      align: "center",
      render: (_, record: ArticuloInsumoResponseDTO) => {
        // Solo mostrar imagen si NO es para elaborar (es para venta)
        if (record.esParaElaborar) {
          return (
            <div className="flex justify-center">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">🧪</span>
              </div>
            </div>
          );
        }

        return (
          <div className="flex justify-center">
            {record.imagenes && record.imagenes.length > 0 ? (
              <img
                src={record.imagenes[0].url}
                alt={record.imagenes[0].denominacion}
                className="w-10 h-10 object-cover rounded-lg shadow-sm"
                onError={handleImageError}
                title={record.imagenes[0].denominacion}
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-xs">🛒</span>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "denominacion",
      title: "Ingrediente",
      width: "18%",
      render: (value: string, record: ArticuloInsumoResponseDTO) => (
        <div>
          <p className="font-medium text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">
            {record.esParaElaborar ? "Para elaborar" : "Venta directa"}
          </p>
        </div>
      ),
    },
    {
      key: "denominacionCategoria",
      title: "Categoría",
      width: "15%",
    },
    {
      key: "denominacionUnidadMedida",
      title: "Unidad",
      width: "10%",
    },
    {
      key: "precioCompra",
      title: "Precio Compra",
      width: "12%",
      align: "right",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "stockActual",
      title: "Stock",
      width: "10%",
      align: "center",
      render: (value: number, record: ArticuloInsumoResponseDTO) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-xs text-gray-500">/ {record.stockMaximo}</div>
        </div>
      ),
    },
    {
      key: "estadoStock",
      title: "Estado",
      width: "10%",
      align: "center",
      render: (_, record: ArticuloInsumoResponseDTO) => getStockBadge(record),
    },
    {
      key: "esParaElaborar",
      title: "Uso",
      width: "8%",
      align: "center",
      render: (value: boolean) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value
              ? "bg-purple-100 text-purple-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {value ? "Elaborar" : "Venta"}
        </span>
      ),
    },
    {
      key: "acciones",
      title: "Acciones",
      width: "9%",
      align: "center",
      render: (_, record: ArticuloInsumoResponseDTO) => (
        <div className="flex justify-center space-x-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(record)}
            title="Editar ingrediente"
          >
            ✏️
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(record.idArticulo)}
            disabled={record.cantidadProductosQueLoUsan > 0}
            title={
              record.cantidadProductosQueLoUsan > 0
                ? `Se usa en ${record.cantidadProductosQueLoUsan} producto(s)`
                : "Eliminar ingrediente"
            }
          >
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <Table
        columns={columns}
        data={insumos}
        loading={loading}
        emptyText="No hay ingredientes registrados"
        rowClassName={(record) =>
          record.estadoStock === "CRITICO"
            ? "bg-red-50"
            : record.estadoStock === "BAJO"
            ? "bg-yellow-50"
            : ""
        }
      />
    </div>
  );
};