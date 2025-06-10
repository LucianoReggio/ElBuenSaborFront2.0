import { useState, useEffect } from 'react';
import { AuthService } from '../services/AuthService';
import type { LoginRequestDTO } from '../types/auth/LoginRequestDTO';
import type { LoginResponseDTO } from '../types/auth/LoginResponseDTO';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuthStatus();
  
  // Suscribirse a cambios en AuthService
  const unsubscribe = AuthService.subscribe(() => {
    console.log('🔔 AuthService notified change, rechecking auth status');
    checkAuthStatus();
  });

  return unsubscribe; // Cleanup

  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const token = AuthService.getToken();
      
      if (token) {
        const isValid = await AuthService.validateToken(token);
        if (isValid) {
          const userInfo = AuthService.getUserInfo();
          setIsAuthenticated(true);
          setUser(userInfo);
        } else {
          // Token inválido, limpiar todo
          AuthService.logout();
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      AuthService.logout();
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(credentials);
      
      // IMPORTANTE: Actualizar el estado inmediatamente después del login
      setIsAuthenticated(true);
      
      // Crear el objeto de usuario con los datos del response
      const userData = {
        email: response.email,
        userId: response.userId,
        rol: response.rol,
        nombre: response.nombre || 'Usuario',
        apellido: response.apellido || ''
      };
      
      setUser(userData);
      
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setError(null);
  };

  // Función para forzar actualización del estado (útil en casos específicos)
  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  return {
    isAuthenticated,
    loading,
    error,
    user,
    login,
    logout,
    checkAuthStatus,
    refreshAuth // Nueva función
  };
};