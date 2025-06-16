// src/pages/Usuarios.tsx
import { useUsuarios } from "../hooks/useUsuarios";
import { LoadingSpinner } from "../components/common/LoadingSpinner";

const Usuarios = () => {
  const { usuarios, loading } = useUsuarios();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-2">Gestión de Usuarios</h2>
      <p className="text-gray-600 mb-6">Administre los usuarios registrados</p>

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
            {usuarios.map((u) => (
                <tr key={u.idUsuario} className="hover:bg-gray-50">
                <td className="px-4 py-2 border-t">{u.idUsuario}</td>
                <td className="px-4 py-2 border-t">{u.email}</td>
                <td className="px-4 py-2 border-t">{u.rol}</td>
                <td className="px-4 py-2 border-t">{u.nombre}</td>
                <td className="px-4 py-2 border-t">{u.apellido}</td>
                <td className="px-4 py-2 border-t text-right">
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-lg cursor-pointer"
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
