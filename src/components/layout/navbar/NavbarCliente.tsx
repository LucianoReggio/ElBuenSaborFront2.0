import React, { useState, useEffect, useRef } from "react";
import { Search, User, LogOut, ShoppingCart, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CarritoModal from "../../cart/CarritoModal";

interface CarritoItem {
  id: number;
  nombre: string;
  cantidad: number;
  precio: number;
}

interface NavbarClienteProps {
  user?: {
    nombre: string;
    apellido: string;
    email: string;
    rol?: string;
    imagen?: {
      url: string;
      denominacion: string;
    };
  };
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onHome?: () => void;
  carritoItems?: CarritoItem[];
  cantidadCarrito?: number;
}

export default function NavbarCliente({
  user,
  onLogout,
  onSearch,
  onHome,
  carritoItems = [],
  cantidadCarrito = 0,
}: NavbarClienteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCarritoModalOpen, setIsCarritoModalOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const formatRole = (role?: string) => {
    const roleMap: { [key: string]: string } = {
      ADMIN: "Administrador",
      ADMINISTRADOR: "Administrador",
      CAJERO: "Cajero",
      DELIVERY: "Delivery",
      COCINERO: "Cocinero",
      CLIENTE: "Cliente",
    };
    return roleMap[role?.toUpperCase() || ""] || "Cliente";
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleCarritoClick = () => setIsCarritoModalOpen(true);
  const handleCerrarCarrito = () => setIsCarritoModalOpen(false);

  const handleMiPerfil = () => {
    setIsUserMenuOpen(false);
    navigate("/mi-perfil");
  };

  const handleMisPedidos = () => {
    setIsUserMenuOpen(false);
    navigate("/mis-pedidos");
  };

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    onLogout?.();
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Izquierda: Usuario */}
            <div className="flex items-center space-x-4">
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded-full transition-colors duration-200"
                    aria-label="Menú de usuario"
                  >
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
                      {user.imagen?.url ? (
                        <img
                          src={user.imagen.url}
                          alt={`${user.nombre} ${user.apellido}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-700">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-xs text-[#CD6C50] font-semibold">
                        {formatRole(user.rol)}
                      </div>
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          {user.nombre} {user.apellido}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-[#CD6C50] font-semibold mt-1">
                          {formatRole(user.rol)}
                        </p>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={handleMiPerfil}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <User className="mr-3 h-4 w-4" />
                          Mi Perfil
                        </button>
                        <button
                          onClick={handleMisPedidos}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <Package className="mr-3 h-4 w-4" />
                          Mis Pedidos
                        </button>

                        <div className="border-t border-gray-200 my-1"></div>

                        <div className="px-4 py-2 text-xs text-gray-500 bg-gray-50 mx-2 rounded">
                          💡 Los cambios de permisos se aplicarán en tu próximo
                          inicio de sesión
                        </div>

                        <div className="border-t border-gray-200 my-1"></div>

                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          Cerrar Sesión
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Centro: Logo */}
            <div className="flex items-center justify-center">
              <button
                onClick={onHome || (() => (window.location.href = "/"))}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
                aria-label="Ir al inicio"
              >
                <img
                  src="/src/assets/logos/Logo-nabvar.png"
                  alt="El Buen Sabor"
                  className="h-12 w-auto"
                />
              </button>
            </div>

            {/* Derecha: Búsqueda y Carrito */}
            <div className="flex items-center space-x-2">
              {/* Búsqueda en Desktop */}
              <form onSubmit={handleSearch} className="hidden md:flex relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué se te antoja?"
                  className="w-64 pl-4 pr-12 py-2 border border-[#CD6C50] rounded-full focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-[#CD6C50] hover:bg-[#CD6C50] hover:text-white rounded-full transition-all duration-200"
                  aria-label="Buscar"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>

              {/* Botón de búsqueda móvil */}
              <button
                className="md:hidden p-2 text-[#CD6C50] hover:bg-gray-50 rounded-md transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Abrir búsqueda móvil"
              >
                <Search className="h-6 w-6" />
              </button>

              {/* Carrito */}
              <button
                onClick={handleCarritoClick}
                className="flex items-center space-x-2 px-3 py-2 bg-[#CD6C50] bg-opacity-10 text-[#CD6C50] rounded-lg hover:bg-[#CD6C50] hover:bg-opacity-20 transition-colors duration-200 relative"
                aria-label="Carrito de compras"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden lg:block text-sm font-medium">
                  Carrito
                </span>
                {cantidadCarrito > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {cantidadCarrito}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Menú Móvil */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white py-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="¿Qué se te antoja?"
                  className="w-full pl-4 pr-12 py-3 border border-[#CD6C50] rounded-full focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent text-gray-700 placeholder-gray-400"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-[#CD6C50] hover:bg-[#CD6C50] hover:text-white rounded-full transition-all duration-200"
                  aria-label="Buscar"
                >
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>
          )}
        </div>
      </nav>

      {/* Modal del Carrito */}
      <CarritoModal
        abierto={isCarritoModalOpen}
        onCerrar={handleCerrarCarrito}
      />
    </>
  );
}
