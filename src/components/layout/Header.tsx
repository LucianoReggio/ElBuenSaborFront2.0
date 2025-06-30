import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
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
  const { loginWithRedirect } = useAuth0();

  const { isAuthenticated, isLoading, user, backendUser, logout } = useAuth();
  const [forceUpdate, setForceUpdate] = useState(0);

  // Escuchar cambios del perfil de usuario
  useEffect(() => {
    const handleProfileUpdate = () => {
      setForceUpdate((prev) => prev + 1);
    };

    window.addEventListener("userProfileUpdated", handleProfileUpdate);
    return () =>
      window.removeEventListener("userProfileUpdated", handleProfileUpdate);
  }, []);

  // Escuchar cambios en backendUser
  useEffect(() => {
    if (backendUser) {
      setForceUpdate((prev) => prev + 1);
    }
  }, [
    backendUser?.nombre,
    backendUser?.apellido,
    backendUser?.email,
    backendUser?.telefono,
  ]);

  // Rutas donde NO debe aparecer ninguna navbar
  const noNavbarRoutes = ["/login", "/registro", "/callback", "/auth-complete"];
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);

  // Lógica unificada de autenticación
  const handleUnifiedAuth = async () => {
    try {
      await loginWithRedirect({
        appState: {
          returnTo: "/auth-complete",
          flow: "unified",
        },
      });
    } catch (error) {
      console.error("Auth error:", error);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: "google-oauth2",
        },
        appState: {
          returnTo: "/auth-complete",
          flow: "google",
        },
      });
    } catch (error) {
      console.error("Google auth error:", error);
    }
  };

  // Funciones helper
  const handleLogout = () => logout();

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

  const createUserData = (): UserData => {
    // Priorizar datos del backend si existen y son válidos
    if (backendUser && backendUser.nombre && backendUser.apellido) {
      const isValidName =
        backendUser.nombre !== "Usuario" && !backendUser.nombre.includes("@");
      const isValidSurname =
        backendUser.apellido !== "Auth0" && backendUser.apellido.trim() !== "";

      if (isValidName || isValidSurname) {
        return {
          nombre: isValidName
            ? backendUser.nombre
            : (user as any)?.given_name || "Usuario",
          apellido: isValidSurname
            ? backendUser.apellido
            : (user as any)?.family_name || "",
          email: backendUser.email || (user as any)?.email || "",
          rol: getUserRole(),
          imagen: backendUser.imagen,
        };
      }
    }

    // Fallback a datos de Auth0
    const auth0User = user as any;
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
          onAuth={handleUnifiedAuth}
          onGoogleAuth={handleGoogleAuth}
          onHome={handleHome}
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
          />
        );
    }
  };

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

  return <header key={forceUpdate}>{renderNavbar()}</header>;
};

export default Header;
