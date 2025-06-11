export interface LoginResponseDTO {
  apellido: string;
  nombre: string;
  token: string;
  tipo: string; // "Bearer"
  email: string;
  rol: string;
  userId: number;
  mensaje: string;
}
