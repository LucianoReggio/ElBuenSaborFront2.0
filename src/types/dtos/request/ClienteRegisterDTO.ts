import type { DomicilioDTO } from './DomicilioDTO';
import type { ImagenDTO } from './ImagenDTO';

export interface ClienteRegisterDTO {
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaNacimiento: string; // Formato ISO (yyyy-MM-dd), ideal para enviar como string desde el front
  domicilio: DomicilioDTO;
  imagen?: ImagenDTO;
  password: string;
  confirmPassword: string;
}
