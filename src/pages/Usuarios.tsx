// src/pages/Usuarios.tsx
import { useUsuarios } from "../hooks/useUsuarios";
import { Table } from "../components/common/Table";
import type { TableColumn } from "../components/common/Table";
import { useState, useEffect } from "react";

type UsuarioType = {
  idUsuario: number;
  email: string;
  rol: string;
  nombre: string;
  apellido: string;
};

const columns: TableColumn<UsuarioType>[] = [
  { key: "idUsuario", title: "Id" },
  { key: "email", title: "Email" },
  { key: "rol", title: "Rol" },
  { key: "nombre", title: "Nombre" },
  { key: "apellido", title: "Apellido" },
  {
    key: "acciones",
    title: "Acciones",
    align: "right",
    render: (_: any, u) => (
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg"
        title="Ver"
      >
        Ver
      </button>
    ),
  },
];

const Usuarios = () => {
  const { usuarios, loading } = useUsuarios();
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [resultados, setResultados] = useState<UsuarioType[]>([]);

  useEffect(() => {
    const filtrados = usuarios.filter((u: UsuarioType) =>
      u.email.toLowerCase().includes(filtroEmail.toLowerCase()) &&
      u.rol.toLowerCase().includes(filtroRol.toLowerCase())
    );
    setResultados(filtrados);
  }, [usuarios, filtroEmail, filtroRol]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Gestión de Usuarios</h2>
      <p className="text-gray-600 mb-6">Administre los usuarios registrados</p>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="text"
            className="border rounded px-3 py-1 text-sm"
            placeholder="Buscar por email"
            value={filtroEmail}
            onChange={(e) => setFiltroEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Rol</label>
          <select
            className="border rounded px-3 py-1 text-sm"
            value={filtroRol}
            onChange={(e) => setFiltroRol(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="ADMIN">Admin</option>
            <option value="CLIENTE">Cliente</option>
            <option value="COCINERO">Cocinero</option>
            <option value="CAJERO">Cajero</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>
      </div>

      <Table
        columns={columns}
        data={resultados}
        loading={loading}
        emptyText="No hay usuarios encontrados"
      />
    </div>
  );
};

export default Usuarios;
