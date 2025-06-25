// src/pages/Usuarios.tsx
import { useUsuarios } from "../hooks/useUsuarios";
import { LoadingSpinner } from "../components/common/LoadingSpinner";
import { useState } from "react";

const Usuarios = () => {
  const { usuarios, loading } = useUsuarios();
  const [filtroEmail, setFiltroEmail] = useState("");
  const [filtroRol, setFiltroRol] = useState("");
  const [resultados, setResultados] = useState(usuarios);

  const buscarUsuarios = () => {
    const filtrados = usuarios.filter((u) =>
      u.email.toLowerCase().includes(filtroEmail.toLowerCase()) &&
      u.rol.toLowerCase().includes(filtroRol.toLowerCase())
    );
    setResultados(filtrados);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Gestión de Usuarios</h2>
      <p className="text-gray-600 mb-6">Administre los usuarios registrados</p>

      {/* 🔍 Filtros */}
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

        <button
          onClick={buscarUsuarios}
          className="bg-[#CD6C50] hover:bg-[#b3593f] text-white px-4 py-2 rounded"
        >
          Buscar
        </button>
      </div>

      {/* 🧾 Tabla */}
      <div className="bg-white shadow rounded-lg overflow-hidden border">
        <table className="w-full table-auto text-left">
          <thead className="bg-[#CD6C50] text-white text-sm">
            <tr>
              <th className="px-4 py-2">Id</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Rol</th>
              <th className="px-4 py-2">Nombre</th>
              <th className="px-4 py-2">Apellido</th>
              <th className="px-4 py-2 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {(resultados.length > 0 ? resultados : usuarios).map((u) => (
              <tr key={u.idUsuario} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-t">{u.idUsuario}</td>
                <td className="px-4 py-2 border-t">{u.email}</td>
                <td className="px-4 py-2 border-t">{u.rol}</td>
                <td className="px-4 py-2 border-t">{u.nombre}</td>
                <td className="px-4 py-2 border-t">{u.apellido}</td>
                <td className="px-4 py-2 border-t text-right">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg"
                    title="Ver"
                  >
                    Ver
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Usuarios;
