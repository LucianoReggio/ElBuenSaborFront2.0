import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../common/Modal';
import { RegistroForm } from './RegistroForm';
import { LoginForm } from './LoginForm';
import { useAuth } from '../../hooks/useAuth';
import { useClientes } from '../../hooks/useClientes';
import type { ClienteRegisterDTO } from '../../types/clientes/Index';
import type { LoginRequestDTO } from '../../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void; // Callback opcional cuando la autenticación es exitosa
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const { login, loading: authLoading, error: authError } = useAuth();
  const { registerCliente, loading: registerLoading, error: registerError } = useClientes();
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Reset del estado cuando se abre/cierra el modal
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSuccessMessage('');
    }
  }, [isOpen, initialMode]);

  const handleLogin = async (data: LoginRequestDTO) => {
    try {
      await login(data);
      setSuccessMessage('¡Inicio de sesión exitoso!');
      
      // Pequeño delay para mostrar el mensaje de éxito
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1000);
    } catch (error) {
      // Error is handled by useAuth hook
      console.error('Login error:', error);
    }
  };

  const handleRegister = async (data: ClienteRegisterDTO) => {
    try {
      await registerCliente(data);
      setSuccessMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
      
      // Cambiar automáticamente a login después del registro exitoso
      setTimeout(() => {
        setMode('login');
        setSuccessMessage('');
      }, 1500);
    } catch (error) {
      // Error is handled by useClientes hook
      console.error('Register error:', error);
    }
  };

  const handleGoogleAuth = () => {
    // TODO: Implementar autenticación con Google
    console.log('Google auth not implemented yet');
  };

  const handleClose = () => {
    setSuccessMessage('');
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      title={mode === 'register' ? 'Registro de Usuario' : 'Iniciar Sesión'}
    >
      <div className="relative">
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
        >
          <X className="h-5 w-5" />
        </button>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm text-center">
            {successMessage}
          </div>
        )}

        {mode === 'register' ? (
          <RegistroForm
            onSubmit={handleRegister}
            onSwitchToLogin={() => {
              setMode('login');
              setSuccessMessage('');
            }}
            onGoogleRegister={handleGoogleAuth}
            loading={registerLoading}
            error={registerError || undefined}
          />
        ) : (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToRegister={() => {
              setMode('register');
              setSuccessMessage('');
            }}
            onGoogleLogin={handleGoogleAuth}
            loading={authLoading}
            error={authError || undefined}
          />
        )}
      </div>
    </Modal>
  );
};