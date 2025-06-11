import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// Importar todos los navbars
import NavbarInvitado from './navbar/NavbarInvitado';
import NavbarCliente from './navbar/NavbarCliente';
import NavbarCajero from './navbar/NavbarCajero';
import NavbarDelivery from './navbar/NavbarDelivery';
import NavbarCocinero from './navbar/NavbarCocinero';
import NavbarAdmin from './navbar/NavbarAdmin';
const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout, refreshAuth } = useAuth();
// Debug: log cuando cambie el estado de autenticación
useEffect(() => {
  console.log('🔄 Header - Auth state changed:', { 
    isAuthenticated, 
    userRole: user?.rol,
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
    console.log('Header - Auth status changed:', { isAuthenticated, user: user?.rol });
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

    switch (userRole) {
      case 'ADMINISTRADOR':
      case 'ADMIN':
        return (
          <NavbarAdmin
            user={user}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );

      case 'CAJERO':
        return (
          <NavbarCajero
            user={user}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );

      case 'DELIVERY':
        return (
          <NavbarDelivery
            user={user}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );

      case 'COCINERO':
        return (
          <NavbarCocinero
            user={user}
            onLogout={handleLogout}
            onHome={handleHome}
          />
        );

      case 'CLIENTE':
      default:
        return (
          <NavbarCliente
            user={user}
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