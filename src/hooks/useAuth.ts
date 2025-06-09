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
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    const token = AuthService.getToken();
    
    if (token) {
      const isValid = await AuthService.validateToken(token);
      if (isValid) {
        setIsAuthenticated(true);
        setUser(AuthService.getUserInfo());
      } else {
        AuthService.logout();
        setIsAuthenticated(false);
        setUser(null);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(credentials);
      setIsAuthenticated(true);
      
      // Crear el objeto de usuario con los datos del response
      const userData = {
        email: response.email,
        userId: response.userId,
        rol: response.rol,
        // Si el backend devuelve nombre y apellido, úsalos, sino valores por defecto
        nombre: response.nombre || 'Usuario',
        apellido: response.apellido || ''
      };
      
      setUser(userData);
      return response;
    } catch (err: any) {
      // El error ya viene procesado desde AuthService
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

  return {
    isAuthenticated,
    loading,
    error,
    user,
    login,
    logout,
    checkAuthStatus
  };
};