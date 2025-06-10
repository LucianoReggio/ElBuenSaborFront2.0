import React, { useState, useEffect, useRef } from 'react';
import { Search, User, LogOut, Settings, ShoppingCart } from 'lucide-react';

interface NavbarClienteProps {
  user?: {
    nombre: string;
    apellido: string;
    email: string;
    imagen?: {
      url: string;
      denominacion: string;
    };
  };
  onLogout?: () => void;
  onSearch?: (query: string) => void;
  onHome?: () => void;
}

export default function NavbarCliente({ 
  user, 
  onLogout, 
  onSearch,
  onHome
}: NavbarClienteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Izquierda: Menú y Carrito */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-[#CD6C50] hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <button className="p-2 text-[#CD6C50] hover:bg-gray-50 rounded-md transition-colors duration-200 relative">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>

            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-1 hover:bg-gray-50 rounded-full transition-colors duration-200"
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
                  <span className="hidden md:block text-sm font-medium text-gray-700">
                    {user.nombre} {user.apellido}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.nombre} {user.apellido}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                        <User className="mr-3 h-4 w-4" />
                        Mi Perfil
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                        <ShoppingCart className="mr-3 h-4 w-4" />
                        Mis Pedidos
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                        <Settings className="mr-3 h-4 w-4" />
                        Configuración
                      </button>
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onLogout?.();
                        }}
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
              onClick={onHome || (() => window.location.href = '/')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
            >
              <img 
                src="/src/assets/logos/Logo-nabvar.png" 
                alt="El Buen Sabor - Logo" 
                className="h-12 w-auto"
              />
            </button>
          </div>

          {/* Derecha: Búsqueda */}
          <div className="flex items-center">
            <div className="hidden md:flex relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                placeholder="¿Qué se te antoja?"
                className="w-80 pl-4 pr-12 py-2 border border-[#CD6C50] rounded-full focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-[#CD6C50] hover:bg-[#CD6C50] hover:text-white rounded-full transition-all duration-200"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            <button
              className="md:hidden p-2 text-[#CD6C50] hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Search className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Menú Móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white py-4">
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
                  placeholder="¿Qué se te antoja?"
                  className="w-full pl-4 pr-12 py-3 border border-[#CD6C50] rounded-full focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent text-gray-700 placeholder-gray-400"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-[#CD6C50] hover:bg-[#CD6C50] hover:text-white rounded-full transition-all duration-200"
                >
                  <Search className="h-5 w-5" />
                </button>
              </div>
            </div>

            {user && (
              <div className="space-y-2">
                <div className="px-4 py-3 border-b border-gray-200">
                  <p className="font-medium text-gray-900">{user.nombre} {user.apellido}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center">
                  <User className="mr-3 h-5 w-5" />
                  Mi Perfil
                </button>
                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center">
                  <ShoppingCart className="mr-3 h-5 w-5" />
                  Mis Pedidos
                </button>
                <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg flex items-center">
                  <Settings className="mr-3 h-5 w-5" />
                  Configuración
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center"
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}