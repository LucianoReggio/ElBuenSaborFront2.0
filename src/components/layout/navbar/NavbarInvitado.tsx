import React, { useState } from "react";
import { LogIn, Menu, X } from "lucide-react";

interface NavbarInvitadoProps {
  onAuth?: () => void; // 🔧 Función unificada
  onGoogleAuth?: () => void;
  onHome?: () => void;
}

export default function NavbarInvitado({
  onAuth,
  onGoogleAuth,
  onHome,
}: NavbarInvitadoProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Izquierda: Botón Unificado - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={onAuth}
              className="flex items-center space-x-2 px-6 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-all duration-200 font-medium cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <LogIn className="h-5 w-5" />
              <span>Entrar</span>
            </button>

            {/* Divider */}
            <div className="text-gray-400 text-sm">o</div>

            {/* Botón Google */}
            <button
              onClick={onGoogleAuth}
              className="flex items-center space-x-2 px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 font-medium cursor-pointer shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Google</span>
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
            <div className="space-y-3 mb-4">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onAuth?.();
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-[#CD6C50] text-white rounded-lg hover:bg-[#b85a42] transition-all duration-200 font-medium cursor-pointer"
              >
                <LogIn className="h-5 w-5" />
                <span>Entrar</span>
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">o</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onGoogleAuth?.();
                }}
                className="flex items-center justify-center space-x-2 w-full px-4 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition-all duration-200 font-medium cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continuar con Google</span>
              </button>
            </div>

            {/* Info explicativa */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800 text-center">
                🚀 <strong>Nuevo usuario:</strong> Te guiaremos para crear tu
                cuenta
                <br />
                👋 <strong>Ya tienes cuenta:</strong> Accede directamente
                <br />
                🔒 <strong>Seguro y rápido</strong> con Auth0
              </p>
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
