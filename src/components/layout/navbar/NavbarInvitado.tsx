import React, { useState } from "react";
import { Search, LogIn, UserPlus, Menu, X } from "lucide-react";

interface NavbarInvitadoProps {
  onLogin?: () => void;
  onRegister?: () => void;
  onSearch?: (query: string) => void;
  onHome?: () => void;
}

export default function NavbarInvitado({
  onLogin,
  onRegister,
  onSearch,
  onHome,
}: NavbarInvitadoProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
          {/* Izquierda: Botones de Autenticación - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onLogin}
              className="flex items-center space-x-1 px-4 py-2 text-[#CD6C50] border border-[#CD6C50] rounded-lg hover:bg-[#CD6C50] hover:text-white transition-all duration-200 font-medium"
            >
              <LogIn className="h-4 w-4" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              onClick={onRegister}
              className="flex items-center space-x-1 px-4 py-2 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-all duration-200 font-medium"
            >
              <UserPlus className="h-4 w-4" />
              <span>Registrarse</span>
            </button>
          </div>

          {/* Izquierda: Menú móvil */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 text-gray-600 hover:text-[#CD6C50] transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menú"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
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

          {/* Derecha: Búsqueda */}
          <div className="flex items-center">
            {/* Búsqueda - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="¿Qué se te antoja?"
                className="w-80 pl-4 pr-12 py-2 border border-[#CD6C50] rounded-full focus:ring-2 focus:ring-[#CD6C50] focus:border-transparent transition-all duration-200 text-gray-700 placeholder-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 text-[#CD6C50] hover:bg-[#CD6C50] hover:text-white rounded-full transition-all duration-200"
                aria-label="Buscar"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>

            {/* Búsqueda móvil */}
            <button
              className="md:hidden p-2 text-[#CD6C50] hover:bg-gray-50 rounded-md"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Buscar"
            >
              <Search className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white py-4">
            {/* Búsqueda móvil */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
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
              </div>
            </form>

            {/* Botones de autenticación móvil */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogin?.();
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-[#CD6C50] border border-[#CD6C50] rounded-lg hover:bg-[#CD6C50] hover:text-white transition-all duration-200 font-medium"
              >
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onRegister?.();
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-all duration-200 font-medium"
              >
                <UserPlus className="h-4 w-4" />
                <span>Registrarse</span>
              </button>
            </div>

            {/* Enlaces adicionales */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <a
                href="/catalogo"
                className="block px-4 py-2 text-gray-700 hover:text-[#CD6C50] hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Catálogo
              </a>
              <a
                href="/"
                className="block px-4 py-2 text-gray-700 hover:text-[#CD6C50] hover:bg-gray-50 rounded-lg transition-colors duration-200"
              >
                Inicio
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
