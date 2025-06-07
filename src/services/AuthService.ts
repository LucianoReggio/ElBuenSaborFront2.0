import { apiClienteService } from './ApiClientService';
import type { LoginRequestDTO, LoginResponseDTO, UserInfo } from '../types/auth/index';


export class AuthService {
  private static readonly BASE_URL = '/api/auth';
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
      this.setUserInfo({
        email: loginResponse.email,
        rol: loginResponse.rol,
        userId: loginResponse.userId
      });
      
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

      // El token se agrega automáticamente en los headers por ApiClienteService
      const response = await apiClienteService.post<boolean>(`${this.BASE_URL}/validate`, {});
      return response;
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
    const message = error.response?.data?.message || 
                   error.response?.data?.error || 
                   'Error al iniciar sesión';
    return new Error(message);
  }
}