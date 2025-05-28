import type{ Articulo } from "./Articulo";
import type{ SucursalEmpresa } from "./SucursalEmpresa";

export interface Categoria {
  idCategoria: number;
  denominacion: string;
  esSubcategoria: boolean;
  articulos?: Articulo[];
  categoriaPadre?: Categoria;
  subcategorias?: Categoria[];
  sucursales?: SucursalEmpresa[];
}