import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useCallback } from "react";
import { AuthService } from "../services/AuthService";
import { apiClienteService } from "../services/ApiClienteService";

interface BackendUser {
  idCliente: number;
  userId?: number; // Puede ser opcional si no siempre está presente
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  fechaNacimiento?: string;
  domicilios?: any[];
  imagen?: any;
  usuario: {
    email: string;
    rol: string;
  };
  rol?: string; // Para compatibilidad cuando el rol viene directamente
}

interface AuthState {
  backendUser: BackendUser | null;
  isSynced: boolean;
  syncError: string | null;
}

/**
 * Hook personalizado para manejo de autenticación Auth0 + Backend
 * Versión simplificada y optimizada con configuración Auth0 mejorada
 */
export const useAuth = () => {
  // Todos los hooks deben ejecutarse ANTES de cualquier return temprano
  const {
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0IsLoading,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    error: auth0Error,
  } = useAuth0();

  const [authState, setAuthState] = useState<AuthState>({
    backendUser: null,
    isSynced: false,
    syncError: null,
  });

  // ✅ CONFIGURACIÓN MEJORADA DE AUTH0 EN API CLIENT
  useEffect(() => {
    console.log('🔧 Configurando Auth0 en ApiClient - Autenticado:', auth0IsAuthenticated);

    if (auth0IsAuthenticated) {
      apiClienteService.setAuth0Instance({
        isAuthenticated: auth0IsAuthenticated,
        getAccessTokenSilently,
      });
      console.log('✅ Auth0 configurado en ApiClienteService');
    } else {
      console.log('⚠️ Usuario no autenticado - Auth0 no configurado');
    }
  }, [auth0IsAuthenticated, getAccessTokenSilently]);
  // ✅ AGREGAR EFECTO PARA PROBAR TOKEN DESPUÉS DE CONFIGURACIÓN
  useEffect(() => {
    const testTokenAfterConfig = async () => {
      if (auth0IsAuthenticated && getAccessTokenSilently) {
        try {
          console.log('🧪 Probando obtención de token...');
          const token = await getAccessTokenSilently();
          console.log('✅ Token obtenido exitosamente:', token ? token.substring(0, 50) + '...' : 'null');
        } catch (error) {
          console.error('❌ Error obteniendo token de prueba:', error);
        }
      }
    };

    // Dar un pequeño delay para asegurar configuración
    const timer = setTimeout(testTokenAfterConfig, 1000);
    return () => clearTimeout(timer);
  }, [auth0IsAuthenticated, getAccessTokenSilently]);

  // Sincronización con backend
  useEffect(() => {
    const syncWithBackend = async () => {
  if (!auth0IsAuthenticated || !auth0User || authState.isSynced) {
    return;
  }

  try {
    console.log("🔄 Syncing with backend for user:", auth0User.sub);

    const response = await AuthService.processAuth0Login({
      email: auth0User.email,
      name: auth0User.name,
      given_name: auth0User.given_name,
      family_name: auth0User.family_name,
      picture: auth0User.picture,
    });

    // 🔍 DEBUG: Verificar la respuesta completa del AuthService
    console.log("🔍 AuthService response completa:", response);
    console.log("🔍 response.success:", response.success);
    console.log("🔍 response.data:", response.data);
    
    if (response.data) {
      console.log("🔍 response.data.idCliente:", response.data.idCliente);
      console.log("🔍 response.data.userId:", response.data.userId);
      console.log("🔍 response.data.idUsuario:", response.data.idUsuario);
      console.log("🔍 Propiedades en response.data:", Object.keys(response.data));
    }

    if (response.success) {
      console.log("✅ Backend sync successful");

      setAuthState({
        backendUser: response.data,
        isSynced: true,
        syncError: null,
      });

      // Notificar actualización de perfil
      window.dispatchEvent(new Event("userProfileUpdated"));
    }
  } catch (error: any) {
    console.error("❌ Backend sync error:", error);

        // Si usuario ya existe, continuar
        if (
          error.message?.includes("Duplicate entry") ||
          error.message?.includes("already exists")
        ) {
          setAuthState((prev) => ({ ...prev, isSynced: true }));
        } else {
          setAuthState((prev) => ({
            ...prev,
            syncError: error.message || "Error de sincronización",
          }));
        }
      }
    };

    // ✅ Agregar delay para asegurar que Auth0 esté configurado
    const timer = setTimeout(syncWithBackend, 2000);
    return () => clearTimeout(timer);
  }, [auth0IsAuthenticated, auth0User, authState.isSynced]);

  // Limpiar estado al hacer logout
  useEffect(() => {
    if (!auth0IsAuthenticated) {
      setAuthState({
        backendUser: null,
        isSynced: false,
        syncError: null,
      });
    }
  }, [auth0IsAuthenticated]);

  /**
   * Login usando Auth0
   */
  const login = useCallback(async () => {
    try {
      await loginWithRedirect();
    } catch (error: any) {
      console.error("Error en login:", error);
      throw error;
    }
  }, [loginWithRedirect]);

  /**
   * Login con Google específicamente
   */
  const loginWithGoogle = useCallback(async () => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: "google-oauth2",
        },
      });
    } catch (error: any) {
      console.error("Error en login con Google:", error);
      throw error;
    }
  }, [loginWithRedirect]);

  /**
   * Logout completo
   */
  const logout = useCallback(() => {
    setAuthState({
      backendUser: null,
      isSynced: false,
      syncError: null,
    });

    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }, [auth0Logout]);

  /**
   * Completar perfil con datos adicionales
   */
  const registerCliente = useCallback(
    async (clienteData: any) => {
      if (!auth0IsAuthenticated || !auth0User) {
        throw new Error("Debes estar autenticado con Auth0 primero");
      }

      try {
        const response = await AuthService.completeProfile(clienteData);

        console.log("✅ Profile completed successfully");

        // Actualizar estado local con perfil completo
        const updatedUser: BackendUser = {
          idCliente: response.idCliente,
          nombre: response.nombre,
          apellido: response.apellido,
          email: response.email,
          telefono: response.telefono,
          fechaNacimiento: response.fechaNacimiento,
          domicilios: response.domicilios || [],
          imagen: response.imagen,
          usuario: {
            email: response.email,
            rol: "CLIENTE",
          },
        };

        setAuthState((prev) => ({
          ...prev,
          backendUser: updatedUser,
          isSynced: true,
        }));

        // Notificar actualización
        window.dispatchEvent(new Event("userProfileUpdated"));

        return response;
      } catch (error: any) {
        console.error("Error en registro:", error);
        throw error;
      }
    },
    [auth0IsAuthenticated, auth0User]
  );

  /**
   * Verificar si el usuario necesita completar datos adicionales
   */
  const needsAdditionalData = useCallback(() => {
    if (
      !auth0IsAuthenticated ||
      !authState.isSynced ||
      !authState.backendUser
    ) {
      return false;
    }

    const user = authState.backendUser;

    // Verificar datos requeridos
    const missingCriticalData =
      !user.telefono?.trim() ||
      !user.domicilios?.length ||
      !user.fechaNacimiento ||
      !user.nombre?.trim() ||
      !user.apellido?.trim() ||
      user.nombre === "Usuario" ||
      user.apellido === "Auth0" ||
      user.nombre.includes("@");

    return missingCriticalData;
  }, [auth0IsAuthenticated, authState]);

  /**
   * Obtener perfil actual del backend
   */
  const getCurrentProfile = useCallback(async () => {
    try {
      return await AuthService.getCurrentUser();
    } catch (error: any) {
      console.error("Error obteniendo perfil:", error);
      throw error;
    }
  }, []);

  /**
   * Forzar re-sincronización con backend
   */
  const refreshSync = useCallback(() => {
    setAuthState((prev) => ({ ...prev, isSynced: false, syncError: null }));
  }, []);

  // ✅ NUEVO: Método para verificar configuración Auth0
  const debugAuth0Config = useCallback(async () => {
    console.log('🔍 DEBUG AUTH0 CONFIG:');
    console.log('- isAuthenticated:', auth0IsAuthenticated);
    console.log('- hasUser:', !!auth0User);
    console.log('- user.sub:', auth0User?.sub);
    console.log('- hasTokenMethod:', !!getAccessTokenSilently);

    if (auth0IsAuthenticated && getAccessTokenSilently) {
      try {
        const token = await getAccessTokenSilently();
        console.log('- token length:', token?.length);
        console.log('- token preview:', token?.substring(0, 50) + '...');
      } catch (error) {
        console.log('- token error:', error);
      }
    }
  }, [auth0IsAuthenticated, auth0User, getAccessTokenSilently]);

  // IMPORTANTE: Estados derivados al final, después de todos los hooks
  const isLoading =
    auth0IsLoading ||
    (auth0IsAuthenticated && !authState.isSynced && !authState.syncError);
  const isAuthenticated = auth0IsAuthenticated && authState.isSynced;
  const user = authState.backendUser || auth0User;
  const error = auth0Error?.message || authState.syncError;

  return {
    // Estados
    isAuthenticated,
    isLoading,
    user,
    error,

    // Datos específicos
    auth0User,
    backendUser: authState.backendUser,
    backendSynced: authState.isSynced,

    // Métodos de autenticación
    login,
    loginWithGoogle,
    logout,

    // Métodos de perfil
    registerCliente,
    getCurrentProfile,
    needsAdditionalData,

    // Método para refrescar sincronización
    refreshSync,

    // ✅ NUEVO: Debug method
    debugAuth0Config,
  };
};