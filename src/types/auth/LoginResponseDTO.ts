export interface LoginResponseDTO {
  token: string;
  tipo: string; // "Bearer"
  email: string;
  rol: string;
  userId: number;
  mensaje: string;
}
