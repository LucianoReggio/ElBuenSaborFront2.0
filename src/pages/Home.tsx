import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Star, Clock, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const featuredProducts = [
    {
      id: 1,
      name: "Hamburguesa Clásica",
      description: "Carne jugosa, lechuga, tomate, cebolla y nuestra salsa especial",
      price: "$2,500",
      rating: 4.8
    },
    {
      id: 2,
      name: "Pizza Margherita",
      description: "Masa artesanal, tomate, mozzarella y albahaca fresca",
      price: "$3,200",
      rating: 4.9
    },
    {
      id: 3,
      name: "Empanadas Criollas",
      description: "Tradicionales empanadas argentinas con carne cortada a cuchillo",
      price: "$800",
      rating: 4.7
    }
  ];

  const handleOrderClick = () => {
    if (isAuthenticated) {
      // Si está autenticado, ir al catálogo o carrito
      navigate('/catalogo');
    } else {
      // Si no está autenticado, mostrar modal de login
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#CD6C50] to-[#b85a42] text-white">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
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
            <button
              onClick={handleOrderClick}
              className="bg-white text-[#CD6C50] px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              {isAuthenticated ? 'Ver Menú' : 'Pedir Ahora'}
            </button>
          </div>
        </div>
        
        {/* Decorative wave */}
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

          <div className="grid md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 bg-[#CD6C50] rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white text-2xl font-bold">{product.name[0]}</span>
                    </div>
                    <p className="text-gray-600 text-sm">Imagen del producto</p>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{product.name}</h3>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600 ml-1">{product.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#CD6C50]">{product.price}</span>
                    <button
                      onClick={handleOrderClick}
                      className="bg-[#CD6C50] text-white px-4 py-2 rounded-lg hover:bg-[#b85a42] transition-colors duration-200"
                    >
                      Pedir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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

     
    </div>
  );
};

export default Home;