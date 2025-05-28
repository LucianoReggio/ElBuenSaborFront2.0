import type { Empresa } from "./Empresa";
import type { Domicilio } from "./Domicilio";
import type { Promocion } from "./Promocion";
import type { Categoria } from "./Categoria";
import type { Pedido } from "./Pedido";

export interface SucursalEmpresa {
  idSucursalEmpresa: number;
  nombre: string;
  horarioApertura: string; // formato "HH:mm:ss"
  horarioCierre: string;   // formato "HH:mm:ss"
  empresa: Empresa;
  domicilio?: Domicilio;   // opcional, puede no estar
  promociones: Promocion[];
  categorias: Categoria[];
  pedidos: Pedido[];
}
