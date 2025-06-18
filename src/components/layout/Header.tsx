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

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading, user, backendUser, logout } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(false);

  // Debug: log cuando cambie el estado de autenticación
  useEffect(() => {
    console.log("🔄 Header - Auth state changed:", {
      isAuthenticated,
      isLoading,
      backendUser: backendUser
        ? {
            nombre: backendUser.nombre,
            apellido: backendUser.apellido,
            email: backendUser.email,
          }
        : null,
      auth0User: user
        ? {
            name: user.name,
            given_name: user.given_name,
            family_name: user.family_name,
            email: user.email,
          }
        : null,
      pathname: location.pathname,
    });
  }, [isAuthenticated, isLoading, user, backendUser, location.pathname]);

  // Escuchar cambios del perfil de usuario
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log("🔄 Profile updated, forcing re-render");
      setForceUpdate((prev) => !prev);
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
    };
  }, []);

  // Rutas donde NO debe aparecer ninguna navbar (páginas especiales)
  const noNavbarRoutes = ["/login", "/registro", "/callback"];
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);

  // Si no debe mostrar navbar, retornar null
  if (!shouldShowNavbar) {
    return null;
  }

  // Mostrar loading mientras Auth0 está procesando
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
    logout(); // Auth0 manejará la redirección automáticamente
  };

  // Determinar qué navbar mostrar según el estado de autenticación y rol
  const renderNavbar = () => {
    // Si no está autenticado o no hay usuario, mostrar navbar de invitado
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

    // DEBUG: Log para ver la estructura real de los datos
    console.log("🔍 Raw data for Header:", {
      backendUser,
      auth0User: user,
      backendUserKeys: backendUser ? Object.keys(backendUser) : [],
      backendUserNombre: backendUser?.nombre,
      backendUserApellido: backendUser?.apellido,
    });

    // OPTIMIZADO: Crear userData base que todos los navbars pueden usar
    const baseUserData = {
      nombre: "",
      apellido: "",
      email: "",
      imagen: undefined as { url: string; denominacion: string } | undefined,
    };

    // OPTIMIZADO: Usar datos más recientes del backend si están disponibles
    let userData;

    if (
      backendUser &&
      backendUser.nombre &&
      !backendUser.nombre.includes("@") &&
      backendUser.nombre !== "Usuario"
    ) {
      // Si backendUser tiene datos válidos (no genéricos), usarlos
      userData = {
        ...baseUserData,
        nombre: backendUser.nombre,
        apellido: backendUser.apellido || "",
        email: backendUser.email || user?.email || "",
        imagen: backendUser.imagen || undefined,
      };
      console.log("✅ Using valid backend user data:", userData);
    } else {
      // Fallback a datos de Auth0 si backendUser no tiene datos válidos
      userData = {
        ...baseUserData,
        nombre: user?.given_name || user?.name?.split(" ")[0] || "Usuario",
        apellido:
          user?.family_name || user?.name?.split(" ").slice(1).join(" ") || "",
        email: user?.email || "",
        imagen: undefined,
      };
      console.log("⚠️ Using Auth0 fallback data:", userData);
    }

    // Crear userData extendido para navbars que lo necesiten (como NavbarCliente)
    const extendedUserData = {
      ...userData,
      rol: backendUser?.usuario?.rol || backendUser?.rol || "CLIENTE",
      telefono: backendUser?.telefono || "",
      fechaNacimiento: backendUser?.fechaNacimiento || null,
      domicilios: backendUser?.domicilios || [],
    };

    console.log("🔍 Final userData:", userData);
    console.log("🔍 Extended userData:", extendedUserData);

    // Si está autenticado, mostrar navbar según el rol
    const userRole = extendedUserData.rol?.toUpperCase();

    switch (userRole) {
      case "ADMINISTRADOR":
      case "ADMIN":
        return (
          <NavbarAdmin
            user={userData} // Solo datos base
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "CAJERO":
        return (
          <NavbarCajero
            user={userData} // Solo datos base
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "DELIVERY":
        return (
          <NavbarDelivery
            user={userData} // Solo datos base
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "COCINERO":
        return (
          <NavbarCocinero
            user={userData} // Solo datos base
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );
      case "CLIENTE":
      default:
        return (
          <NavbarCliente
            user={extendedUserData} // Datos extendidos con rol
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
