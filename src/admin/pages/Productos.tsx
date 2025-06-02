import React, { useState, useEffect } from "react";
import { Button } from "../components/common/Button";
import { Alert } from "../components/common/Alert";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { ProductosList } from "../components/productos/ProductosList";
import { ProductoModal } from "../components/productos/ProductoModal";
import { useProductos } from "../hooks/useProductos";
import { useInsumos } from "../hooks/useInsumos";
import { useCategorias } from "../hooks/useCategorias";
import { unidadMedidaService } from "../services";
import type { ArticuloManufacturadoResponseDTO } from "../types/productos/ArticuloManufacturadoResponseDTO";
import type { ArticuloManufacturadoRequestDTO } from "../types/productos/ArticuloManufacturadoRequestDTO";
import type { UnidadMedidaDTO } from "../services";
import { ProductoDetallesModal } from "../components/productos/ProductoDetallesModal";

export const Productos: React.FC = () => {
  const {
    productos,
    loading,
    error,
    createProducto,
    updateProducto,
    deleteProducto,
  } = useProductos();

  const { insumos } = useInsumos();
  const { categorias } = useCategorias();

  // Estado para unidades de medida
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedidaDTO[]>([]);
  const [loadingUnidades, setLoadingUnidades] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [detallesModalOpen, setDetallesModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<
    ArticuloManufacturadoResponseDTO | undefined
  >();
  const [viewingProducto, setViewingProducto] = useState<
    ArticuloManufacturadoResponseDTO | undefined
  >();
  const [operationLoading, setOperationLoading] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    message: string;
  } | null>(null);

  // Cargar unidades de medida
  useEffect(() => {
    const fetchUnidadesMedida = async () => {
      setLoadingUnidades(true);
      try {
        const unidades = await unidadMedidaService.getAll();
        setUnidadesMedida(unidades);
      } catch (error) {
        console.error("Error al cargar unidades de medida:", error);
        setAlert({
          type: "error",
          message: "Error al cargar unidades de medida",
        });
      } finally {
        setLoadingUnidades(false);
      }
    };

    fetchUnidadesMedida();
  }, []);

  const handleCreate = () => {
    // Verificar que haya ingredientes disponibles
    const ingredientesParaElaborar = insumos.filter((i) => i.esParaElaborar);
    if (ingredientesParaElaborar.length === 0) {
      setAlert({
        type: "warning",
        message:
          'Debe crear ingredientes marcados como "Para Elaborar" antes de crear productos.',
      });
      return;
    }

    setEditingProducto(undefined);
    setModalOpen(true);
  };

  const handleEdit = (producto: ArticuloManufacturadoResponseDTO) => {
    setEditingProducto(producto);
    setModalOpen(true);
  };

  const handleViewDetails = (producto: ArticuloManufacturadoResponseDTO) => {
    setViewingProducto(producto);
    setDetallesModalOpen(true);
  };

  const handleEditFromDetails = (
    producto: ArticuloManufacturadoResponseDTO
  ) => {
    setEditingProducto(producto);
    setModalOpen(true);
  };

  const handleSubmit = async (data: ArticuloManufacturadoRequestDTO) => {
    setOperationLoading(true);
    try {
      if (editingProducto) {
        await updateProducto(editingProducto.idArticulo, data);
        setAlert({
          type: "success",
          message: "Producto actualizado correctamente",
        });
      } else {
        await createProducto(data);
        setAlert({ type: "success", message: "Producto creado correctamente" });
      }
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Error al guardar el producto",
      });
    } finally {
      setOperationLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Está seguro de que desea eliminar este producto?")) {
      return;
    }

    try {
      await deleteProducto(id);
      setAlert({
        type: "success",
        message: "Producto eliminado correctamente",
      });
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Error al eliminar el producto",
      });
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProducto(undefined);
  };

  const closeDetallesModal = () => {
    setDetallesModalOpen(false);
    setViewingProducto(undefined);
  };

  const closeAlert = () => {
    setAlert(null);
  };

  // Calcular estadísticas
  const stats = {
    total: productos.length,
    disponibles: productos.filter((p) => p.stockSuficiente).length,
    sinStock: productos.filter((p) => !p.stockSuficiente).length,
    margenAlto: productos.filter((p) => p.margenGanancia >= 3).length,
  };

  const ingredientesParaElaborar = insumos.filter((i) => i.esParaElaborar);

  if (loading || loadingUnidades) {
    return (
      <div className="p-6">
        <LoadingSpinner size="lg" />
        <p className="text-center text-gray-500 mt-4">Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gestión de Productos
          </h1>
          <p className="text-gray-600 mt-1">
            Administre los productos manufacturados y sus recetas
          </p>
        </div>
        <Button onClick={handleCreate}>Nuevo Producto</Button>
      </div>

      {/* Alert */}
      {alert && (
        <Alert type={alert.type} message={alert.message} onClose={closeAlert} />
      )}

      {/* Error */}
      {error && (
        <Alert type="error" title="Error al cargar datos" message={error} />
      )}

      {/* Alertas de ingredientes */}
      {ingredientesParaElaborar.length === 0 && (
        <Alert
          type="warning"
          title="Sin ingredientes para elaborar"
          message="No hay ingredientes marcados como 'Para Elaborar'. Debe crear ingredientes antes de poder crear productos."
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Productos</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-green-600">
            {stats.disponibles}
          </div>
          <div className="text-sm text-gray-600">Stock Disponible</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-red-600">
            {stats.sinStock}
          </div>
          <div className="text-sm text-gray-600">Sin Stock</div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-2xl font-bold text-purple-600">
            {stats.margenAlto}
          </div>
          <div className="text-sm text-gray-600">Margen Alto (3x+)</div>
        </div>
      </div>

      {/* Alertas de Stock */}
      {stats.sinStock > 0 && (
        <Alert
          type="warning"
          title="Productos sin stock suficiente"
          message={`Hay ${stats.sinStock} producto(s) que no se pueden preparar por falta de ingredientes.`}
        />
      )}

      {/* Table */}
      <ProductosList
        productos={productos}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />

      {/* Modal de Producto */}
      <ProductoModal
        isOpen={modalOpen}
        onClose={closeModal}
        producto={editingProducto}
        categorias={categorias}
        unidadesMedida={unidadesMedida}
        ingredientes={ingredientesParaElaborar}
        onSubmit={handleSubmit}
        loading={operationLoading}
      />

      {/* Modal de Detalles */}
      <ProductoDetallesModal
        isOpen={detallesModalOpen}
        onClose={closeDetallesModal}
        producto={viewingProducto}
        onEdit={handleEditFromDetails}
      />
    </div>
  );
};

export default Productos;
