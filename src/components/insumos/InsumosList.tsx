import React from "react";
import { Table, type TableColumn } from "../common/Table";
import { Button } from "../common/Button";
import type { ArticuloInsumoResponseDTO } from "../../types/insumos/ArticuloInsumoResponseDTO";

interface InsumosListProps {
  insumos: ArticuloInsumoResponseDTO[];
  loading?: boolean;
  onEdit: (insumo: ArticuloInsumoResponseDTO) => void;
  onDelete: (id: number) => void;
  onCompra: (insumo: ArticuloInsumoResponseDTO) => void;
}

export const InsumosList: React.FC<InsumosListProps> = ({
  insumos,
  loading = false,
  onEdit,
  onDelete,
  onCompra,
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

  const columns: TableColumn<ArticuloInsumoResponseDTO>[] = [
    {
      key: "denominacion",
      title: "Ingrediente",
      width: "20%",
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
      width: "15%",
      align: "center",
      render: (_, record: ArticuloInsumoResponseDTO) => (
        <div className="flex justify-center space-x-1">
          <Button
            size="sm"
            variant="success"
            onClick={() => onCompra(record)}
            title="Registrar compra"
          >
            💰
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(record)}>
            ✏️
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(record.idArticulo)}
            disabled={record.cantidadProductosQueLoUsan > 0}
            title={
              record.cantidadProductosQueLoUsan > 0
                ? "Se usa en productos"
                : "Eliminar"
            }
          >
            🗑️
          </Button>
        </div>
      ),
    },
  ];

  return (
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
  );
};
