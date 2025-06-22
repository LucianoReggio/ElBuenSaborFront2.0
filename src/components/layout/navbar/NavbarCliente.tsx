import React, { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Search,
  User,
  LogOut,
  Settings,
  ShoppingCart,
  RefreshCw,
} from "lucide-react";
import CarritoModal from "../../cart/CarritoModal";
import { useAuth } from "../../../hooks/useAuth"; // ← AGREGAR IMPORT
import { RefreshPermissionsButton } from "../../common/RefreshPermissionsButton";

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
  const [isRefreshing, setIsRefreshing] = useState(false); // ← NUEVO STATE
  const userMenuRef = useRef<HTMLDivElement>(null);

  // ← AGREGAR HOOK useAuth
  const { getAccessTokenSilently } = useAuth0();
  const { refreshRoles, shouldRefreshRoles } = useAuth();

  // NUEVA: Función para formatear el rol
  const formatRole = (role?: string) => {
    if (!role) return "Cliente";

    switch (role.toUpperCase()) {
      case "ADMIN":
      case "ADMINISTRADOR":
        return "Administrador";
      case "CAJERO":
        return "Cajero";
      case "DELIVERY":
        return "Delivery";
      case "COCINERO":
        return "Cocinero";
      case "CLIENTE":
      default:
        return "Cliente";
    }
  };

  // ← FUNCIÓN CON UX MEJORADA para mensajes más claros
  const handleRefreshRoles = async () => {
    try {
      setIsRefreshing(true);
      console.log("🔄 Actualizando permisos...");

      const result = await refreshRoles();

      if (result.success) {
        if (result.roleChanged) {
          // Rol cambió - notificar y recargar página
          const message =
            result.oldRole && result.newRole
              ? `✅ ¡Rol actualizado!\n\n${result.oldRole} → ${result.newRole}\n\nLa página se recargará para aplicar los cambios.`
              : `✅ Permisos actualizados.\n\nLa página se recargará para aplicar los cambios.`;

          alert(message);
          setTimeout(() => window.location.reload(), 1000);
        } else {
          // No cambió - confirmación simple
          alert("ℹ️ Tus permisos ya están actualizados.");
        }
      } else if (result.requiresRelogin) {
        // Auth0 requiere re-autenticación (comportamiento normal para cambios de rol)
        const shouldRelogin = window.confirm(
          `🔄 Para aplicar cambios de rol, Auth0 requiere que hagas login nuevamente.\n\nEsto es normal por seguridad cuando se modifican permisos.\n\n¿Proceder con el login?`
        );

        if (shouldRelogin) {
          // Mostrar mensaje de progreso antes del logout
          alert("🔄 Redirigiendo a login para aplicar nuevos permisos...");
          setTimeout(() => {
            onLogout?.();
          }, 500);
        }
      } else {
        // Error que requiere retry
        const shouldRetry = window.confirm(
          `❌ ${
            result.message || "Error actualizando permisos"
          }\n\n¿Quieres intentar nuevamente?`
        );

        if (shouldRetry) {
          setTimeout(() => handleRefreshRoles(), 1000);
        }
      }
    } catch (error: any) {
      console.error("❌ Error refreshing roles:", error);

      // Error inesperado
      const shouldRelogin = window.confirm(
        `❌ Error inesperado: ${
          error.message || "Error desconocido"
        }\n\n¿Quieres hacer login nuevamente para aplicar posibles cambios?`
      );

      if (shouldRelogin) {
        onLogout?.();
      }
    } finally {
      setIsRefreshing(false);
    }
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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleCarritoClick = () => {
    setIsCarritoModalOpen(true);
  };

  const handleCerrarCarrito = () => {
    setIsCarritoModalOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Izquierda: Menú y Carrito */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCarritoClick}
                className="p-2 text-[#CD6C50] hover:bg-gray-50 rounded-md transition-colors duration-200 relative"
              >
                <ShoppingCart className="h-6 w-6" />
                {cantidadCarrito > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cantidadCarrito}
                  </span>
                )}
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
                    <div className="hidden md:block text-left">
                      <div className="text-sm font-medium text-gray-700">
                        {user.nombre} {user.apellido}
                      </div>
                      {/* NUEVO: Mostrar rol debajo del nombre */}
                      <div className="text-xs text-[#CD6C50] font-medium">
                        {formatRole(user.rol)}
                        {/* ← INDICADOR si necesita refresh */}
                        {shouldRefreshRoles() && (
                          <span
                            className="ml-1 text-orange-500"
                            title="Token antiguo, considera actualizar permisos"
                          >
                            ⚠️
                          </span>
                        )}
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
                        {/* NUEVO: Mostrar rol en el dropdown también */}
                        <p className="text-xs text-[#CD6C50] font-medium mt-1">
                          {formatRole(user.rol)}
                          {shouldRefreshRoles() && (
                            <span
                              className="ml-1 text-orange-500"
                              title="Token antiguo"
                            >
                              ⚠️
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="py-1">
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                          <User className="mr-3 h-4 w-4" />
                          Mi Perfil
                        </button>
                        <button
                          onClick={() =>
                            (window.location.href = "/mis-pedidos")
                          }
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <ShoppingCart className="mr-3 h-4 w-4" />
                          Mis Pedidos
                        </button>
                        <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                          <Settings className="mr-3 h-4 w-4" />
                          Configuración
                        </button>
                        {/* ← NUEVO BOTÓN DE REFRESH ROLES */}
                        <div className="border-t border-gray-200 my-1"></div>
                        <RefreshPermissionsButton onLogout={onLogout} />

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

            {/* Derecha: Búsqueda */}
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
