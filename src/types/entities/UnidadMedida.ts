import type { Articulo } from './Articulo';

export class UnidadMedida {
  idUnidadMedida?: number;
  denominacion: string;
  articulos: Articulo[] = [];

  constructor(denominacion: string, idUnidadMedida?: number, articulos?: Articulo[]) {
    this.denominacion = denominacion;
    if (idUnidadMedida) this.idUnidadMedida = idUnidadMedida;
    if (articulos) this.articulos = articulos;
  }
}
