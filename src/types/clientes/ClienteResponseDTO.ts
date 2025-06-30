import type { ImagenDTO } from "../common/Index";
import type { DomicilioResponseDTO } from "./DomicilioDTO";

export interface ClienteResponseDTO {
  idCliente: number;
  idUsuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string; // ISO date string
  domicilios: DomicilioResponseDTO[]; // ✅ Actualizado para usar DomicilioResponseDTO
  imagen?: ImagenDTO;
  rol: string;
}
