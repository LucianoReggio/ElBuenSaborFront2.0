import type { ImagenDTO } from "../common/Index";
import type { DomicilioDTO } from "./Index";

export interface ClienteResponseDTO {
  idCliente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string; // ISO date string
  domicilios: DomicilioDTO[]; // Array de domicilios
  imagen?: ImagenDTO;
}
