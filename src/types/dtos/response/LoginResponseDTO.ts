export interface LoginResponseDTO {
  token: string;
  tipo: string;   // usualmente "Bearer"
  email: string;
  rol: string;
  userId: number;
  mensaje: string;
}
