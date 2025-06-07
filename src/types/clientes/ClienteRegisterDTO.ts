import type { ImagenDTO } from "../common/Index";
import type { DomicilioDTO } from "./Index";

export interface ClienteRegisterDTO {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaNacimiento: string; // ISO date string (YYYY-MM-DD)
  domicilio: DomicilioDTO;
  imagen?: ImagenDTO;
  password: string;
  confirmPassword: string;
}