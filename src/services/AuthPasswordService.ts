import { apiClienteService } from "./ApiClienteService";

/**
 * Servicio para operaciones de autenticación y contraseñas
 */
export class AuthPasswordService {
  private static readonly BASE_URL = "/clientes/perfil";

  /**
   * Solicita el envío de email para cambio de contraseña
   */
  static async requestPasswordReset(): Promise<{
    success: boolean;
    message: string;
    email?: string;
  }> {
    try {
      const response = await apiClienteService.post<{
        success: boolean;
        message: string;
        email?: string;
        auth0_status?: string;
        auth0_response?: string;
      }>(`${this.BASE_URL}/password-reset`);

      return {
        success: response.success,
        message: response.message,
        email: response.email,
      };
    } catch (error: any) {
      // Manejo silencioso de errores para mejor UX
      return {
        success: false,
        message: error.message || "Error al solicitar cambio de contraseña",
      };
    }
  }

  /**
   * Detecta el tipo de conexión del usuario basado en su Auth0 ID
   * @param userSub - Subject del usuario de Auth0 (ej: "google-oauth2|123456789")
   * @returns Tipo de conexión detectado
   */
  static detectConnectionType(
    userSub: string
  ): "google-oauth2" | "username-password" | "unknown" {
    if (!userSub) return "unknown";

    if (userSub.startsWith("google-oauth2|")) {
      return "google-oauth2";
    } else if (
      userSub.startsWith("auth0|") ||
      userSub.includes("Username-Password-Authentication")
    ) {
      return "username-password";
    }

    return "unknown";
  }

  /**
   * Determina si un usuario puede cambiar su contraseña a través de Auth0
   * @param userSub - Subject del usuario de Auth0
   * @returns true si puede cambiar contraseña, false si es usuario social
   */
  static canChangePassword(userSub: string): boolean {
    const connectionType = this.detectConnectionType(userSub);
    return connectionType === "username-password";
  }

  /**
   * Obtiene la URL apropiada para gestión de contraseña según el tipo de usuario
   * @param userSub - Subject del usuario de Auth0
   * @returns URL de gestión de contraseña
   */
  static getPasswordManagementUrl(userSub: string): string {
    const connectionType = this.detectConnectionType(userSub);

    switch (connectionType) {
      case "google-oauth2":
        return "https://myaccount.google.com/security";
      case "username-password":
        return "https://dev-ik2kub20ymu4sfpr.us.auth0.com/login?screen_hint=forgot_password";
      default:
        return "https://dev-ik2kub20ymu4sfpr.us.auth0.com/login";
    }
  }

  /**
   * Obtiene el mensaje apropiado para el usuario según su tipo de conexión
   * @param userSub - Subject del usuario de Auth0
   * @returns Objeto con título y descripción del mensaje
   */
  static getPasswordChangeMessage(userSub: string): {
    title: string;
    description: string;
    buttonText: string;
  } {
    const connectionType = this.detectConnectionType(userSub);

    switch (connectionType) {
      case "google-oauth2":
        return {
          title: "Gestionar Contraseña en Google",
          description:
            "Tu cuenta está vinculada con Google. Gestiona tu contraseña desde Google.",
          buttonText: "🔗 Ir a Google",
        };
      case "username-password":
        return {
          title: "Cambiar Contraseña",
          description:
            "Te enviaremos un email con instrucciones para cambiar tu contraseña.",
          buttonText: "🔑 Enviar Email",
        };
      default:
        return {
          title: "Gestionar Contraseña",
          description: "Gestiona la configuración de seguridad de tu cuenta.",
          buttonText: "🔒 Configurar",
        };
    }
  }

  /**
   * Obtiene el tipo de cuenta en formato legible
   * @param userSub - Subject del usuario de Auth0
   * @returns Descripción del tipo de cuenta
   */
  static getAccountTypeDescription(userSub: string): string {
    const connectionType = this.detectConnectionType(userSub);

    switch (connectionType) {
      case "google-oauth2":
        return "🔗 Google OAuth";
      case "username-password":
        return "📧 Email/Contraseña";
      default:
        return "❓ Tipo desconocido";
    }
  }
}
