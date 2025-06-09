import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  // Rutas donde NO debe aparecer la navbar (por ejemplo, páginas administrativas)
  const adminRoutes = ['/categorias', '/insumos', '/productos', '/stock'];
  const isAdminRoute = adminRoutes.includes(location.pathname) || location.pathname === '/dashboard';
  
  // Si es una ruta administrativa, no mostrar la navbar pública
  if (isAdminRoute) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center hover:opacity-80 transition-opacity duration-200"
              >
                <img 
                  src="/src/assets/logos/Logo-nabvar.png" 
                  alt="El Buen Sabor - Logo" 
                  className="h-12 w-auto"
                />
                <span className="ml-3 text-xl font-bold text-[#CD6C50]">Panel Administrativo</span>
              </button>
            </div>
            
            {isAuthenticated && user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Bienvenido, {user.nombre || user.email}
                </span>
                <button
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Para rutas públicas, mostrar la navbar completa
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
    // Aquí implementarías la lógica de búsqueda
    // Por ejemplo: navigate(`/buscar?q=${encodeURIComponent(query)}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Navbar
      isAuthenticated={isAuthenticated}
      user={user}
      onLogin={handleLogin}
      onRegister={handleRegister}
      onLogout={handleLogout}
      onHome={handleHome}
      onSearch={handleSearch}
    />
  );
};

export default Header;