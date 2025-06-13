import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useProductos } from '../hooks/useProductos';
import { Star, Clock, MapPin, Phone, Mail, ShoppingCart } from 'lucide-react';
import CarritoModal from '../components/cart/CarritoModal';
import type { ArticuloManufacturadoResponseDTO } from '../types/productos/ArticuloManufacturadoResponseDTO';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { productos, loading } = useProductos();

  const [featuredProducts, setFeaturedProducts] = useState<ArticuloManufacturadoResponseDTO[]>([]);
  
  // Carrito
  const [carritoAbierto, setCarritoAbierto] = useState(false);
  const [itemsCarrito, setItemsCarrito] = useState<
    { id: number; nombre: string; cantidad: number; precio: number }[]
  >([]);

  // Debug imagen header
  useEffect(() => {
    const img = new Image();
    img.onload = () => console.log('✅ Imagen cargada correctamente');
    img.onerror = () => console.error('❌ Error al cargar la imagen desde /Header.jpg');
    img.src = '/Header.jpg';
  }, []);

  // Productos destacados
  useEffect(() => {
    if (productos.length > 0) {
      const destacados = productos
        .filter(p => p.stockSuficiente)
        .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
        .slice(0, 3);
      setFeaturedProducts(destacados);
    }
  }, [productos]);

  // Imagen producto
  const getProductImage = (producto: ArticuloManufacturadoResponseDTO) =>
    producto.imagenes && producto.imagenes.length > 0 ? producto.imagenes[0].url : null;

  // Color por categoría
  const getCategoryColor = (categoriaId: number) => {
    const colors = [
      'from-orange-100 to-orange-200',
      'from-blue-100 to-blue-200',
      'from-green-100 to-green-200',
      'from-purple-100 to-purple-200',
      'from-red-100 to-red-200',
      'from-yellow-100 to-yellow-200',
    ];
    return colors[categoriaId % colors.length];
  };

  // Rating
  const getProductRating = (cantidadVendida: number) => {
    if (cantidadVendida >= 100) return 4.9;
    if (cantidadVendida >= 50) return 4.7;
    if (cantidadVendida >= 20) return 4.5;
    if (cantidadVendida >= 10) return 4.3;
    return 4.0;
  };

  // Agregar producto al carrito y abrir modal
  const handleOrderClick = (producto: ArticuloManufacturadoResponseDTO) => {
    if (!producto.stockSuficiente) return;
    setItemsCarrito((itemsPrev) => {
      const existe = itemsPrev.find((item) => item.id === producto.idArticulo);
      if (existe) {
        return itemsPrev.map((item) =>
          item.id === producto.idArticulo
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white min-h-[500px]">
        <img 
          src="/Header.jpg" 
          alt="Header background"
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 z-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              ¡Bienvenido a El Buen Sabor!
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Las mejores comidas caseras con el sabor de siempre
            </p>
            {isAuthenticated && user && (
              <p className="text-lg mb-8 opacity-80">
                Hola {user.nombre || user.email}, ¿qué se te antoja hoy?
              </p>
            )}
            {/* Puedes dejar esto como acceso directo al catálogo */}
            <button
              onClick={() => navigate('/catalogo')}
              className="bg-white text-[#CD6C50] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {isAuthenticated ? 'Ver Menú' : 'Pedir Ahora'}
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 fill-gray-50">
            <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z"></path>
          </svg>
        </div>
      </section>

      {/* Productos Destacados */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Nuestras Especialidades
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Platos preparados con ingredientes frescos y mucho amor
            </p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-8 w-20 bg-gray-200 rounded"></div>
                      <div className="h-8 w-16 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No hay productos disponibles en este momento
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {featuredProducts.map((producto) => {
                const imagenUrl = getProductImage(producto);
                const rating = getProductRating(producto.cantidadVendida);
                
                return (
                  <div key={producto.idArticulo} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                    <div className="h-48 relative overflow-hidden">
                      {imagenUrl ? (
                        <img 
                          src={imagenUrl} 
                          alt={producto.denominacion}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      ) : null}
                      <div className={`${imagenUrl ? 'hidden' : ''} w-full h-full bg-gradient-to-br ${getCategoryColor(producto.categoria.idCategoria)} flex items-center justify-center`}>
                        <div className="text-center p-8">
                          <div className="w-16 h-16 bg-[#CD6C50] rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-white text-2xl font-bold">
                              {producto.denominacion.charAt(0)}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {producto.categoria.denominacion}
                          </p>
                        </div>
                      </div>
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
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xl font-semibold text-gray-800 truncate">
                          {producto.denominacion}
                        </h3>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-gray-600 ml-1">{rating}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                        {producto.descripcion || `Delicioso ${producto.denominacion} preparado con ingredientes frescos`}
                      </p>
                      <div className="flex items-center text-xs text-gray-500 mb-4">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {producto.categoria.denominacion}
                        </span>
                        <span className="ml-2">
                          {producto.cantidadVendida} vendidos
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
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
        </div>
      </section>

      {/* Información del Restaurante */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Sobre El Buen Sabor
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Desde hace más de 10 años, nos dedicamos a preparar las mejores comidas caseras 
                con ingredientes frescos y recetas tradicionales que han pasado de generación en generación.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Nuestro compromiso es ofrecerte siempre la mejor calidad y el mejor sabor, 
                porque sabemos que la buena comida alimenta el alma.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#CD6C50] mb-2">10+</div>
                  <div className="text-gray-600">Años de experiencia</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#CD6C50] mb-2">5000+</div>
                  <div className="text-gray-600">Clientes satisfechos</div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl p-8 text-center">
              <div className="w-32 h-32 bg-[#CD6C50] rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-4xl font-bold">EB</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">El Buen Sabor</h3>
              <p className="text-gray-600">Comida casera con amor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Horarios y Contacto */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Información de Contacto
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Horarios */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-[#CD6C50] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Horarios</h3>
              <div className="space-y-2 text-gray-600">
                <div>Lunes a Viernes: 11:00 - 23:00</div>
                <div>Sábados: 11:00 - 00:00</div>
                <div>Domingos: 12:00 - 22:00</div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-[#CD6C50] rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Ubicación</h3>
              <div className="space-y-2 text-gray-600">
                <div>Av. Principal 123</div>
                <div>Centro, Mendoza</div>
                <div>Argentina</div>
              </div>
            </div>

            {/* Contacto */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <div className="w-16 h-16 bg-[#CD6C50] rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Contacto</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex items-center justify-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +54 261 123-4567
                </div>
                <div className="flex items-center justify-center">
                  <Mail className="w-4 h-4 mr-2" />
                  info@elbuensabor.com
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carrito Modal */}
      <CarritoModal
        abierto={carritoAbierto}
        onCerrar={() => setCarritoAbierto(false)}
        items={itemsCarrito}
      />

      {/* Botón flotante carrito */}
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

export default Home;
