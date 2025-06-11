import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegistroForm } from '../components/auth/RegistroForm';
import { useAuth } from '../hooks/useAuth';
import { useClientes } from '../hooks/useClientes';
import type { ClienteRegisterDTO } from '../types/clientes/Index';

const Registro: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { registerCliente, loading, error } = useClientes();
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Si ya está autenticado, redirigir al home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleRegister = async (data: ClienteRegisterDTO) => {
    try {
      await registerCliente(data);
      setSuccessMessage('¡Registro exitoso! Redirigiendo al login...');
      
      // Redirigir al login después de un registro exitoso
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      // Error is handled by useClientes hook
    }
  };

  const handleSwitchToLogin = () => {
    navigate('/login');
  };

  const handleGoogleRegister = () => {
    // TODO: Implementar autenticación con Google
    console.log('Google auth not implemented yet');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Lado izquierdo - Imagen */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#CD6C50] to-[#b85a42] items-center justify-center p-12">
        <div className="max-w-md text-center text-white">
          <img 
            src="/src/assets/img/Registro-Login.png" 
            alt="Registro" 
            className="w-full h-auto mb-8 rounded-lg shadow-lg"
          />
          <h2 className="text-3xl font-bold mb-4">¡Únete a nosotros!</h2>
          <p className="text-lg opacity-90">
            Regístrate y disfruta de nuestras deliciosas comidas
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

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-xl text-center">
              {successMessage}
            </div>
          )}

          {/* Card de Registro */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            <RegistroForm
              onSubmit={handleRegister}
              onSwitchToLogin={handleSwitchToLogin}
              onGoogleRegister={handleGoogleRegister}
              loading={loading}
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

export default Registro;