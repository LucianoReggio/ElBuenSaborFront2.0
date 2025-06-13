import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductoService } from "../services/ProductoService";
import type { ArticuloManufacturadoResponseDTO } from "../types/productos/ArticuloManufacturadoResponseDTO";
import { ArrowLeft, Star, Clock } from "lucide-react";

const productoService = new ProductoService();

const ProductoDetalle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<ArticuloManufacturadoResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      productoService
        .getById(Number(id))
        .then((res) => setProducto(res))
        .catch(() => setProducto(null))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="text-[#CD6C50] font-semibold text-xl">Cargando detalle...</span>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <span className="text-red-600 font-semibold text-xl">Producto no encontrado</span>
      </div>
    );
  }

  const imagenUrl = producto.imagenes?.[0]?.url ?? null;

  // Rating simulado (igual que en tu Home)
  const getProductRating = (cantidadVendida: number) => {
    if (cantidadVendida >= 100) return 4.9;
    if (cantidadVendida >= 50) return 4.7;
    if (cantidadVendida >= 20) return 4.5;
    if (cantidadVendida >= 10) return 4.3;
    return 4.0;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow mt-10">
      <button
        className="mb-6 flex items-center gap-2 text-[#CD6C50] hover:underline"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-5 h-5" /> Volver
      </button>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Imagen del producto */}
        <div className="flex-shrink-0 w-full md:w-1/2">
          {imagenUrl ? (
            <img
              src={imagenUrl}
              alt={producto.denominacion}
              className="rounded-xl object-cover w-full h-64"
            />
          ) : (
            <div className="bg-gray-100 w-full h-64 rounded-xl flex items-center justify-center text-5xl text-gray-400">
              {producto.denominacion.charAt(0)}
            </div>
          )}
        </div>

        {/* Info principal */}
        <div className="flex-1">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{producto.denominacion}</h2>
          <div className="flex items-center gap-4 mb-2">
            <span className="text-[#CD6C50] text-xl font-semibold">
              ${producto.precioVenta.toFixed(2)}
            </span>
            <span className="flex items-center text-yellow-500">
              <Star className="w-4 h-4 fill-current mr-1" /> {getProductRating(producto.cantidadVendida)}
            </span>
            <span className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-1" /> {producto.tiempoEstimadoEnMinutos} min
            </span>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <span className="inline-block bg-gray-100 px-2 py-1 rounded text-sm text-gray-600">
              {producto.categoria.denominacion}
            </span>
            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
              {producto.denominacionUnidadMedida}
            </span>
          </div>
          <p className="text-gray-700 mb-2">{producto.descripcion || "Sin descripción"}</p>
          {producto.preparacion && (
            <p className="mb-2 text-gray-500 text-sm">
              <span className="font-semibold">Preparación:</span> {producto.preparacion}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-gray-600">
            <span>Cantidad vendida: <b>{producto.cantidadVendida}</b></span>
            
            <span>
              Ingredientes: <b>{producto.cantidadIngredientes}</b>
            </span>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <span className={`text-sm font-bold ${producto.stockSuficiente ? "text-green-600" : "text-red-600"}`}>
              {producto.stockSuficiente
                ? `Stock para ${producto.cantidadMaximaPreparable} porciones`
                : "No disponible"}
            </span>
          </div>
          <button
            className={`px-6 py-3 rounded-lg font-semibold transition-colors duration-200 ${
              producto.stockSuficiente
                ? "bg-[#CD6C50] text-white hover:bg-[#b85a42]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            disabled={!producto.stockSuficiente}
          >
            {producto.stockSuficiente ? "Pedir Ahora" : "Agotado"}
          </button>
        </div>
      </div>

      {/* Ingredientes */}
      {producto.detalles && producto.detalles.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Ingredientes</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {producto.detalles.map((detalle, idx) => (
              <li
                key={detalle.idDetalleManufacturado ?? idx}
                className="bg-gray-100 px-4 py-2 rounded flex justify-between items-center"
              >
                <span>
                  {detalle.denominacionInsumo ?? "Ingrediente"}
                  <span className="text-sm text-gray-500 ml-2">
                    {detalle.cantidad} {detalle.unidadMedida ?? ""}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductoDetalle;
