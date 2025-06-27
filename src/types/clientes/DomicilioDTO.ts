/**
 * DTO para respuesta de domicilios (desde el backend)
 */
export interface DomicilioResponseDTO {
  idDomicilio: number;
  calle: string;
  numero: number;
  cp: number;
  localidad: string;
  esPrincipal: boolean;
  direccionCompleta: string; // Campo calculado por el backend
}

/**
 * DTO para requests de domicilios (hacia el backend)
 */
export interface DomicilioRequestDTO {
  calle: string;
  numero: number;
  cp: number;
  localidad: string;
  esPrincipal: boolean;
}

/**
 * DTO legacy - mantenido por compatibilidad
 * @deprecated Usar DomicilioResponseDTO o DomicilioRequestDTO
 */
export interface DomicilioDTO {
  idDomicilio?: number;
  calle: string;
  numero: number;
  cp: number;
  localidad: string;
}
