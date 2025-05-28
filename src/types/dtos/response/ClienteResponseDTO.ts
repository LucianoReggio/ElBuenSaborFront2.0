import type { DomicilioDTO } from '../request/DomicilioDTO';
import type { ImagenDTO } from '../request/ImagenDTO';

export interface ClienteResponseDTO {
  idCliente: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento: string;          // LocalDate se recibe como string en ISO (ej: "2025-05-28")

  domicilios: DomicilioDTO[];
  imagen?: ImagenDTO | null;        // Puede no existir o ser null
}
