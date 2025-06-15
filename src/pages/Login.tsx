import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useHybridAuth } from '../hooks/useHybridAuth';
import type { LoginRequestDTO } from '../types/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { 
    loginLocal, 
    loginAuth0, 
    loading: localLoading, 
    auth0Loading,
    error, 
    isAuthenticated 
  } = useHybridAuth();

  // Si ya está autenticado, redirigir al home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (data: LoginRequestDTO) => {
    try {
      console.log('🚀 Starting local login...');
      await loginLocal(data);
      console.log('✅ Local login completed successfully');
      
      // El useEffect se encargará de la redirección
    } catch (error) {
      console.error('❌ Local login error:', error);
      // Error is handled by useHybridAuth hook
    }
  };

  const handleAuth0Login = async () => {
    try {
      console.log('🚀 Starting Auth0 login...');
      await loginAuth0();
      console.log('✅ Auth0 login completed successfully');
      
      // El useEffect se encargará de la redirección
    } catch (error) {
      console.error('❌ Auth0 login error:', error);
      // Error is handled by useHybridAuth hook
    }
  };

  const handleSwitchToRegister = () => {
    navigate('/registro');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Lado izquierdo - Imagen */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#CD6C50] to-[#b85a42] items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <img 
            src="/src/assets/img/Registro-Login.png" 
            alt="Login" 
            className="w-full h-auto mb-8 rounded-lg shadow-lg"
          />
          <h2 className="text-3xl font-bold mb-4">¡Bienvenido de vuelta!</h2>
          <p className="text-lg opacity-90">
            Inicia sesión y disfruta de nuestras deliciosas comidas
          </p>
        </div>
      </div>

      {/* Lado derecho - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          {/* Logo para móvil */}
          <div className="lg:hidden text-center mb-8">
            <img 
              src="/src/assets/logos/Logo-Completo.png" 
              alt="El Buen Sabor" 
              className="h-16 mx-auto mb-4"
            />
          </div>

          {/* Card de Login */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <LoginForm
              onSubmit={handleLogin}
              onSwitchToRegister={handleSwitchToRegister}
              onGoogleLogin={handleAuth0Login} // Usar Auth0 en lugar de Google directo
              loading={localLoading}
              auth0Loading={auth0Loading} // Pasar el loading específico de Auth0
              error={error || undefined}
            />
          </div>

          {/* Link al Home */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-[#CD6C50] hover:text-[#b85a42] font-medium transition-colors duration-200"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;