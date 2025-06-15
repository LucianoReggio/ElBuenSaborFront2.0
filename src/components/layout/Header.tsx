import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useHybridAuth } from '../../hooks/useHybridAuth';

// Importar todos los navbars
import NavbarInvitado from './navbar/NavbarInvitado';
import NavbarCliente from './navbar/NavbarCliente';
import NavbarCajero from './navbar/NavbarCajero';
import NavbarDelivery from './navbar/NavbarDelivery';
import NavbarCocinero from './navbar/NavbarCocinero';
import NavbarAdmin from './navbar/NavbarAdmin';

// Tipo que esperan los navbars
interface NavbarUser {
  nombre: string;
  apellido: string;
  email: string;
  imagen?: {
    url: string;
    denominacion: string;
  };
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, refreshAuth } = useHybridAuth();

  // 🔄 FUNCIÓN ADAPTADORA: Convierte HybridAuthUser a NavbarUser
  const adaptUserForNavbar = (): NavbarUser | null => {
    if (!user) return null;

    return {
      nombre: user.nombre || 'Usuario',
      apellido: user.apellido || '',
      email: user.email || 'Sin email',
      imagen: user.imagen || undefined
    };
  };

  // Debug: log cuando cambie el estado de autenticación
  useEffect(() => {
    console.log('🔄 Header - Auth state changed:', {
      isAuthenticated,
      userRole: user?.rol,
      authProvider: user?.authProvider,
      pathname: location.pathname
    });
  }, [isAuthenticated, user, location.pathname]);

  // Efecto para detectar cambios en la autenticación y forzar re-render
  useEffect(() => {
    // Re-verificar autenticación cuando cambia la ruta
    refreshAuth();
  }, [location.pathname]);

  // Efecto para debug - remover en producción
  useEffect(() => {
    console.log('🔍 Header - Auth details:', { 
      isAuthenticated, 
      userRole: user?.rol,
      authProvider: user?.authProvider,
      userEmail: user?.email 
    });
  }, [isAuthenticated, user]);

  // Rutas donde NO debe aparecer ninguna navbar (páginas especiales)
  const noNavbarRoutes = ['/login', '/registro'];
  const shouldShowNavbar = !noNavbarRoutes.includes(location.pathname);

  // Si no debe mostrar navbar, retornar null
  if (!shouldShowNavbar) {
    return null;
  }

  // Funciones comunes para todos los navbars
  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/registro');
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleSearch = (query: string) => {
    console.log('Buscar:', query);
    // Implementar lógica de búsqueda
    // navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Determinar qué navbar mostrar según el estado de autenticación y rol
  const renderNavbar = () => {
    // Si no está autenticado, mostrar navbar de invitado
    if (!isAuthenticated || !user) {
      console.log('📝 Showing guest navbar - not authenticated');
      return (
        <NavbarInvitado
          onLogin={handleLogin}
          onRegister={handleRegister}
          onHome={handleHome}
          onSearch={handleSearch}
        />
      );
    }

    // Adaptar usuario para los navbars
    const adaptedUser = adaptUserForNavbar();
    if (!adaptedUser) {
      console.log('❌ Could not adapt user for navbar');
      return (
        <NavbarInvitado
          onLogin={handleLogin}
          onRegister={handleRegister}
          onHome={handleHome}
          onSearch={handleSearch}
        />
      );
    }

    // Si está autenticado, mostrar navbar según el rol
    const userRole = user.rol?.toUpperCase();
    console.log('📝 Showing navbar for role:', userRole, 'from provider:', user.authProvider);

    switch (userRole) {
      case 'ADMINISTRADOR':
      case 'ADMIN':
        return (
          <NavbarAdmin
            user={adaptedUser}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );

      case 'CAJERO':
        return (
          <NavbarCajero
            user={adaptedUser}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );

      case 'DELIVERY':
        return (
          <NavbarDelivery
            user={adaptedUser}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );

      case 'COCINERO':
        return (
          <NavbarCocinero
            user={adaptedUser}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );

      case 'CLIENTE':
      default:
        return (
          <NavbarCliente
            user={adaptedUser}
            onLogout={handleLogout}
            onHome={handleHome}
            onSearch={handleSearch}
          />
        );
    }
  };

  return (
    <header>
      {renderNavbar()}
    </header>
  );
};

export default Header;