import React from "react";
import { Table, type TableColumn } from "../common/Table";
import { Button } from "../common/Button";
import type { ArticuloManufacturadoResponseDTO } from "../../types/productos/ArticuloManufacturadoResponseDTO";

interface ProductosListProps {
  productos: ArticuloManufacturadoResponseDTO[];
  loading?: boolean;
  onEdit: (producto: ArticuloManufacturadoResponseDTO) => void;
  onDelete: (id: number) => void;
  onViewDetails: (producto: ArticuloManufacturadoResponseDTO) => void;
}

export const ProductosList: React.FC<ProductosListProps> = ({
  productos,
  loading = false,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  const columns: TableColumn<ArticuloManufacturadoResponseDTO>[] = [
    {
      key: "denominacion",
      title: "Producto",
      width: "25%",
    },
    {
      key: "categoria.denominacion",
      title: "Categoría",
      width: "15%",
      render: (_, record: ArticuloManufacturadoResponseDTO) => (
        <span>
          {record.categoria.esSubcategoria
            ? `${record.categoria.denominacionCategoriaPadre} > ${record.categoria.denominacion}`
            : record.categoria.denominacion}
        </span>
      ),
    },
    {
      key: "tiempoEstimadoEnMinutos",
      title: "Tiempo",
      width: "10%",
      align: "center",
      render: (value: number) => `${value} min`,
    },
    {
      key: "costoTotal",
      title: "Costo",
      width: "10%",
      align: "right",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "precioVenta",
      title: "Precio",
      width: "10%",
      align: "right",
      render: (value: number) => `$${value.toFixed(2)}`,
    },
    {
      key: "margenGanancia",
      title: "Margen",
      width: "8%",
      align: "center",
      render: (value: number) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value >= 3
              ? "bg-green-100 text-green-800"
              : value >= 2
              ? "bg-yellow-100 text-yellow-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {value.toFixed(1)}x
        </span>
      ),
    },
    {
      key: "stockSuficiente",
      title: "Stock",
      width: "8%",
      align: "center",
      render: (value: boolean) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            value ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
          }`}
        >
          {value ? "OK" : "Falta"}
        </span>
      ),
    },
    {
      key: "acciones",
      title: "Acciones",
      width: "14%",
      align: "center",
      render: (_, record: ArticuloManufacturadoResponseDTO) => (
        <div className="flex justify-center space-x-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onViewDetails(record)}
            title="Ver detalles"
          >
            Ver
          </Button>
          <Button size="sm" variant="outline" onClick={() => onEdit(record)}>
            Editar
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(record.idArticulo)}
            disabled={record.cantidadVendida > 0}
            title={
              record.cantidadVendida > 0 ? "Producto con ventas" : "Eliminar"
            }
          >
            Eliminar
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={productos}
      loading={loading}
      emptyText="No hay productos registrados"
      rowClassName={(record) => (!record.stockSuficiente ? "bg-red-50" : "")}
    />
  );
};
