import type { ImagenDTO } from './ImagenDTO';

export interface ArticuloInsumoRequestDTO {
  denominacion: string;
  precioVenta: number;
  idUnidadMedida: number;
  idCategoria: number;
  precioCompra: number;
  stockActual: number;
  stockMaximo: number;
  esParaElaborar: boolean;
  imagen?: ImagenDTO;
}
