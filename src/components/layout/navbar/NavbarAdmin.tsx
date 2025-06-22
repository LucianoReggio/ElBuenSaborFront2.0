import { useState, useEffect, useRef } from "react";
import {
  User,
  LogOut,
  Settings,
  BarChart3,
  Users,
  Package,
  ChefHat,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RefreshPermissionsButton } from "../../common/RefreshPermissionsButton";

interface NavbarAdminProps {
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
  onHome?: () => void;
}

export default function NavbarAdmin({
  user,
  onLogout,
  onHome,
}: NavbarAdminProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
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

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Izquierda: Menú y Usuario */}
          <div className="flex items-center space-x-4">
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
                    Administrador
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">
                        {user.nombre} {user.apellido}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      <p className="text-xs text-purple-600 font-semibold">
                        Administrador
                      </p>
                    </div>
                    <div className="py-1">
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                        <User className="mr-3 h-4 w-4" />
                        Mi Perfil
                      </button>
                      <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                        <Settings className="mr-3 h-4 w-4" />
                        Configuración del Sistema
                      </button>
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

          {/* Derecha: Opciones de Admin */}
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors duration-200">
              <Package className="h-4 w-4" />
              <span className="hidden lg:block text-sm font-medium">
                Listado Pedidos
              </span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors duration-200">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden lg:block text-sm font-medium">
                Informes
              </span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200">
              <Users className="h-4 w-4" />
              <span className="hidden lg:block text-sm font-medium">
                Usuarios
              </span>
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
            >
              <ChefHat className="h-4 w-4" />
              <span className="hidden lg:block text-sm font-medium">
                Cocina
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
