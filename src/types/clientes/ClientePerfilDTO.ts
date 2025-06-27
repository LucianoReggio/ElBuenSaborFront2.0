import type { ImagenDTO } from "../common/Index";

/**
 * DTO específico para editar información personal del perfil
 * No incluye domicilios (se manejan por separado) ni email (se maneja en Auth0)
 */
export interface ClientePerfilDTO {
  nombre: string;
  apellido: string;
  telefono: string;
  fechaNacimiento: string; // ISO date string
  imagen?: ImagenDTO;
}

/**
 * DTO para estadísticas del perfil
 */
export interface ClienteEstadisticasDTO {
  idCliente: number;
  nombreCompleto: string;
  email: string;
  cantidadDomicilios: number;
  tieneImagen: boolean;
  fechaNacimiento: string;
}

/**
 * DTO para configuración de Auth0
 */
export interface Auth0ConfigDTO {
  changePasswordUrl: string;
  manageAccountUrl: string;
  userSubject: string;
}
