import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { AuthService } from "../services/AuthService";
import { ClienteService } from "../services/ClienteService";
import { apiClienteService } from "../services/ApiClienteService";

// ============= INTERFACES =============

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
 * Hook de autenticación Auth0 + Backend con sincronización automática de roles
 */
export const useAuth = () => {
  // ============= HOOKS Y ESTADO =============

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

  // Refs para control de concurrencia
  const syncInProgress = useRef<boolean>(false);
  const syncAttempted = useRef<boolean>(false);
  const mounted = useRef<boolean>(true);

  // ============= EFECTOS DE SETUP =============

  // Cleanup y inicialización
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

  // Configurar Auth0 en API Client para requests autenticados
  useEffect(() => {
    if (auth0IsAuthenticated) {
      apiClienteService.setAuth0Instance({
        isAuthenticated: auth0IsAuthenticated,
        getAccessTokenSilently,
      });
    }
  }, [auth0IsAuthenticated, getAccessTokenSilently]);

  // ============= EXTRACCIÓN DE ROLES =============

  /**
   * Extrae el rol del JWT de Auth0 (ID Token)
   */
  const extractRoleFromJwt = useCallback((jwt: any) => {
    if (!jwt) return "CLIENTE";

    const NAMESPACE = "https://APIElBuenSabor";
    const ROLES_CLAIM = NAMESPACE + "/roles";

    const rolesObj = jwt[ROLES_CLAIM];

    if (rolesObj && Array.isArray(rolesObj) && rolesObj.length > 0) {
      return rolesObj[0].toString().toUpperCase();
    }

    return "CLIENTE";
  }, []);

  // ============= SINCRONIZACIÓN PRINCIPAL =============

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const performSync = async () => {
      // Validaciones básicas
      if (!mounted.current || !auth0IsAuthenticated || !auth0User?.sub) return;
      if (authState.isSynced || syncInProgress.current) return;

      // Control de concurrencia
      syncInProgress.current = true;
      syncAttempted.current = true;

      setAuthState((prev) => ({
        ...prev,
        isProcessing: true,
        syncError: null,
      }));

      try {
        // Obtener rol de Auth0
        const auth0Role = extractRoleFromJwt(auth0User);

        // Intentar obtener perfil del backend
        try {
          const perfilCompleto = await ClienteService.getMyProfile();

          // Comparar roles Auth0 vs Backend
          const currentRole = perfilCompleto.rol || "CLIENTE";
          const rolesAreDifferent =
            currentRole.toUpperCase() !== auth0Role.toUpperCase();

          if (rolesAreDifferent) {
            // ROL CAMBIÓ: Sincronizar con backend
            try {
              await AuthService.refreshRoles();
              const updatedPerfil = await ClienteService.getMyProfile();

              const backendUserData: BackendUser = {
                idCliente: updatedPerfil.idCliente,
                userId: updatedPerfil.idUsuario,
                nombre: updatedPerfil.nombre,
                apellido: updatedPerfil.apellido,
                email: updatedPerfil.email,
                telefono: updatedPerfil.telefono,
                fechaNacimiento: updatedPerfil.fechaNacimiento,
                domicilios: updatedPerfil.domicilios || [],
                imagen: updatedPerfil.imagen,
                usuario: {
                  email: updatedPerfil.email,
                  rol: updatedPerfil.rol || auth0Role,
                },
                rol: updatedPerfil.rol || auth0Role,
              };

              if (mounted.current) {
                setAuthState((prev) => ({
                  ...prev,
                  backendUser: backendUserData,
                  isSynced: true,
                  syncError: null,
                  isProcessing: false,
                }));
                window.dispatchEvent(new Event("userProfileUpdated"));
              }
            } catch (syncError) {
              // Fallback: usar rol de Auth0 si falla sync
              const backendUserData: BackendUser = {
                idCliente: perfilCompleto.idCliente,
                userId: perfilCompleto.idUsuario,
                nombre: perfilCompleto.nombre,
                apellido: perfilCompleto.apellido,
                email: perfilCompleto.email,
                telefono: perfilCompleto.telefono,
                fechaNacimiento: perfilCompleto.fechaNacimiento,
                domicilios: perfilCompleto.domicilios || [],
                imagen: perfilCompleto.imagen,
                usuario: {
                  email: perfilCompleto.email,
                  rol: auth0Role,
                },
                rol: auth0Role,
              };

              if (mounted.current) {
                setAuthState((prev) => ({
                  ...prev,
                  backendUser: backendUserData,
                  isSynced: true,
                  syncError: null,
                  isProcessing: false,
                }));
                window.dispatchEvent(new Event("userProfileUpdated"));
              }
            }
          } else {
            // ROLES COINCIDEN: usar datos normalmente
            const backendUserData: BackendUser = {
              idCliente: perfilCompleto.idCliente,
              userId: perfilCompleto.idUsuario,
              nombre: perfilCompleto.nombre,
              apellido: perfilCompleto.apellido,
              email: perfilCompleto.email,
              telefono: perfilCompleto.telefono,
              fechaNacimiento: perfilCompleto.fechaNacimiento,
              domicilios: perfilCompleto.domicilios || [],
              imagen: perfilCompleto.imagen,
              usuario: {
                email: perfilCompleto.email,
                rol: perfilCompleto.rol || "CLIENTE",
              },
              rol: perfilCompleto.rol || "CLIENTE",
            };

            if (mounted.current) {
              setAuthState((prev) => ({
                ...prev,
                backendUser: backendUserData,
                isSynced: true,
                syncError: null,
                isProcessing: false,
              }));
              window.dispatchEvent(new Event("userProfileUpdated"));
            }
          }
        } catch (perfilError) {
          // USUARIO NUEVO: crear perfil básico
          const response = await AuthService.processAuth0Login({
            email: auth0User.email,
            name: auth0User.name,
            given_name: auth0User.given_name,
            family_name: auth0User.family_name,
            picture: auth0User.picture,
          });

          if (response.success && mounted.current) {
            const userData = {
              ...response.data,
              rol: auth0Role,
              usuario: {
                ...response.data.usuario,
                rol: auth0Role,
              },
            };

            setAuthState((prev) => ({
              ...prev,
              backendUser: userData,
              isSynced: true,
              syncError: null,
              isProcessing: false,
            }));
            window.dispatchEvent(new Event("userProfileUpdated"));
          }
        }
      } catch (error: any) {
        if (!mounted.current) return;

        // Manejo de errores específicos
        if (error.message === "USUARIO_DESACTIVADO") {
          alert(
            "Tu cuenta ha sido desactivada. Contacta al administrador para más información."
          );
          auth0Logout({ logoutParams: { returnTo: window.location.origin } });
          return;
        }

        // Recovery automático para usuarios duplicados
        if (
          error.message?.includes("Duplicate entry") ||
          error.message?.includes("already exists")
        ) {
          try {
            const profile = await AuthService.getCurrentUser();
            if (profile.authenticated && mounted.current) {
              const auth0Role = extractRoleFromJwt(auth0User);

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
                  rol: auth0Role,
                },
                rol: auth0Role,
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

    // Trigger: sincronizar solo una vez por usuario
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
    getAccessTokenSilently,
    auth0Logout,
    extractRoleFromJwt,
  ]);

  // Reset estado en logout
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

  // ============= MÉTODOS PÚBLICOS =============

  // Login con Auth0 (email/password)
  const login = useCallback(async () => {
    await loginWithRedirect();
  }, [loginWithRedirect]);

  // Login con Google OAuth
  const loginWithGoogle = useCallback(async () => {
    await loginWithRedirect({
      authorizationParams: { connection: "google-oauth2" },
    });
  }, [loginWithRedirect]);

  // Logout completo
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

  // Completar registro con datos adicionales
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
          userId: response.idUsuario,
          nombre: response.nombre,
          apellido: response.apellido,
          email: response.email,
          telefono: response.telefono,
          fechaNacimiento: response.fechaNacimiento,
          domicilios: response.domicilios || [],
          imagen: response.imagen,
          usuario: {
            email: response.email,
            rol: response.rol || "CLIENTE",
          },
          rol: response.rol || "CLIENTE",
        };

        setAuthState((prev) => ({
          ...prev,
          backendUser: updatedUser,
          isSynced: true,
          syncError: null,
          isProcessing: false,
        }));

        // Asegurar propagación de cambios
        const dispatchUpdate = () =>
          window.dispatchEvent(new Event("userProfileUpdated"));
        dispatchUpdate();
        setTimeout(dispatchUpdate, 100);
        setTimeout(dispatchUpdate, 500);

        return response;
      } catch (error: any) {
        setAuthState((prev) => ({ ...prev, isProcessing: false }));
        throw error;
      }
    },
    [auth0IsAuthenticated, auth0User, authState.isProcessing]
  );

  // Verificar si necesita completar datos adicionales
  const needsAdditionalData = useCallback(() => {
    if (
      !auth0IsAuthenticated ||
      !authState.isSynced ||
      !authState.backendUser
    ) {
      return false;
    }

    const user = authState.backendUser;

    const checks = {
      noTelefono: !user.telefono?.trim(),
      noDomicilios: !user.domicilios?.length,
      noFechaNacimiento: !user.fechaNacimiento,
      noNombre: !user.nombre?.trim(),
      noApellido: !user.apellido?.trim(),
      nombrePorDefecto: user.nombre === "Usuario",
      apellidoPorDefecto: user.apellido === "Auth0",
      nombreEsEmail: user.nombre?.includes("@"),
      clienteInvalido: user.idCliente === 0,
    };

    return Object.values(checks).some((check) => check);
  }, [auth0IsAuthenticated, authState.isSynced, authState.backendUser]);

  // Obtener perfil actual
  const getCurrentProfile = useCallback(async () => {
    return await AuthService.getCurrentUser();
  }, []);

  // Forzar nueva sincronización
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

  // ============= ESTADOS COMPUTADOS =============

  const isLoading = useMemo(() => {
    return auth0IsLoading || !authState.initialized || authState.isProcessing;
  }, [auth0IsLoading, authState.initialized, authState.isProcessing]);

  const isAuthenticated = useMemo(() => {
    if (!authState.initialized) return false;

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

  // ============= RETORNO =============

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

    // Métodos de autenticación
    login,
    loginWithGoogle,
    logout,

    // Métodos de gestión de perfil
    registerCliente,
    getCurrentProfile,
    needsAdditionalData,

    // Utilidades
    refreshSync,
  };
};
