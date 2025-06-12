import { AuthService } from "./AuthService";
import type { ClienteRegisterDTO } from "../types/clientes/Index";

export class ClienteService {
  /**
   * Registra un nuevo cliente usando Auth0
   */
  static async registerCliente(data: ClienteRegisterDTO): Promise<void> {
    try {
      // Registrar en Auth0
      await AuthService.register({
        email: data.email,
        password: data.password,
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono,
        fechaNacimiento: data.fechaNacimiento,
        domicilio: data.domicilio,
      });

      console.log("Cliente registrado exitosamente en Auth0");
    } catch (error: any) {
      console.error("Error registrando cliente:", error);
      throw new Error(this.getErrorMessage(error));
    }
  }

  /**
   * Obtener mensaje de error legible
   */
  private static getErrorMessage(error: any): string {
    if (error.message?.includes("user_exists")) {
      return "Ya existe un usuario con este email";
    }
    if (error.message?.includes("password")) {
      return "La contraseña no cumple con los requisitos mínimos";
    }
    return error.message || "Error al registrar el usuario";
  }
}
