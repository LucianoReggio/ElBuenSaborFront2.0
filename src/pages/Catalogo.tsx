// src/pages/Catalogo.tsx - VERSIÓN MEJORADA
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductoService } from "../services/ProductoService";
import type { ArticuloManufacturadoResponseDTO } from "../types/productos/ArticuloManufacturadoResponseDTO";
import { Star, Clock, ShoppingCart, Tag, Truck, Store } from "lucide-react";
import CarritoModal from "../components/cart/CarritoModal";
import { useCarritoMercadoPago } from '../hooks/useCarritoMercadoPago';

const productoService = new ProductoService();

const Catalogo: React.FC = () => {
  const [productos, setProductos] = useState<ArticuloManufacturadoResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const carrito = useCarritoMercadoPago(); // ✅ Ya lo tienes bien
  const navigate = useNavigate();

  useEffect(() => {
    productoService
      .getAll()
      .then(setProductos)
      .finally(() => setLoading(false));
  }, []);

  // Filtrar productos por búsqueda
  const productosFiltrados = productos.filter((prod) =>
    prod.denominacion.toLowerCase().includes(busqueda.toLowerCase())
  );

  const getProductRating = (cantidadVendida: number) => {
    if (cantidadVendida >= 100) return 4.9;
    if (cantidadVendida >= 50) return 4.7;
    if (cantidadVendida >= 20) return 4.5;
    if (cantidadVendida >= 10) return 4.3;
    return 4.0;
  };

  // Handler cuando se hace click en "Pedir"
  const handleOrderClick = (producto: ArticuloManufacturadoResponseDTO) => {
    carrito.agregarItem(producto);
    setCarritoAbierto(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Catálogo de Productos</h1>

      {/* 🎉 NUEVO: Selector de tipo de entrega */}
      {!carrito.estaVacio && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">Tipo de entrega</h3>
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              onClick={() => carrito.setDatosEntrega({
                ...carrito.datosEntrega,
                tipoEnvio: 'TAKE_AWAY'
              })}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                carrito.datosEntrega.tipoEnvio === 'TAKE_AWAY'
                  ? 'border-[#CD6C50] bg-[#CD6C50] bg-opacity-10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Store className="w-5 h-5 mx-auto mb-1 text-[#CD6C50]" />
              <div className="text-sm font-medium">Retiro en local</div>
              <div className="text-xs text-green-600">10% descuento</div>
            </button>

            <button
              onClick={() => carrito.setDatosEntrega({
                ...carrito.datosEntrega,
                tipoEnvio: 'DELIVERY'
              })}
              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                carrito.datosEntrega.tipoEnvio === 'DELIVERY'
                  ? 'border-[#CD6C50] bg-[#CD6C50] bg-opacity-10'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Truck className="w-5 h-5 mx-auto mb-1 text-[#CD6C50]" />
              <div className="text-sm font-medium">Delivery</div>
              <div className="text-xs text-gray-500">+$200</div>
            </button>
          </div>
        </div>
      )}

      <input
        type="text"
        className="w-full max-w-md mb-8 p-2 border border-gray-300 rounded-lg"
        placeholder="Buscar producto..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <span className="text-[#CD6C50] text-xl font-semibold">Cargando productos...</span>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center text-gray-500">No se encontraron productos.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {productosFiltrados.map((producto) => {
            const imagenUrl = producto.imagenes?.[0]?.url ?? null;
            const rating = getProductRating(producto.cantidadVendida);

            return (
              <div
                key={producto.idArticulo}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="h-48 relative overflow-hidden">
                  {imagenUrl ? (
                    <img
                      src={imagenUrl}
                      alt={producto.denominacion}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl text-gray-400">
                      {producto.denominacion.charAt(0)}
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      producto.stockSuficiente
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {producto.stockSuficiente ? 'Disponible' : 'Agotado'}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-sm flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {producto.tiempoEstimadoEnMinutos} min
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 truncate">
                      {producto.denominacion}
                    </h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-1">
                    {producto.descripcion || `Delicioso ${producto.denominacion} preparado con ingredientes frescos`}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {producto.categoria.denominacion}
                    </span>
                    <span className="ml-2">{producto.cantidadVendida} vendidos</span>
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-[#CD6C50]">
                      ${producto.precioVenta.toFixed(0)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOrderClick(producto)}
                        disabled={!producto.stockSuficiente}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                          producto.stockSuficiente
                            ? 'bg-[#CD6C50] text-white hover:bg-[#b85a42]'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {producto.stockSuficiente ? 'Pedir' : 'Agotado'}
                      </button>
                      <button
                        onClick={() => navigate(`/productos/${producto.idArticulo}`)}
                        className="px-4 py-2 rounded-lg border border-[#CD6C50] text-[#CD6C50] font-semibold hover:bg-[#f5ebe8] transition-colors duration-200"
                      >
                        Detalle
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Carrito Modal */}
      <CarritoModal
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
      />

      {/* 🎉 NUEVO: Botón flotante mejorado con descuentos */}
      {!carrito.estaVacio && (
        <div className="fixed bottom-8 right-8 z-50">
          {/* Widget de información del carrito */}
          <div className="bg-white shadow-lg rounded-lg p-4 mb-3 border min-w-[250px]">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-800">Mi Carrito</span>
              <span className="text-sm text-gray-500">{carrito.cantidadTotal} productos</span>
            </div>
            
            {/* Mostrar descuento si aplica */}
            {carrito.tieneDescuento && (
              <div className="flex items-center text-green-600 text-sm mb-1">
                <Tag className="w-3 h-3 mr-1" />
                <span>Descuento: -${carrito.descuento.toFixed(0)}</span>
              </div>
            )}
            
            {/* Mostrar envío si aplica */}
            {carrito.costoEnvio > 0 && (
              <div className="flex items-center text-gray-600 text-sm mb-1">
                <Truck className="w-3 h-3 mr-1" />
                <span>Envío: +${carrito.costoEnvio.toFixed(0)}</span>
              </div>
            )}
            
            {/* Total */}
            <div className="flex items-center justify-between border-t pt-2">
              <span className="font-bold text-gray-800">Total:</span>
              <span className="font-bold text-[#CD6C50] text-lg">
                ${carrito.total.toFixed(0)}
              </span>
            </div>
            
            {/* Resumen del descuento */}
            {carrito.resumenDescuento && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                ✨ {carrito.resumenDescuento}
              </div>
            )}
            
            {/* Loading indicator */}
            {carrito.cargandoTotales && (
              <div className="flex items-center text-blue-600 text-xs mt-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-blue-600 mr-1"></div>
                Actualizando totales...
              </div>
            )}
          </div>

          {/* Botón principal */}
          <button
            onClick={() => setCarritoAbierto(true)}
            className="w-full bg-[#CD6C50] hover:bg-[#b85a42] text-white p-4 rounded-lg shadow-2xl flex items-center justify-center gap-2 transition font-semibold"
            style={{ boxShadow: "0 4px 24px rgba(205,108,80,.25)" }}
          >
            <ShoppingCart className="w-6 h-6" />
            Ver Carrito
          </button>
        </div>
      )}

      {/* Botón flotante simple cuando carrito está vacío */}
      {carrito.estaVacio && (
        <button
          onClick={() => setCarritoAbierto(true)}
          className="fixed bottom-8 right-8 z-50 bg-gray-400 text-white p-4 rounded-full shadow-lg"
          title="Carrito vacío"
        >
          <ShoppingCart className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default Catalogo;