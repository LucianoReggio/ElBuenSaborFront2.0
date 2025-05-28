import type { ImagenDTO } from '../request/ImagenDTO';
import type { ManufacturadoDetalleDTO } from '../request/ManufacturadoDetalleDTO';

export interface CategoriaInfo {
  idCategoria: number;
  denominacion: string;
  esSubcategoria: boolean;
  denominacionCategoriaPadre?: string;
}

export interface ArticuloManufacturadoResponseDTO {
  idArticulo: number;
  denominacion: string;
  precioVenta: number;

  idUnidadMedida: number;
  denominacionUnidadMedida: string;

  categoria: CategoriaInfo;

  descripcion?: string;
  tiempoEstimadoEnMinutos: number;
  preparacion?: string;

  detalles: ManufacturadoDetalleDTO[];

  costoTotal: number;
  margenGanancia: number;
  cantidadIngredientes: number;
  stockSuficiente: boolean;
  cantidadMaximaPreparable: number;

  imagenes: ImagenDTO[];

  cantidadVendida: number;
}
