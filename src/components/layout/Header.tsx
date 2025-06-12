import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

// Importar todos los navbars
import NavbarInvitado from "./navbar/NavbarInvitado";
import NavbarCliente from "./navbar/NavbarCliente";
import NavbarCajero from "./navbar/NavbarCajero";
import NavbarDelivery from "./navbar/NavbarDelivery";
import NavbarCocinero from "./navbar/NavbarCocinero";
import NavbarAdmin from "./navbar/NavbarAdmin";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, loading, refreshAuth } = useAuth();

  // Debug: log cuando cambie el estado de autenticación
  useEffect(() => {
    console.log("🔄 Header - Auth state changed:", {
      isAuthenticated,
      userRole: user?.rol,
      pathname: location.pathname,
      loading,
    });
  }, [isAuthenticated, user, location.pathname, loading]);

  // Efecto para detectar cambios en la autenticación y forzar re-render
  useEffect(() => {
    // Re-verificar autenticación cuando cambia la ruta (solo si no está cargando)
    // PERO solo en rutas específicas donde sea necesario
    const protectedRoutes = [
      "/dashboard",
      "/categorias",
      "/insumos",
      "/productos",
      "/stock",
    ];
    const currentRoute = location.pathname;

    if (
      !loading &&
      protectedRoutes.some((route) => currentRoute.startsWith(route))
    ) {
      console.log("🔄 Refreshing auth for protected route:", currentRoute);
      refreshAuth();
    }
  }, [location.pathname]); // Removemos loading y refreshAuth de las dependencias

  // Rutas donde NO debe aparecer ninguna navbar (páginas especiales)
  const noNavbarRoutes = ["/login", "/registro", "/callback"];
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);

  // Si no debe mostrar navbar, retornar null
  if (!shouldShowNavbar) {
    return null;
  }

  // Si está cargando, mostrar navbar básica
  if (loading) {
    return (
      <header>
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img
                  src="/src/assets/logos/Logo-nabvar.png"
                  alt="El Buen Sabor"
                  className="h-8 w-auto"
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="animate-pulse bg-gray-300 h-8 w-20 rounded"></div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    );
  }

  // Funciones comunes para todos los navbars
  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/registro");
  };

  const handleHome = () => {
    navigate("/");
  };

  const handleSearch = (query: string) => {
    console.log("Buscar:", query);
    // Implementar lógica de búsqueda
    // navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    console.log("🚪 Logging out...");
    logout();
    navigate("/");
  };

  // Determinar qué navbar mostrar según el estado de autenticación y rol
  const renderNavbar = () => {
    // Si no está autenticado, mostrar navbar de invitado
    if (!isAuthenticated || !user) {
      return (
        <NavbarInvitado
          onLogin={handleLogin}
          onRegister={handleRegister}
          onHome={handleHome}
          onSearch={handleSearch}
        />
      );
    }

    // Crear objeto de usuario con valores garantizados para los navbars
    const safeUser = {
      email: user.email || "",
      nombre: user.nombre || "Usuario",
      apellido: user.apellido || "",
      imagen: user.imagen || undefined,
      rol: user.rol || "CLIENTE",
      userId: user.userId || 0,
    };

    // Si está autenticado, mostrar navbar según el rol
    const userRole = user.rol?.toUpperCase();

    console.log("🎭 Rendering navbar for role:", userRole);

    switch (userRole) {
      case "ADMINISTRADOR":
      case "ADMIN":
        return (
          <NavbarAdmin
            user={safeUser}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "CAJERO":
        return (
          <NavbarCajero
            user={safeUser}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "DELIVERY":
        return (
          <NavbarDelivery
            user={safeUser}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "COCINERO":
        return (
          <NavbarCocinero
            user={safeUser}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "CLIENTE":
      default:
        return (
          <NavbarCliente
            user={safeUser}
            onLogout={handleLogout}
            onHome={handleHome}
            onSearch={handleSearch}
          />
        );
    }
  };

  return <header>{renderNavbar()}</header>;
};

export default Header;
