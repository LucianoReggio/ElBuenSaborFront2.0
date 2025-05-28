export interface CategoriaInfo {
  idCategoria: number;
  denominacion: string;
  esSubcategoria: boolean;
  categoriaPadre?: string | null;
}

