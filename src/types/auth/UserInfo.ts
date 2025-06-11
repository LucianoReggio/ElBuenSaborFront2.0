export interface UserInfo {
  userId: number;
  email: string;
  rol: string;
  nombre?: string;  // Opcional por si el backend no lo devuelve en el login
  apellido?: string; // Opcional por si el backend no lo devuelve en el login
  imagen?: {
    url: string;
    denominacion: string;
  };
}