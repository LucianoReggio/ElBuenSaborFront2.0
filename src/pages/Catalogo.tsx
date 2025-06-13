import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductoService } from "../services/ProductoService";
import type { ArticuloManufacturadoResponseDTO } from "../types/productos/ArticuloManufacturadoResponseDTO";
import { Star, Clock, ShoppingCart } from "lucide-react";
import CarritoModal from "../components/cart/CarritoModal";

const productoService = new ProductoService();

const Catalogo: React.FC = () => {
  const [productos, setProductos] = useState<ArticuloManufacturadoResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [carritoAbierto, setCarritoAbierto] = useState(false);

  // Por ahora, items del carrito mockeados (luego será un estado real)
  const [itemsCarrito, setItemsCarrito] = useState<
    { id: number; nombre: string; cantidad: number; precio: number }[]
  >([]);

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
    // Por ahora, solo abrir carrito y simular agregar
    // En la lógica real, podrías sumar la cantidad si ya está
    setItemsCarrito((itemsPrev) => {
      const existe = itemsPrev.find((item) => item.id === producto.idArticulo);
      if (existe) {
        // Sumar uno
        return itemsPrev.map((item) =>
          item.id === producto.idArticulo
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      // Si no existe, agregar nuevo
      return [
        ...itemsPrev,
        {
          id: producto.idArticulo,
          nombre: producto.denominacion,
          cantidad: 1,
          precio: producto.precioVenta,
        },
      ];
    });
    setCarritoAbierto(true);
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Catálogo de Productos</h1>

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

      {/* Carrito Modal y botón flotante */}
      <CarritoModal
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        items={itemsCarrito}
      />

      <button
        onClick={() => setCarritoAbierto(true)}
        className="fixed bottom-8 right-8 z-50 bg-[#CD6C50] hover:bg-[#b85a42] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 transition"
        style={{ boxShadow: "0 4px 24px rgba(205,108,80,.25)" }}
        title="Ver carrito"
      >
        <ShoppingCart className="w-7 h-7" />
        {itemsCarrito.length > 0 && (
          <span className="bg-white text-[#CD6C50] font-bold text-sm rounded-full px-2 py-1 ml-1 shadow">
            {itemsCarrito.reduce((acc, item) => acc + item.cantidad, 0)}
          </span>
        )}
      </button>
    </div>
  );
};

export default Catalogo;
