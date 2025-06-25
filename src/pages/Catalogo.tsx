import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCatalogoProductos, type ProductoCatalogo } from "../hooks/useCatalogoProductos";
import { Star, Clock, ShoppingCart, Filter, Grid, List } from "lucide-react";
import CarritoModal from "../components/cart/CarritoModal";
import ProductoDetalleModal from "../components/productos/ProductoDetalleModal";
import { useCarritoContext } from "../context/CarritoContext";

const Catalogo: React.FC = () => {
  const { 
    productos, 
    loading, 
    buscarProductos, 
    getCategorias,
    getProductosPorCategoria 
  } = useCatalogoProductos();
  
  const [productosFiltrados, setProductosFiltrados] = useState<ProductoCatalogo[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<number | null>(null);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<'todos' | 'manufacturado' | 'insumo'>('todos');
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState<ProductoCatalogo | null>(null);
  const [vistaGrid, setVistaGrid] = useState(true);
  
  const carrito = useCarritoContext();

  // Aplicar filtros
  useEffect(() => {
    let productosTemp = productos;

    // Filtro por búsqueda
    if (busqueda.trim()) {
      productosTemp = buscarProductos(busqueda);
    }

    // Filtro por categoría
    if (categoriaSeleccionada) {
      productosTemp = productosTemp.filter(p => p.categoria.idCategoria === categoriaSeleccionada);
    }

    // Filtro por tipo
    if (tipoSeleccionado !== 'todos') {
      productosTemp = productosTemp.filter(p => p.tipo === tipoSeleccionado);
    }

    setProductosFiltrados(productosTemp);
  }, [productos, busqueda, categoriaSeleccionada, tipoSeleccionado, buscarProductos]);

  const getProductRating = (producto: ProductoCatalogo) => {
    if (producto.tipo === 'insumo') return 4.5;
    
    const cantidadVendida = producto.cantidadVendida;
    if (cantidadVendida >= 100) return 4.9;
    if (cantidadVendida >= 50) return 4.7;
    if (cantidadVendida >= 20) return 4.5;
    if (cantidadVendida >= 10) return 4.3;
    return 4.0;
  };

  const handleOrderClick = (producto: ProductoCatalogo) => {
    const productoParaCarrito = {
      idArticulo: producto.id,
      denominacion: producto.denominacion,
      descripcion: producto.descripcion,
      precioVenta: producto.precioVenta,
      imagenes: producto.imagenes,
      categoria: producto.categoria,
      tiempoEstimadoEnMinutos: producto.tiempoEstimadoEnMinutos || 0,
      stockSuficiente: producto.stockSuficiente,
      cantidadVendida: producto.cantidadVendida,
      tipo: producto.tipo,
    };
    
    carrito.agregarItem(productoParaCarrito as any);
    setCarritoAbierto(true);
  };

  const handleDetalleClick = (producto: ProductoCatalogo) => {
    setProductoDetalle(producto);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setCategoriaSeleccionada(null);
    setTipoSeleccionado('todos');
  };

  const categorias = getCategorias();

  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Catálogo de Productos</h1>
        <p className="text-gray-600">
          Descubre nuestras comidas preparadas y productos de calidad premium
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar productos
            </label>
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent"
              value={categoriaSeleccionada || ''}
              onChange={(e) => setCategoriaSeleccionada(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Todas las categorías</option>
              {categorias.map(cat => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.denominacion} ({cat.cantidadProductos})
                </option>
              ))}
            </select>
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de producto
            </label>
            <select
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent"
              value={tipoSeleccionado}
              onChange={(e) => setTipoSeleccionado(e.target.value as any)}
            >
              <option value="todos">Todos los tipos</option>
              <option value="manufacturado">Comidas preparadas</option>
              <option value="insumo">Productos premium</option>
            </select>
          </div>

          {/* Vista */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setVistaGrid(true)}
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  vistaGrid 
                    ? 'bg-[#CD6C50] text-white border-[#CD6C50]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-5 h-5 mx-auto" />
              </button>
              <button
                onClick={() => setVistaGrid(false)}
                className={`flex-1 p-3 rounded-lg border transition-colors ${
                  !vistaGrid 
                    ? 'bg-[#CD6C50] text-white border-[#CD6C50]' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <List className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </div>
        </div>

        {/* Filtros activos y limpiar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Filter className="w-4 h-4" />
            <span>
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
            </span>
          </div>
          {(busqueda || categoriaSeleccionada || tipoSeleccionado !== 'todos') && (
            <button
              onClick={limpiarFiltros}
              className="text-sm text-[#CD6C50] hover:text-[#b85a42] font-medium"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Productos */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CD6C50] mx-auto mb-4"></div>
            <span className="text-[#CD6C50] text-xl font-semibold">Cargando productos...</span>
          </div>
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No se encontraron productos</h3>
          <p className="text-gray-500 mb-4">
            Intenta cambiar los filtros o buscar otros términos
          </p>
          <button
            onClick={limpiarFiltros}
            className="bg-[#CD6C50] text-white px-6 py-2 rounded-lg hover:bg-[#b85a42] transition-colors"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className={vistaGrid ? "grid md:grid-cols-3 gap-8" : "space-y-6"}>
          {productosFiltrados.map((producto) => {
            const imagenUrl = producto.imagenes?.[0]?.url ?? null;
            const rating = getProductRating(producto);

            if (!vistaGrid) {
              // Vista de lista
              return (
                <div
                  key={`${producto.tipo}-${producto.id}`}
                  className="bg-white rounded-lg shadow-lg p-6 flex gap-6"
                >
                  <div className="w-32 h-32 flex-shrink-0">
                    {imagenUrl ? (
                      <img
                        src={imagenUrl}
                        alt={producto.denominacion}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center text-2xl text-gray-400">
                        {producto.tipo === 'manufacturado' ? '🍽️' : '🛒'}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">{producto.denominacion}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            producto.tipo === 'manufacturado'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {producto.tipo === 'manufacturado' ? 'Preparado' : 'Producto'}
                          </span>
                          <span className="text-sm text-gray-500">{producto.categoria.denominacion}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-[#CD6C50]">
                          ${producto.precioVenta.toFixed(0)}
                        </div>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{rating}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{producto.descripcion}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {producto.tiempoEstimadoEnMinutos && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {producto.tiempoEstimadoEnMinutos} min
                          </div>
                        )}
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          producto.stockSuficiente 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {producto.stockSuficiente ? 'Disponible' : 'Agotado'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDetalleClick(producto)}
                          className="px-4 py-2 border border-[#CD6C50] text-[#CD6C50] rounded-lg hover:bg-[#f5ebe8] transition-colors"
                        >
                          Ver detalle
                        </button>
                        <button
                          onClick={() => handleOrderClick(producto)}
                          disabled={!producto.stockSuficiente}
                          className={`px-4 py-2 rounded-lg transition-colors ${
                            producto.stockSuficiente
                              ? 'bg-[#CD6C50] text-white hover:bg-[#b85a42]'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {producto.stockSuficiente ? 'Agregar' : 'Agotado'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Vista de grid
            return (
              <div
                key={`${producto.tipo}-${producto.id}`}
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
                      {producto.tipo === 'manufacturado' ? '🍽️' : '🛒'}
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
                  <div className="absolute top-3 left-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      producto.tipo === 'manufacturado'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {producto.tipo === 'manufacturado' ? 'Preparado' : 'Producto'}
                    </span>
                  </div>
                  {producto.tiempoEstimadoEnMinutos && (
                    <div className="absolute bottom-3 left-3">
                      <div className="bg-black bg-opacity-70 text-white px-2 py-1 rounded-lg text-sm flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {producto.tiempoEstimadoEnMinutos} min
                      </div>
                    </div>
                  )}
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
                    {producto.descripcion}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 mb-4">
                    <span className="bg-gray-100 px-2 py-1 rounded">
                      {producto.categoria.denominacion}
                    </span>
                    {producto.tipo === 'manufacturado' && (
                      <span className="ml-2">{producto.cantidadVendida} vendidos</span>
                    )}
                    {producto.tipo === 'insumo' && (
                      <span className="ml-2">Stock: {producto.stockActual}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-2xl font-bold text-[#CD6C50]">
                      ${producto.precioVenta.toFixed(0)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDetalleClick(producto)}
                        className="px-3 py-2 border border-[#CD6C50] text-[#CD6C50] rounded-lg hover:bg-[#f5ebe8] transition-colors text-sm"
                      >
                        Detalle
                      </button>
                      <button
                        onClick={() => handleOrderClick(producto)}
                        disabled={!producto.stockSuficiente}
                        className={`px-4 py-2 rounded-lg transition-colors text-sm ${
                          producto.stockSuficiente
                            ? 'bg-[#CD6C50] text-white hover:bg-[#b85a42]'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {producto.stockSuficiente ? 'Pedir' : 'Agotado'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modales */}
      <CarritoModal
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
      />

      <ProductoDetalleModal
        producto={productoDetalle}
        abierto={!!productoDetalle}
        onCerrar={() => setProductoDetalle(null)}
        onAgregarCarrito={handleOrderClick}
      />

      {/* Botón flotante carrito */}
      <button
        onClick={() => setCarritoAbierto(true)}
        className="fixed bottom-8 right-8 z-50 bg-[#CD6C50] hover:bg-[#b85a42] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 transition"
        style={{ boxShadow: "0 4px 24px rgba(205,108,80,.25)" }}
        title="Ver carrito"
      >
        <ShoppingCart className="w-7 h-7" />
        {carrito.cantidadTotal > 0 && (
          <span className="bg-white text-[#CD6C50] font-bold text-sm rounded-full px-2 py-1 ml-1 shadow">
            {carrito.cantidadTotal}
          </span>
        )}
      </button>
    </div>
  );
};

export default Catalogo;