import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
// Importar todos los navbars
import NavbarInvitado from "./navbar/NavbarInvitado";
import NavbarCliente from "./navbar/NavbarCliente";
import NavbarCajero from "./navbar/NavbarCajero";
import NavbarDelivery from "./navbar/NavbarDelivery";
import NavbarCocinero from "./navbar/NavbarCocinero";
import NavbarAdmin from "./navbar/NavbarAdmin";

interface UserData {
  nombre: string;
  apellido: string;
  email: string;
  rol?: string;
  imagen?: {
    url: string;
    denominacion: string;
  };
}

interface ExtendedUserData extends UserData {
  telefono?: string;
  fechaNacimiento?: string | null;
  domicilios?: any[];
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // CRÍTICO: Todos los hooks deben ejecutarse ANTES de cualquier return
  const { isAuthenticated, isLoading, user, backendUser, logout } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(false);

  // Escuchar cambios del perfil de usuario
  useEffect(() => {
    const handleProfileUpdate = () => {
      setForceUpdate((prev) => !prev);
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  // Rutas donde NO debe aparecer ninguna navbar
  const noNavbarRoutes = ["/login", "/registro", "/callback"];
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);

  // Funciones helper (después de todos los hooks)
  const handleLogin = () => navigate("/login");
  const handleRegister = () => navigate("/registro");
  const handleSearch = (query: string) => {
    console.log("Buscar:", query);
    // Implementar lógica de búsqueda si es necesario
  };
  const handleLogout = () => logout();

  // Función helper para obtener el rol del usuario
  const getUserRole = (): string => {
    return (
      backendUser?.usuario?.rol ||
      backendUser?.rol ||
      "CLIENTE"
    ).toUpperCase();
  };

  const handleHome = () => {
    const userRole = getUserRole();
    if (isAuthenticated && userRole === "DELIVERY") {
      navigate("/delivery");
    } else {
      navigate("/");
    }
  };

  // Función helper para crear datos de usuario optimizada
  const createUserData = (): UserData => {
    // Priorizar datos del backend si son válidos
    if (
      backendUser?.nombre &&
      !backendUser.nombre.includes("@") &&
      backendUser.nombre !== "Usuario"
    ) {
      return {
        nombre: backendUser.nombre,
        apellido: backendUser.apellido || "",
        email: backendUser.email || (user as any)?.email || "",
        rol: getUserRole(),
        imagen: backendUser.imagen,
      };
    }

    // Fallback a datos de Auth0
    const auth0User = user as any; // Type assertion para acceder a propiedades de Auth0
    return {
      nombre:
        auth0User?.given_name || auth0User?.name?.split(" ")[0] || "Usuario",
      apellido:
        auth0User?.family_name ||
        auth0User?.name?.split(" ").slice(1).join(" ") ||
        "",
      email: auth0User?.email || "",
      rol: getUserRole(),
      imagen: undefined,
    };
  };

  // Función helper para crear datos extendidos
  const createExtendedUserData = (): ExtendedUserData => {
    const baseData = createUserData();
    return {
      ...baseData,
      telefono: backendUser?.telefono || "",
      fechaNacimiento: backendUser?.fechaNacimiento || null,
      domicilios: backendUser?.domicilios || [],
    };
  };

  // Renderizar navbar según autenticación y rol
  const renderNavbar = () => {
    if (!isAuthenticated || (!backendUser && !user)) {
      return (
        <NavbarInvitado
          onLogin={handleLogin}
          onRegister={handleRegister}
          onHome={handleHome}
          onSearch={handleSearch}
        />
      );
    }

    const userData = createUserData();
    const userRole = getUserRole();

    switch (userRole) {
      case "ADMINISTRADOR":
      case "ADMIN":
        return (
          <NavbarAdmin
            user={userData}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "CAJERO":
        return (
          <NavbarCajero
            user={userData}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "DELIVERY":
        return (
          <NavbarDelivery
            user={userData}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "COCINERO":
        return (
          <NavbarCocinero
            user={userData}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "CLIENTE":
      default:
        return (
          <NavbarCliente
            user={createExtendedUserData()}
            onLogout={handleLogout}
            onHome={handleHome}
            onSearch={handleSearch}
          />
        );
    }
  };

  // IMPORTANTE: Todos los returns condicionales deben estar AL FINAL
  if (!shouldShowNavbar) {
    return null;
  }

  if (isLoading) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center">
            <div className="animate-pulse flex items-center space-x-4">
              <div className="h-8 w-32 bg-gray-300 rounded"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
              <div className="h-6 w-16 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return <header>{renderNavbar()}</header>;
};

export default Header;