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
              newUser: {
                nombre: newUser.nombre,
                apellido: newUser.apellido,
                rol: newUser.rol,
              },
              currentUser: currentUser
                ? {
                    nombre: currentUser.nombre,
                    apellido: currentUser.apellido,
                    rol: currentUser.rol,
                  }
                : null,
            });

            // Actualizar si los nuevos datos son válidos O si no hay datos actuales válidos
            // O si el rol ha cambiado
            const roleChanged = currentUser?.rol !== newUser.rol;

            if (newDataIsValid || !currentDataIsValid || roleChanged) {
              console.log("🔄 Updating backendUser with new data");
              if (roleChanged) {
                console.log(
                  `🔄 Role updated: ${currentUser?.rol} → ${newUser.rol}`
                );
              }
              setBackendUser(newUser);

              // Disparar evento de actualización
              setTimeout(() => {
                window.dispatchEvent(new Event("userProfileUpdated"));
                if (roleChanged) {
                  window.dispatchEvent(
                    new CustomEvent("roleUpdated", {
                      detail: {
                        oldRole: currentUser?.rol,
                        newRole: newUser.rol,
                      },
                    })
                  );
                }
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
  }, [auth0IsAuthenticated, auth0User, backendSynced, syncError]);

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
  }, [location.pathname]);

  // Auto-refresh roles cada 30 minutos para detectar cambios
  useEffect(() => {
    if (!auth0IsAuthenticated || !backendSynced) return;

    const interval = setInterval(async () => {
      try {
        console.log("🔄 Auto-checking for role updates...");

        // Forzar nuevo token sin cache
        const freshToken = await getAccessTokenSilently({
          cacheMode: "off",
        });

        // Decodificar roles del token fresco
        const payload = JSON.parse(atob(freshToken.split(".")[1]));
        const freshRoles = payload["https://APIElBuenSabor/roles"] || [];

        // Comparar con rol actual
        const currentRole = backendUser?.usuario?.rol || backendUser?.rol;
        const freshRole = freshRoles[0]?.toUpperCase();

        if (freshRole && freshRole !== currentRole) {
          console.log(
            `🔄 Auto-detected role change: ${currentRole} → ${freshRole}`
          );

          // Forzar re-sync completo
          setBackendSynced(false);
          setSyncError(null);

          // Notificar al usuario
          window.dispatchEvent(
            new CustomEvent("roleUpdated", {
              detail: { oldRole: currentRole, newRole: freshRole },
            })
          );
        }
      } catch (error) {
        console.warn("⚠️ Auto role check failed:", error);
      }
    }, 30 * 60 * 1000); // 30 minutos

    return () => clearInterval(interval);
  }, [
    auth0IsAuthenticated,
    backendSynced,
    getAccessTokenSilently,
    backendUser,
  ]);

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

  /**
   * Forzar actualización de roles desde Auth0
   * VERSIÓN CON TOKEN REFRESH AGRESIVO
   */
  const refreshRoles = async () => {
    try {
      console.log("🔄 Refreshing roles from Auth0...");

      if (!auth0IsAuthenticated || !auth0User) {
        throw new Error("Usuario no autenticado");
      }

      // PASO 1: Verificar estado actual primero
      console.log("🔍 Checking current role state...");
      try {
        const currentState = await AuthService.getCurrentRoles();
        console.log("🔍 Current state:", currentState);

        if (currentState.rolesMatch) {
          console.log(
            "✅ Roles already match, checking if token needs refresh anyway..."
          );
        }
      } catch (error) {
        console.warn("⚠️ Could not check current state:", error);
      }

      // PASO 2: Forzar Auth0 a darnos un token COMPLETAMENTE nuevo
      console.log("🔄 Forcing Auth0 to provide fresh token...");

      let freshToken;
      try {
        // CRÍTICO: Usar todas las estrategias para forzar token fresco
        freshToken = await getAccessTokenSilently({
          cacheMode: "off", // No usar cache
          authorizationParams: {
            scope: "openid profile email",
            audience: "https://APIElBuenSabor", // Forzar audience específica
            prompt: "none", // Refresh silencioso pero forzado
          },
          timeoutInSeconds: 30,
        });

        console.log("✅ Fresh token obtained");
      } catch (tokenError: any) {
        console.warn("⚠️ First token attempt failed:", tokenError);

        // ESTRATEGIA ALTERNATIVA: Si falla, intentar con diferentes parámetros
        try {
          console.log("🔄 Trying alternative token refresh...");
          freshToken = await getAccessTokenSilently({
            cacheMode: "off",
            authorizationParams: {
              scope: "openid profile email",
            },
            timeoutInSeconds: 30,
          });
          console.log("✅ Alternative token refresh successful");
        } catch (secondError: any) {
          console.error("❌ All token refresh attempts failed:", secondError);

          // Si Auth0 no puede dar token fresco, necesitamos logout/login
          if (
            secondError.message?.includes("Login required") ||
            secondError.error === "login_required"
          ) {
            return {
              success: false,
              requiresRelogin: true,
              message:
                "Auth0 requiere re-autenticación para aplicar cambios de rol.",
            };
          }

          throw secondError;
        }
      }

      // PASO 3: Verificar si el token fresco tiene roles diferentes
      try {
        console.log("🔍 Checking roles in fresh token...");

        // Decodificar el token fresco para ver los roles
        const payload = JSON.parse(atob(freshToken.split(".")[1]));
        const freshRoles = payload["https://APIElBuenSabor/roles"] || [];
        const freshRole = freshRoles[0]?.toUpperCase();

        console.log("🔍 Fresh token roles:", freshRoles);
        console.log("🔍 Fresh token primary role:", freshRole);

        // Comparar con rol actual conocido
        const currentRole = backendUser?.rol || backendUser?.usuario?.rol;
        console.log("🔍 Current backend role:", currentRole);

        if (freshRole && freshRole !== currentRole?.toUpperCase()) {
          console.log(
            `🎯 Role change detected in token: ${currentRole} → ${freshRole}`
          );
        } else {
          console.log("ℹ️ No role change detected in fresh token");
        }
      } catch (decodeError) {
        console.warn("⚠️ Could not decode fresh token:", decodeError);
      }

      // PASO 4: Llamar al backend con el token fresco
      console.log("🔄 Calling backend with fresh token...");
      try {
        // Aquí necesitamos pasar el token fresco explícitamente al backend
        const refreshResult = await AuthService.refreshRolesWithToken(
          freshToken
        );

        if (refreshResult.success) {
          console.log("✅ Backend refresh successful:", refreshResult);

          if (
            refreshResult.oldRole &&
            refreshResult.newRole &&
            refreshResult.oldRole !== refreshResult.newRole
          ) {
            // Forzar actualización del estado local
            setBackendSynced(false);
            setSyncError(null);

            return {
              success: true,
              roleChanged: true,
              oldRole: refreshResult.oldRole,
              newRole: refreshResult.newRole,
              message: "Rol actualizado exitosamente",
            };
          } else {
            return {
              success: true,
              roleChanged: false,
              message: refreshResult.message || "No hay cambios de rol",
            };
          }
        } else {
          throw new Error(refreshResult.message || "Backend refresh failed");
        }
      } catch (backendError: any) {
        console.error("❌ Backend call failed:", backendError);

        // Si el backend falla, al menos forzamos re-sync local
        console.log("🔄 Forcing local re-sync due to backend error...");
        setBackendSynced(false);
        setSyncError(null);

        return {
          success: true,
          roleChanged: true, // Asumimos cambio para forzar recarga
          message: "Forzando actualización por token fresco obtenido",
        };
      }
    } catch (error: any) {
      console.error("❌ Complete refresh process failed:", error);

      return {
        success: false,
        requiresRelogin: false,
        message: error.message || "Error en proceso de actualización",
      };
    }
  };

  /**
   * Debug: Verificar estado de roles actual
   */
  const debugRoles = async () => {
    try {
      const rolesInfo = await AuthService.getCurrentRoles();
      console.log("🔍 Current roles debug info:", rolesInfo);
      return rolesInfo;
    } catch (error) {
      console.error("❌ Error debugging roles:", error);
      throw error;
    }
  };

  /**
   * Verificar si han pasado más de X horas desde el último token
   * Para sugerir refresh automático
   */
  const shouldRefreshRoles = () => {
    if (!backendUser || !backendUser.token) return false;

    try {
      // Decodificar JWT para ver cuándo fue emitido
      const payload = JSON.parse(atob(backendUser.token.split(".")[1]));
      const issuedAt = payload.iat * 1000; // Convertir a ms
      const now = Date.now();
      const hoursOld = (now - issuedAt) / (1000 * 60 * 60);

      // Sugerir refresh si el token tiene más de 2 horas
      return hoursOld > 2;
    } catch (error) {
      return false;
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

    // Métodos de actualización de roles - AGREGADOS
    refreshRoles,
    shouldRefreshRoles,
    debugRoles,

    // Método para refrescar sincronización
    refreshSync: () => setBackendSynced(false),
  };
};
