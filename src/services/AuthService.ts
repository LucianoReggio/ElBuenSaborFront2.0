import { apiClienteService } from './ApiClientService';
import type { LoginRequestDTO, LoginResponseDTO, UserInfo } from '../types/auth/index';

export class AuthService {
  private static readonly BASE_URL = '/auth'; // Esto se combinará con /api del ApiClienteService
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_info';

  // Event listeners para cambios de autenticación
  private static listeners: (() => void)[] = [];

  /**
   * Suscribirse a cambios de autenticación
   */
  static subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notificar cambios a todos los listeners
   */
  private static notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Realiza el login del usuario
   */
  static async login(credentials: LoginRequestDTO): Promise<LoginResponseDTO> {
    try {
      const loginResponse = await apiClienteService.post<LoginResponseDTO>(`${this.BASE_URL}/login`, credentials);
      
      // Guardar token y datos del usuario en localStorage
      this.setToken(loginResponse.token);
      
      // Crear objeto UserInfo más completo
      const userInfo: UserInfo = {
        email: loginResponse.email,
        rol: loginResponse.rol,
        userId: loginResponse.userId,
        // Si el backend devuelve estos campos, inclúyelos
        nombre: (loginResponse as any).nombre || 'Usuario',
        apellido: (loginResponse as any).apellido || ''
      };
      
      this.setUserInfo(userInfo);
      
      return loginResponse;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  /**
   * Valida el token actual
   */
  static async validateToken(token?: string): Promise<boolean> {
    try {
      const tokenToValidate = token || this.getToken();
      if (!tokenToValidate) return false;

      // El token se envía automáticamente en el header por ApiClienteService
      const response = await apiClienteService.get<{ valid?: boolean }>(`${this.BASE_URL}/validate`);
      
      // Si el backend devuelve un objeto con valid, úsalo; sino, considera true si no hay error
      return response.valid !== false;
    } catch (error) {
      console.error('Error validating token:', error);
      this.logout(); // Limpiar tokens inválidos
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

      const response = await apiClienteService.get<any>(`${this.BASE_URL}/me`);
      
      if (response.valid) {
        const userInfo: UserInfo = {
          email: response.email,
          rol: response.rol || this.getUserInfo()?.rol || 'CLIENTE',
          userId: response.userId || this.getUserInfo()?.userId || 0,
          nombre: response.nombre || 'Usuario',
          apellido: response.apellido || ''
        };
        
        this.setUserInfo(userInfo);
        return userInfo;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
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
   * Manejo centralizado de errores
   */
  private static handleError(error: any): Error {
    // El error ya viene procesado desde ApiClienteService
    return error instanceof Error ? error : new Error('Error al iniciar sesión');
  }
}