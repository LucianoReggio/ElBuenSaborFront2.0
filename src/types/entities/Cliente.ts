

import type { Pedido } from "./Pedido";
import type { Domicilio } from "./Domicilio";
import type { Usuario } from "./Usuario";
import type { Imagen } from "./Imagen";

export interface Cliente {
  idCliente: number;
  nombre: string;
  apellido: string;
  telefono: string;
  email: string;
  fechaNacimiento: string; // o Date, según cómo lo maneje tu backend
  pedidos?: Pedido[];
  domicilios?: Domicilio[];
  usuario?: Usuario;
  imagen?: Imagen;
}
