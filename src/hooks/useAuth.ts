import { useState, useEffect } from "react";
import { AuthService } from "../services/AuthService";
import type {
  LoginRequestDTO,
  LoginResponseDTO,
  UserInfo,
} from "../types/auth/index";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    checkAuthStatus();

    // Suscribirse a cambios en AuthService
    const unsubscribe = AuthService.subscribe(() => {
      console.log("🔔 AuthService notified change, rechecking auth status");
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
          setError(null); // Limpiar errores previos
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
      console.error("Error checking auth status:", error);
      // No hacer logout automático en caso de error de red
      setError("Error verificando autenticación");
    } finally {
      setLoading(false);
    }
  };

  const login = async (
    credentials: LoginRequestDTO
  ): Promise<LoginResponseDTO> => {
    setLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(credentials);

      // IMPORTANTE: Actualizar el estado inmediatamente después del login
      setIsAuthenticated(true);

      // Crear el objeto de usuario con los datos del response
      const userData: UserInfo = {
        email: response.email || "",
        userId: response.userId || 0,
        rol: response.rol || "CLIENTE",
        nombre: response.nombre || "Usuario",
        apellido: response.apellido || "",
      };

      setUser(userData);

      return response;
    } catch (err: any) {
      const errorMessage = err.message || "Error al iniciar sesión";
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

  // Función para login con Google
  const loginWithGoogle = () => {
    AuthService.loginWithGoogle();
  };

  // Función para registro
  const register = async (userData: any): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await AuthService.register(userData);
    } catch (err: any) {
      const errorMessage = err.message || "Error al registrar usuario";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Función para forzar actualización del estado (útil en casos específicos)
  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  // Verificar roles
  const hasRole = (role: string): boolean => {
    return user?.rol === role || user?.rol === "ADMIN";
  };

  const isAdmin = (): boolean => {
    return user?.rol === "ADMIN";
  };

  const isCliente = (): boolean => {
    return user?.rol === "CLIENTE";
  };

  return {
    isAuthenticated,
    loading,
    error,
    user,
    login,
    logout,
    loginWithGoogle,
    register,
    checkAuthStatus,
    refreshAuth,
    hasRole,
    isAdmin,
    isCliente,
    // Mantener compatibilidad con el hook anterior
    isLoading: loading,
  };
};
