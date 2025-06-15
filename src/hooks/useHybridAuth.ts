// src/hooks/useHybridAuth.ts
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthService } from '../services/AuthService';
import type { LoginRequestDTO } from '../types/auth/LoginRequestDTO';
import type { LoginResponseDTO } from '../types/auth/LoginResponseDTO';
import type { UserInfo } from '../types/auth/UserInfo';

export interface HybridAuthUser extends UserInfo {
  authProvider: 'local' | 'auth0';
  auth0User?: any; // Datos adicionales de Auth0 si aplica
}

export const useHybridAuth = () => {
  const {
    user: auth0User,
    isAuthenticated: auth0IsAuthenticated,
    isLoading: auth0Loading,
    loginWithPopup,
    logout: auth0Logout,
    getAccessTokenSilently
  } = useAuth0();

  const [localUser, setLocalUser] = useState<UserInfo | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado combinado
  const [hybridUser, setHybridUser] = useState<HybridAuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Verificar autenticación local al iniciar
  useEffect(() => {
    checkLocalAuth();
  }, []);

  // Procesar usuario Auth0 cuando cambie
  useEffect(() => {
    if (auth0IsAuthenticated && auth0User) {
      processAuth0User();
    } else if (!auth0Loading) {
      // Si Auth0 terminó de cargar y no hay usuario, verificar solo local
      updateHybridState();
    }
  }, [auth0IsAuthenticated, auth0User, auth0Loading]);

  // Actualizar estado híbrido cuando cambie el usuario local
  useEffect(() => {
    updateHybridState();
  }, [localUser]);

  const checkLocalAuth = async () => {
    setLocalLoading(true);
    try {
      const token = AuthService.getToken();
      if (token) {
        const isValid = await AuthService.validateToken(token);
        if (isValid) {
          const userInfo = AuthService.getUserInfo();
          setLocalUser(userInfo);
        } else {
          AuthService.logout();
          setLocalUser(null);
        }
      } else {
        setLocalUser(null);
      }
    } catch (error) {
      console.error('Error checking local auth:', error);
      AuthService.logout();
      setLocalUser(null);
    } finally {
      setLocalLoading(false);
    }
  };

 // Agregar esta función de debug al processAuth0User en useHybridAuth.ts

const processAuth0User = async () => {
  if (!auth0User) return;

  try {
    console.log('🔍 AUTH0 USER DATA:', auth0User);

    // Obtener token de Auth0
    const token = await getAccessTokenSilently({
      authorizationParams: {
        audience: 'https://APIElBuenSabor',
        scope: 'openid profile email'
      }
    });
    
    console.log('🔍 AUTH0 TOKEN:', token);

    // 🆕 ENVIAR DATOS DEL USUARIO DESDE EL FRONTEND
    const userData = {
      email: auth0User.email || null,
      given_name: auth0User.given_name || null,
      family_name: auth0User.family_name || null,
      name: auth0User.name || null,
      picture: auth0User.picture || null
    };

    console.log('🔍 USER DATA TO SEND:', userData);

    // Procesar usuario con nuestro backend - ENVIAR DATOS EN EL BODY
    const response = await fetch('http://localhost:8080/api/auth0/login', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData) // 🆕 AGREGAR DATOS DEL USUARIO
    });

    if (response.ok) {
      const data = await response.json();
      console.log('🔍 BACKEND RESPONSE:', data);
      
      if (data.success) {
        // Crear usuario híbrido con datos de Auth0
        const hybridUserData: HybridAuthUser = {
          userId: data.user.userId || 0,
          email: auth0User.email || '',
          rol: data.user.rol || 'CLIENTE',
          nombre: auth0User.given_name || auth0User.name || 'Usuario',
          apellido: auth0User.family_name || '',
          authProvider: 'auth0',
          auth0User: auth0User
        };
        
        console.log('🔍 HYBRID USER DATA:', hybridUserData);
        
        setHybridUser(hybridUserData);
        setIsAuthenticated(true);
      }
    } else {
      console.error('❌ Backend response not OK:', response.status);
      setError('Error sincronizando usuario con Auth0');
    }
  } catch (error) {
    console.error('❌ Error processing Auth0 user:', error);
    setError('Error procesando usuario de Auth0');
  }
};
  const updateHybridState = () => {
    if (auth0IsAuthenticated && hybridUser?.authProvider === 'auth0') {
      // Usuario Auth0 ya procesado
      setIsAuthenticated(true);
    } else if (localUser) {
      // Usuario local
      const hybridUserData: HybridAuthUser = {
        ...localUser,
        authProvider: 'local'
      };
      setHybridUser(hybridUserData);
      setIsAuthenticated(true);
    } else {
      // No hay usuario autenticado
      setHybridUser(null);
      setIsAuthenticated(false);
    }

    // Determinar si está cargando
    const isLoading = auth0Loading || localLoading;
    setLoading(isLoading);
  };

  // Login local (método existente)
  const loginLocal = async (credentials: LoginRequestDTO): Promise<LoginResponseDTO> => {
    setLocalLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(credentials);
      
      // Actualizar usuario local
      const userData = {
        email: response.email,
        userId: response.userId,
        rol: response.rol,
        nombre: response.nombre || 'Usuario',
        apellido: response.apellido || ''
      };
      
      setLocalUser(userData);
      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al iniciar sesión';
      setError(errorMessage);
      throw err;
    } finally {
      setLocalLoading(false);
    }
  };

  // Login con Auth0
const loginAuth0 = async () => {
  setError(null);
  try {
    await loginWithPopup({
      authorizationParams: {
        audience: 'https://APIElBuenSabor',
        scope: 'openid profile email' // 🆕 AGREGADO: scopes específicos
      }
    });
  } catch (error: any) {
    console.error('Auth0 login error:', error);
    setError('Error al iniciar sesión con Auth0');
    throw error;
  }
};

  // Logout híbrido
  const logout = () => {
    // Logout local
    AuthService.logout();
    setLocalUser(null);
    
    // Logout Auth0 si está autenticado
    if (auth0IsAuthenticated) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin
        }
      });
    }
    
    // Limpiar estado híbrido
    setHybridUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // Refresh auth
  const refreshAuth = async () => {
    await checkLocalAuth();
  };

  return {
    // Estado principal
    user: hybridUser,
    isAuthenticated,
    loading,
    error,
    
    // Métodos de autenticación
    loginLocal,
    loginAuth0,
    logout,
    refreshAuth,
    
    // Estado específico por proveedor
    auth0User,
    localUser,
    auth0IsAuthenticated,
    
    // Loading específico
    auth0Loading,
    localLoading
  };
  
};