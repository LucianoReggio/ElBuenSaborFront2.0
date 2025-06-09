import { apiClienteService } from './ApiClientService';
import type { LoginRequestDTO, LoginResponseDTO, UserInfo } from '../types/auth/index';

export class AuthService {
  private static readonly BASE_URL = '/auth'; // Cambié de '/api/auth' a '/auth' para evitar duplicar /api
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly USER_KEY = 'user_info';

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

      // Cambié a GET que es más apropiado para validación
      await apiClienteService.get<any>(`${this.BASE_URL}/validate`);
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
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