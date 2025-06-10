import delivery from "../../assets/logos/Logo-nabvar.png"; // Cambiá el path y nombre por el tuyo real
import { Link } from "react-router-dom";

export default function NavbarInvitado() {
  return (
    <nav className="bg-white rounded-md shadow-sm mx-6 mt-4 px-4 py-3 flex items-center justify-between">
      {/* Botones izquierda */}
      <div className="flex items-center gap-2">
        <Link
          to="/login"
          className="border-2 border-[#C97856] text-[#C97856] px-5 py-2 rounded-lg font-medium transition hover:bg-[#C97856] hover:text-white"
        >
          Ingresar
        </Link>
        <Link
          to="/register"
          className="bg-[#C97856] text-white px-5 py-2 rounded-lg font-medium border-2 border-[#C97856] transition hover:bg-white hover:text-[#C97856]"
        >
          Registrarse
        </Link>
      </div>

      {/* Imagen central */}
      <div className="flex-1 flex justify-center">
        <img
          src={delivery}
          alt="Logo delivery"
          className="w-14 h-14 object-contain"
        />
      </div>

      {/* Buscador derecha */}
      <form className="flex items-center w-[320px]">
        <input
          type="text"
          placeholder="¿Qué se te antoja?"
          className="flex-1 border-2 border-[#C97856] rounded-l-lg px-4 py-2 outline-none text-[#C97856] placeholder-[#C97856] bg-white"
        />
        <button
          type="submit"
          className="border-2 border-l-0 border-[#C97856] rounded-r-lg px-4 py-2 text-[#C97856] hover:bg-[#C97856] hover:text-white transition"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </form>
    </nav>
  );
}
