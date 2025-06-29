import React, { useState } from "react";
import { LogIn, UserPlus, Menu, X } from "lucide-react";

interface NavbarInvitadoProps {
  onLogin?: () => void;
  onRegister?: () => void;
  onHome?: () => void;
}

export default function NavbarInvitado({
  onLogin,
  onRegister,
  onHome,
}: NavbarInvitadoProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Izquierda: Botones de Autenticación - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onLogin}
              className="flex items-center space-x-1 px-4 py-2 text-[#CD6C50] border border-[#CD6C50] rounded-lg hover:bg-[#CD6C50] hover:text-white transition-all duration-200 font-medium cursor-pointer"
            >
              <LogIn className="h-4 w-4" />
              <span>Iniciar Sesión</span>
            </button>
            <button
              onClick={onRegister}
              className="flex items-center space-x-1 px-4 py-2 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-all duration-200 font-medium cursor-pointer"
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
          <div className="flex-1 flex justify-center">
            <button
              onClick={onHome || (() => (window.location.href = "/"))}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
              aria-label="Ir al inicio"
            >
              <img
                src="/src/assets/logos/Logo-nabvar.png"
                alt="El Buen Sabor"
                className="h-12 w-auto"
              />
            </button>
          </div>

          {/* Derecha: vacío para centrar el logo */}
          <div className="min-w-[180px]"></div>
        </div>

        {/* Menú móvil */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white py-4">
            {/* Botones de autenticación móvil */}
            <div className="space-y-2 mb-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onLogin?.();
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 text-[#CD6C50] border border-[#CD6C50] rounded-lg hover:bg-[#CD6C50] hover:text-white transition-all duration-200 font-medium cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onRegister?.();
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-all duration-200 font-medium cursor-pointer"
              >
                <UserPlus className="h-4 w-4" />
                <span>Registrarse</span>
              </button>
            </div>

            {/* Enlaces adicionales */}
            <div className="pt-2 border-t border-gray-200">
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
