export interface UserInfo {
  email: string;
  rol: string;
  userId: number;
  nombre: string;
  apellido: string;
  imagen?: {
    url: string;
    denominacion: string;
  };
}
