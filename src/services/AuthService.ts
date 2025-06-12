import * as auth0 from "auth0-js";
import type {
  LoginRequestDTO,
  LoginResponseDTO,
  UserInfo,
} from "../types/auth/index";

export class AuthService {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly USER_KEY = "user_info";

  // Configuración de Auth0
  private static auth0Client = new auth0.WebAuth({
    domain: "dev-ik2kub20ymu4sfpr.us.auth0.com",
    clientID: "4u4F4fKQrsD9Bvvh9ODZ0tnqzR431TBV",
    redirectUri: window.location.origin + "/callback",
    audience: "http://localhost:8080/api",
    responseType: "token id_token",
    scope: "openid profile email",
  });

  // Event listeners para cambios de autenticación
  private static listeners: (() => void)[] = [];

  /**
   * Suscribirse a cambios de autenticación
   */
  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notificar cambios a todos los listeners
   */
  private static notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Realiza el login del usuario usando Auth0
   */
  static async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    return new Promise((resolve, reject) => {
      this.auth0Client.login(
        {
          realm: "Username-Password-Authentication", // Conexión de base de datos de Auth0
          username: credentials.email,
          password: credentials.password,
          audience: "http://localhost:8080/api",
          scope: "openid profile email",
        },
        async (err, authResult) => {
          if (err) {
            console.error("Auth0 login error:", err);
            reject(new Error(this.getErrorMessage(err)));
            return;
          }

          if (authResult && authResult.accessToken && authResult.idToken) {
            try {
              // Guardar tokens
              this.setToken(authResult.accessToken);

              // Obtener información del usuario de Auth0
              const userProfile = await this.getUserProfile(
                authResult.accessToken
              );

              // Sincronizar con nuestro backend
              const backendResponse = await this.syncWithBackend(
                authResult.accessToken
              );

              // Crear respuesta compatible con tu sistema anterior
              const loginResponse: LoginResponseDTO = {
                token: authResult.accessToken,
                email: userProfile.email || "",
                rol: backendResponse.usuario?.rol || "CLIENTE",
                userId: backendResponse.idCliente || 0,
                nombre: backendResponse.nombre || "",
                apellido: backendResponse.apellido || "",
                tipo: "Bearer",
                mensaje: "Login exitoso",
              };

              // Guardar info del usuario
              const userInfo: UserInfo = {
                email: loginResponse.email || "",
                rol: loginResponse.rol || "CLIENTE",
                userId: loginResponse.userId || 0,
                nombre: loginResponse.nombre || "Usuario",
                apellido: loginResponse.apellido || "",
              };

              this.setUserInfo(userInfo);
              resolve(loginResponse);
            } catch (syncError) {
              console.error("Error syncing with backend:", syncError);
              reject(new Error("Error sincronizando con el servidor"));
            }
          } else {
            reject(new Error("No se recibió token de autenticación"));
          }
        }
      );
    });
  }

  /**
   * Registra un nuevo usuario usando Auth0
   */
  static async register(userData: any): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log("🔄 Iniciando registro en Auth0 con datos:", {
        email: userData.email,
        password: userData.password ? "[HIDDEN]" : "NO PASSWORD",
        userMetadata: {
          nombre: userData.nombre,
          apellido: userData.apellido,
          telefono: userData.telefono,
        },
      });

      this.auth0Client.signup(
        {
          connection: "Username-Password-Authentication",
          email: userData.email,
          password: userData.password,
          userMetadata: {
            nombre: userData.nombre,
            apellido: userData.apellido,
            telefono: userData.telefono,
            fechaNacimiento: userData.fechaNacimiento,
            // Convertir domicilio a string JSON
            domicilio: JSON.stringify(userData.domicilio),
            // O como campos separados:
            calle: userData.domicilio?.calle || "",
            numero: userData.domicilio?.numero?.toString() || "",
            cp: userData.domicilio?.cp?.toString() || "",
            localidad: userData.domicilio?.localidad || "",
          },
        },
        (err, result) => {
          if (err) {
            console.error("❌ Auth0 signup error details:", {
              code: err.code,
              description: err.description,
              statusCode: err.statusCode,
              name: err.name,
              original: err.original,
              fullError: err,
            });
            reject(new Error(this.getErrorMessage(err)));
            return;
          }

          console.log("✅ Usuario registrado exitosamente en Auth0:", result);
          resolve();
        }
      );
    });
  }

  /**
   * Login con Google usando Auth0
   */
  static loginWithGoogle(): void {
    this.auth0Client.authorize({
      connection: "google-oauth2",
    });
  }

  /**
   * Obtener perfil del usuario desde Auth0
   */
  private static getUserProfile(accessToken: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.auth0Client.client.userInfo(accessToken, (err, profile) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(profile);
      });
    });
  }

  /**
   * Sincronizar usuario con nuestro backend
   */
  private static async syncWithBackend(token: string): Promise<any> {
    const response = await fetch("http://localhost:8080/api/auth/callback", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error sincronizando con backend");
    }

    return await response.json();
  }

  /**
   * Valida el token actual
   */
  static async validateToken(token?: string): Promise<boolean> {
    try {
      const tokenToValidate = token || this.getToken();
      if (!tokenToValidate) return false;

      const response = await fetch("http://localhost:8080/api/auth/validate", {
        headers: {
          Authorization: `Bearer ${tokenToValidate}`,
        },
      });

      return response.ok;
    } catch (error) {
      console.error("Error validating token:", error);
      this.logout();
      return false;
    }
  }

  /**
   * Obtiene información del usuario actual desde el backend
   */
  static async getCurrentUser(): Promise<UserInfo | null> {
    try {
      const token = this.getToken();
      if (!token) return null;

      const response = await fetch("http://localhost:8080/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        const userInfo: UserInfo = {
          email: userData.email || "",
          rol: userData.usuario?.rol || "CLIENTE",
          userId: userData.idCliente || 0,
          nombre: userData.nombre || "Usuario",
          apellido: userData.apellido || "",
        };

        this.setUserInfo(userInfo);
        return userInfo;
      }

      return null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Procesar callback de Auth0 (para Google login)
   */
  static handleAuthCallback(): Promise<{
    accessToken: string;
    userProfile: any;
  }> {
    return new Promise(async (resolve, reject) => {
      try {
        // Parsear el hash de la URL
        const hash = window.location.hash;
        if (hash && hash.includes("access_token=")) {
          const params = new URLSearchParams(hash.substring(1));
          const accessToken = params.get("access_token");

          if (accessToken) {
            // Obtener perfil del usuario
            const userProfile = await this.getUserProfileFromHash(accessToken);
            resolve({ accessToken, userProfile });
          } else {
            reject(new Error("No access token found"));
          }
        } else {
          reject(new Error("No authentication hash found"));
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Obtener perfil del usuario desde el token en el hash
   */
  private static async getUserProfileFromHash(token: string): Promise<any> {
    const response = await fetch(
      `https://dev-ik2kub20ymu4sfpr.us.auth0.com/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error obteniendo perfil de usuario");
    }

    return await response.json();
  }

  /**
   * Obtiene el token del localStorage
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Guarda el token en localStorage
   */
  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.notifyListeners();
  }

  /**
   * Obtiene la información del usuario del localStorage
   */
  static getUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem(this.USER_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Guarda la información del usuario en localStorage
   */
  static setUserInfo(userInfo: UserInfo): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
    this.notifyListeners();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const userInfo = this.getUserInfo();
    return token !== null && userInfo !== null;
  }

  /**
   * Cierra la sesión del usuario
   */
  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.notifyListeners();

    // Logout de Auth0
    this.auth0Client.logout({
      returnTo: window.location.origin,
      clientID: "4u4F4fKQrsD9Bvvh9ODZ0tnqzR431TBV",
    });
  }

  /**
   * Obtiene el rol del usuario actual
   */
  static getUserRole(): string | null {
    const userInfo = this.getUserInfo();
    return userInfo?.rol || null;
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  static hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Obtener mensaje de error legible
   */
  private static getErrorMessage(error: any): string {
    if (error.code === "invalid_user_password") {
      return "Email o contraseña incorrectos";
    }
    if (error.code === "too_many_attempts") {
      return "Demasiados intentos fallidos. Intenta más tarde";
    }
    if (error.description) {
      return error.description;
    }
    return error.error || "Error de autenticación";
  }
}
