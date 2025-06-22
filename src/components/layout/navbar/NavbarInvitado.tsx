import React, { useState } from "react";
import { Search } from "lucide-react";

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
          {/* Izquierda: Botones de Autenticación */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onLogin}
              className="px-6 py-2 text-[#CD6C50] border border-[#CD6C50] rounded-full hover:bg-[#CD6C50] hover:text-white transition-all duration-200 focus:ring-2 focus:ring-[#CD6C50] focus:ring-offset-2 font-medium"
            >
              Ingresar
            </button>
            <button
              onClick={onRegister}
              className="px-6 py-2 bg-[#CD6C50] text-white rounded-full hover:bg-[#b85a42] transition-all duration-200 focus:ring-2 focus:ring-[#CD6C50] focus:ring-offset-2 font-medium"
            >
              Registrarse
            </button>
          </div>

          {/* Centro: Logo */}
          <div className="flex items-center justify-center">
            <button
              onClick={onHome || (() => (window.location.href = "/"))}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
            >
              <img
                src="/src/assets/logos/Logo-nabvar.png"
                alt="El Buen Sabor - Logo"
                className="h-12 w-auto"
              />
            </button>
          </div>

          {/* Derecha: Barra de Búsqueda */}
          <div className="flex items-center">
            <div className="hidden md:flex relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
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
                  onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
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

            <div className="space-y-3">
              <button
                onClick={onLogin}
                className="w-full py-3 text-[#CD6C50] border border-[#CD6C50] rounded-full hover:bg-[#CD6C50] hover:text-white transition-all duration-200 font-medium"
              >
                Ingresar
              </button>
              <button
                onClick={onRegister}
                className="w-full py-3 bg-[#CD6C50] text-white rounded-full hover:bg-[#b85a42] transition-all duration-200 font-medium"
              >
                Registrarse
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
