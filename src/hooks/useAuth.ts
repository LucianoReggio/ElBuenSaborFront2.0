import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { AuthService } from "../services/AuthService";
import { apiClienteService } from "../services/ApiClienteService";

interface BackendUser {
  idCliente: number;
  userId?: number;
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
  rol?: string;
}

interface AuthState {
  backendUser: BackendUser | null;
  isSynced: boolean;
  syncError: string | null;
  isProcessing: boolean;
  initialized: boolean;
}

/**
 * Hook personalizado para manejo de autenticación Auth0 + Backend
 */
export const useAuth = () => {
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
    isProcessing: false,
    initialized: false,
  });

  const syncInProgress = useRef<boolean>(false);
  const syncAttempted = useRef<boolean>(false);
  const mounted = useRef<boolean>(true);

  // Cleanup en unmount
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // Marcar como inicializado cuando Auth0 termine de cargar
  useEffect(() => {
    if (!auth0IsLoading && !authState.initialized) {
      setAuthState((prev) => ({ ...prev, initialized: true }));
    }
  }, [auth0IsLoading, authState.initialized]);

  // Configuración Auth0 en API Client
  useEffect(() => {
    if (auth0IsAuthenticated) {
      apiClienteService.setAuth0Instance({
        isAuthenticated: auth0IsAuthenticated,
        getAccessTokenSilently,
      });
    }
  }, [auth0IsAuthenticated, getAccessTokenSilently]);

  // Sincronización con backend
  useEffect(() => {
    let timeoutId: number;

    const performSync = async () => {
      if (!mounted.current || !auth0IsAuthenticated || !auth0User?.sub) {
        return;
      }

      if (authState.isSynced || syncInProgress.current) {
        return;
      }

      syncInProgress.current = true;
      syncAttempted.current = true;

      setAuthState((prev) => ({
        ...prev,
        isProcessing: true,
        syncError: null,
      }));

      try {
        const response = await AuthService.processAuth0Login({
          email: auth0User.email,
          name: auth0User.name,
          given_name: auth0User.given_name,
          family_name: auth0User.family_name,
          picture: auth0User.picture,
        });

        if (response.success && mounted.current) {
          setAuthState((prev) => ({
            ...prev,
            backendUser: response.data,
            isSynced: true,
            syncError: null,
            isProcessing: false,
          }));
          window.dispatchEvent(new Event("userProfileUpdated"));
        }
      } catch (error: any) {
        if (!mounted.current) return;

        // Manejo de usuario duplicado
        if (
          error.message?.includes("Duplicate entry") ||
          error.message?.includes("already exists")
        ) {
          try {
            const profile = await AuthService.getCurrentUser();

            if (profile.authenticated && mounted.current) {
              const basicUser: BackendUser = {
                idCliente: 0,
                nombre:
                  profile.name?.split(" ")[0] ||
                  auth0User.given_name ||
                  "Usuario",
                apellido:
                  profile.name?.split(" ")[1] || auth0User.family_name || "",
                email: profile.email || auth0User.email || "",
                usuario: {
                  email: profile.email || auth0User.email || "",
                  rol: "CLIENTE",
                },
                rol: "CLIENTE",
              };

              setAuthState((prev) => ({
                ...prev,
                backendUser: basicUser,
                isSynced: true,
                syncError: null,
                isProcessing: false,
              }));
              window.dispatchEvent(new Event("userProfileUpdated"));
            }
          } catch (profileError) {
            if (mounted.current) {
              setAuthState((prev) => ({
                ...prev,
                syncError: "Error al recuperar perfil",
                isProcessing: false,
              }));
            }
          }
        } else {
          setAuthState((prev) => ({
            ...prev,
            syncError: error.message || "Error de sincronización",
            isProcessing: false,
          }));
        }
      } finally {
        syncInProgress.current = false;
      }
    };

    // Solo sincronizar una vez por usuario
    if (
      auth0IsAuthenticated &&
      auth0User &&
      !authState.isSynced &&
      !syncAttempted.current &&
      authState.initialized
    ) {
      timeoutId = setTimeout(performSync, 500);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [
    auth0IsAuthenticated,
    auth0User?.sub,
    authState.isSynced,
    authState.initialized,
  ]);

  // Reset en logout
  useEffect(() => {
    if (!auth0IsAuthenticated && authState.initialized) {
      setAuthState({
        backendUser: null,
        isSynced: false,
        syncError: null,
        isProcessing: false,
        initialized: true,
      });
      syncInProgress.current = false;
      syncAttempted.current = false;
    }
  }, [auth0IsAuthenticated, authState.initialized]);

  // ============= MÉTODOS =============
  const refreshRoles = useCallback(async () => {
  try {
    // Llamamos directamente al método estático del servicio
    return await AuthService.refreshRoles();
  } catch (error: any) {
    console.error("Error al refrescar roles desde useAuth:", error);
    // Devolvemos un objeto de error consistente para que el componente lo maneje
    return { success: false, message: error.message || "Error desconocido" };
  }
}, []);

  const login = useCallback(async () => {
    await loginWithRedirect();
  }, [loginWithRedirect]);

  const loginWithGoogle = useCallback(async () => {
    await loginWithRedirect({
      authorizationParams: { connection: "google-oauth2" },
    });
  }, [loginWithRedirect]);

  const logout = useCallback(() => {
    setAuthState((prev) => ({
      ...prev,
      backendUser: null,
      isSynced: false,
      syncError: null,
      isProcessing: false,
    }));
    syncInProgress.current = false;
    syncAttempted.current = false;
    auth0Logout({ logoutParams: { returnTo: window.location.origin } });
  }, [auth0Logout]);

  const registerCliente = useCallback(
    async (clienteData: any) => {
      if (!auth0IsAuthenticated || !auth0User) {
        throw new Error("Debes estar autenticado con Auth0 primero");
      }

      if (authState.isProcessing) {
        throw new Error("Ya se está procesando una solicitud");
      }

      try {
        setAuthState((prev) => ({ ...prev, isProcessing: true }));
        const response = await AuthService.completeProfile(clienteData);

        const updatedUser: BackendUser = {
          idCliente: response.idCliente,
          nombre: response.nombre,
          apellido: response.apellido,
          email: response.email,
          telefono: response.telefono,
          fechaNacimiento: response.fechaNacimiento,
          domicilios: response.domicilios || [],
          imagen: response.imagen,
          usuario: { email: response.email, rol: "CLIENTE" },
          rol: "CLIENTE",
        };

        setAuthState((prev) => ({
          ...prev,
          backendUser: updatedUser,
          isSynced: true,
          syncError: null,
          isProcessing: false,
        }));

        window.dispatchEvent(new Event("userProfileUpdated"));
        return response;
      } catch (error: any) {
        setAuthState((prev) => ({ ...prev, isProcessing: false }));
        throw error;
      }
    },
    [auth0IsAuthenticated, auth0User, authState.isProcessing]
  );

  const needsAdditionalData = useCallback(() => {
    if (
      !auth0IsAuthenticated ||
      !authState.isSynced ||
      !authState.backendUser
    ) {
      return false;
    }

    const user = authState.backendUser;
    return (
      !user.telefono?.trim() ||
      !user.domicilios?.length ||
      !user.fechaNacimiento ||
      !user.nombre?.trim() ||
      !user.apellido?.trim() ||
      user.nombre === "Usuario" ||
      user.apellido === "Auth0" ||
      user.nombre.includes("@") ||
      user.idCliente === 0
    );
  }, [auth0IsAuthenticated, authState.isSynced, authState.backendUser]);

  const getCurrentProfile = useCallback(async () => {
    return await AuthService.getCurrentUser();
  }, []);

  const refreshSync = useCallback(() => {
    syncInProgress.current = false;
    syncAttempted.current = false;
    setAuthState((prev) => ({
      ...prev,
      isSynced: false,
      syncError: null,
      isProcessing: false,
    }));
  }, []);

  // ============= ESTADOS FINALES =============

  const isLoading = useMemo(() => {
    return auth0IsLoading || !authState.initialized || authState.isProcessing;
  }, [auth0IsLoading, authState.initialized, authState.isProcessing]);

  const isAuthenticated = useMemo(() => {
    if (!authState.initialized) {
      return false;
    }

    return Boolean(
      auth0IsAuthenticated &&
        (authState.isSynced ||
          authState.backendUser ||
          (auth0User && !authState.syncError))
    );
  }, [
    authState.initialized,
    auth0IsAuthenticated,
    authState.isSynced,
    authState.backendUser,
    auth0User,
    authState.syncError,
  ]);

  const user = useMemo(() => {
    return authState.backendUser || auth0User;
  }, [authState.backendUser, auth0User]);

  const error = auth0Error?.message || authState.syncError;

  return {
    // Estados principales
    isAuthenticated,
    isLoading,
    user,
    error,

    // Estados específicos
    auth0User,
    backendUser: authState.backendUser,
    backendSynced: authState.isSynced,
    isProcessing: authState.isProcessing,

    // Métodos
    login,
    loginWithGoogle,
    logout,
    registerCliente,
    getCurrentProfile,
    needsAdditionalData,
    refreshSync,
      refreshRoles, 
  };
};
