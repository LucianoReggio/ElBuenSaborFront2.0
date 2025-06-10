import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import AdminLayout from "./components/layout/AdminLayout";
import PublicLayout from "./components/layout/PublicLayout";
import Dashboard from "./pages/Dashboard";
import Categorias from "./pages/Categorias";
import Insumos from "./pages/Insumos";
import Productos from "./pages/Productos";
import StockControl from "./pages/StockControl";
import Home from "./pages/Home";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
function App() {
  return (
    <Router>
      <Routes>
        {/* Área pública */}
          
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          {/* Acá van más rutas públicas si querés */}
        </Route>
        
        {/* Área admin */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/categorias" element={<Categorias />} />
          <Route path="/admin/insumos" element={<Insumos />} />
          <Route path="/admin/productos" element={<Productos />} />
          <Route path="/admin/stock" element={<StockControl />} />
        </Route>

        {/* Ruta 404 personalizada */}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <h2 className="text-3xl font-bold text-orange-700 mb-4">
                Página no encontrada
              </h2>
              <p className="text-[#99AAB3] mb-6">
                La página que buscas no existe.
              </p>
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-[#CD6C50] text-white rounded-md hover:bg-[#E29C44] transition-all duration-200 shadow-sm font-medium"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Volver al Home
              </Link>
            </div>
          }
        />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
