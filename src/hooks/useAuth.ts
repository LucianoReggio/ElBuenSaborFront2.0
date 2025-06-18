import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AuthService } from "../services/AuthService";
import { apiClienteService } from "../services/ApiClienteService";

/**
 * Hook personalizado que combina Auth0 con tu backend
 * Maneja automáticamente la sincronización entre Auth0 y tu API
 */
export const useAuth = () => {
  const location = useLocation();
  const {
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0IsLoading,
    user: auth0User,
    loginWithRedirect,
    logout: auth0Logout,
    getAccessTokenSilently,
    error: auth0Error,
  } = useAuth0();

  const [backendUser, setBackendUser] = useState<any>(null);
  const [backendSynced, setBackendSynced] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Configurar Auth0 en apiClienteService cuando esté disponible
  useEffect(() => {
    if (auth0IsAuthenticated) {
      apiClienteService.setAuth0Instance({
        isAuthenticated: auth0IsAuthenticated,
        getAccessTokenSilently,
      });
    }
  }, [auth0IsAuthenticated, getAccessTokenSilently]);

  // Sincronizar con backend cuando el usuario se autentica en Auth0
  useEffect(() => {
    const syncWithBackend = async () => {
      if (auth0IsAuthenticated && auth0User && !backendSynced && !syncError) {
        try {
          console.log("🔄 Starting backend sync for user:", auth0User.sub);
          setSyncError(null);

          // Sincronizar usuario con backend
          const response = await AuthService.processAuth0Login({
            email: auth0User.email,
            name: auth0User.name,
            given_name: auth0User.given_name,
            family_name: auth0User.family_name,
            picture: auth0User.picture,
          });

          if (response.success) {
            console.log("✅ Backend sync successful");
            console.log("🔍 Response from backend:", response);
            console.log("🔍 User data received:", response.user);

            // CRÍTICO: Siempre actualizar backendUser, incluso si ya existe
            const newUser = response.user;
            const currentUser = backendUser;

            // Determinar si los nuevos datos son mejores
            const newDataIsValid =
              newUser.nombre &&
              !newUser.nombre.includes("@") &&
              newUser.nombre !== "Usuario" &&
              newUser.apellido !== "Auth0";

            const currentDataIsValid =
              currentUser?.nombre &&
              !currentUser.nombre.includes("@") &&
              currentUser.nombre !== "Usuario" &&
              currentUser.apellido !== "Auth0";

            console.log("🔍 Data quality comparison:", {
              newDataIsValid,
              currentDataIsValid,
              newUser: { nombre: newUser.nombre, apellido: newUser.apellido },
              currentUser: currentUser
                ? { nombre: currentUser.nombre, apellido: currentUser.apellido }
                : null,
            });

            // Actualizar si los nuevos datos son válidos O si no hay datos actuales válidos
            if (newDataIsValid || !currentDataIsValid) {
              console.log("🔄 Updating backendUser with new data");
              setBackendUser(newUser);

              // Disparar evento de actualización
              setTimeout(() => {
                window.dispatchEvent(new Event("userProfileUpdated"));
              }, 50);
            } else {
              console.log("✅ Keeping current data (better quality)");
            }

            setBackendSynced(true);
          }
        } catch (error: any) {
          console.error("❌ Error sincronizando con backend:", error);
          setSyncError(error.message || "Error de sincronización");
          // No bloquear el flujo si el usuario ya existe
          if (
            error.message?.includes("Duplicate entry") ||
            error.message?.includes("already exists")
          ) {
            console.log(
              "🔄 User already exists, trying to get existing user data"
            );
            setBackendSynced(true); // Permitir continuar
          }
        }
      } else if (!auth0IsAuthenticated) {
        // Limpiar estado cuando no está autenticado
        setBackendUser(null);
        setBackendSynced(false);
        setSyncError(null);
      }
    };

    // Evitar llamadas múltiples con un pequeño delay
    const timeoutId = setTimeout(syncWithBackend, 100);
    return () => clearTimeout(timeoutId);
  }, [auth0IsAuthenticated, auth0User, backendSynced, syncError]); // REMOVED backendUser from dependencies

  // NUEVO: Efecto para permitir re-sync cuando el usuario navega después del registro
  useEffect(() => {
    // Si el usuario está autenticado y ya sincronizado, pero los datos siguen siendo genéricos,
    // permitir un re-sync después de la navegación
    if (auth0IsAuthenticated && auth0User && backendSynced && backendUser) {
      const dataIsGeneric =
        backendUser.nombre?.includes("@") ||
        backendUser.apellido === "Auth0" ||
        backendUser.nombre === "Usuario";

      if (dataIsGeneric) {
        console.log(
          "🔄 Detected generic data after navigation, allowing re-sync"
        );
        setBackendSynced(false); // Esto permitirá que el useEffect anterior se ejecute
      }
    }
  }, [location.pathname]); // Ejecutar cuando cambie la ruta

  /**
   * Login usando Auth0
   */
  const login = async () => {
    try {
      await loginWithRedirect();
    } catch (error: any) {
      console.error("Error en login:", error);
      throw error;
    }
  };

  /**
   * Login con Google específicamente
   */
  const loginWithGoogle = async () => {
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
  };

  /**
   * Logout completo
   */
  const logout = () => {
    // Limpiar estado local
    setBackendUser(null);
    setBackendSynced(false);
    setSyncError(null);

    // Logout de Auth0
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  /**
   * Registrar cliente con datos adicionales
   */
  const registerCliente = async (clienteData: any) => {
    if (!auth0IsAuthenticated) {
      throw new Error("Debes estar autenticado con Auth0 primero");
    }

    if (!auth0User) {
      throw new Error("Usuario Auth0 no disponible");
    }

    try {
      const response = await AuthService.completeProfile(clienteData);

      console.log("🔄 Profile completed, response:", response);

      // INMEDIATO: Construir backendUser actualizado con los datos completos del perfil
      const updatedBackendUser = {
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

      console.log(
        "🔄 Immediately updating backend user with complete profile:",
        updatedBackendUser
      );

      // CRÍTICO: Actualizar inmediatamente el estado
      setBackendUser(updatedBackendUser);
      setBackendSynced(true);

      // INMEDIATO: Forzar múltiples formas de actualización de UI
      setTimeout(() => {
        window.dispatchEvent(new Event("userProfileUpdated"));
        // Forzar otro re-render con un pequeño delay
        setTimeout(() => {
          window.dispatchEvent(new Event("userProfileUpdated"));
        }, 100);
      }, 50);

      // OPCIONAL: Re-sync deshabilitado ya que los datos locales son correctos
      console.log(
        "✅ Profile completed successfully, skipping confirmation sync"
      );

      return response;
    } catch (error: any) {
      console.error("Error en registro:", error);
      throw error;
    }
  };

  /**
   * Verificar si el usuario necesita completar datos adicionales
   */
  const needsAdditionalData = () => {
    if (!auth0IsAuthenticated || !backendSynced) {
      return false;
    }

    // Si no hay backendUser pero está autenticado en Auth0, necesita datos adicionales
    if (!backendUser && auth0User) {
      console.log("🔍 User needs data: No backend user found");
      return true;
    }

    // Si el backendUser existe, verificar que tenga datos críticos
    if (backendUser) {
      const missingPhone =
        !backendUser.telefono || backendUser.telefono.trim() === "";
      const missingDomicilios =
        !backendUser.domicilios || backendUser.domicilios.length === 0;
      const missingBirthDate = !backendUser.fechaNacimiento;

      // MEJORADO: Verificar si el nombre/apellido son genéricos O están vacíos
      const hasGenericName =
        !backendUser.nombre ||
        !backendUser.apellido ||
        backendUser.nombre === "Usuario" ||
        backendUser.apellido === "Auth0" ||
        backendUser.nombre.includes("@") || // Email como nombre
        backendUser.nombre.trim() === "" ||
        backendUser.apellido.trim() === "";

      const needsData =
        missingPhone || missingDomicilios || missingBirthDate || hasGenericName;

      if (needsData) {
        console.log("🔍 User needs data:", {
          missingPhone,
          missingDomicilios,
          missingBirthDate,
          hasGenericName,
          backendUser: {
            nombre: backendUser.nombre,
            apellido: backendUser.apellido,
            telefono: backendUser.telefono,
            domicilios: backendUser.domicilios?.length || 0,
            fechaNacimiento: backendUser.fechaNacimiento,
          },
        });
      } else {
        console.log("✅ User profile is complete:", {
          nombre: backendUser.nombre,
          apellido: backendUser.apellido,
          telefono: backendUser.telefono,
          domicilios: backendUser.domicilios?.length || 0,
          fechaNacimiento: backendUser.fechaNacimiento,
        });
      }

      return needsData;
    }

    return false;
  };

  /**
   * Obtener perfil actual del backend
   */
  const getCurrentProfile = async () => {
    try {
      const profile = await AuthService.getCurrentUser();
      return profile;
    } catch (error: any) {
      console.error("Error obteniendo perfil:", error);
      throw error;
    }
  };

  // Estado combinado
  const isLoading =
    auth0IsLoading || (auth0IsAuthenticated && !backendSynced && !syncError);
  const isAuthenticated = auth0IsAuthenticated && backendSynced;
  const user = backendUser || auth0User;
  const error = auth0Error?.message || syncError;

  return {
    // Estados
    isAuthenticated,
    isLoading,
    user,
    error,

    // Datos específicos
    auth0User,
    backendUser,
    backendSynced,

    // Métodos de autenticación
    login,
    loginWithGoogle,
    logout,

    // Métodos de registro y perfil
    registerCliente,
    getCurrentProfile,
    needsAdditionalData,

    // Método para refrescar sincronización
    refreshSync: () => setBackendSynced(false),
  };
};
