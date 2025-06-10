import headerImg from '../assets/img/Header.jpg';
import logo from '../assets/logos/Logo-Completo.png';

const categories = ['Pizzas', 'Lomos', 'Burgers', 'Tacos', 'Bebidas'];

export default function HeroSection() {
  return (
    <section className="w-full bg-[#F7F7F5]">
      {/* Contenido principal */}
      <div className="flex flex-row items-center justify-between w-full py-12 px-6 md:px-16 bg-white rounded-none shadow-none min-h-[390px]">
        {/* Izquierda: logo + texto */}
        <div className="flex flex-col items-center justify-center flex-[0.7] min-h-[320px]">
          <div className="flex flex-col items-center">
            <div className="bg-[#F7E3C4] rounded-full flex items-center justify-center w-48 h-48 mb-3">
              <img
                src={logo}
                alt="Logo El Buen Sabor"
                className="w- h-28 object-contain"
              />
            </div>
          
          </div>
        </div>
        {/* Derecha: imagen hamburguesa */}
        <div className="flex-1 flex items-center justify-center p-5">
          <img
            src={headerImg}
            alt="Hamburguesas"
            className="w-full h-[300px] md:h-[350px] object-cover rounded-2xl border-4 border-[#F7E3C4] shadow-xl"
            style={{ maxWidth: 560 }}
          />
        </div>
      </div>

      {/* Categorías barra */}
      <div className="w-full bg-white py-3 px-2 flex items-center justify-center gap-1 border-t border-[#dedede] rounded-none shadow">
        <span className="font-bold text-black px-2">CATEGORIAS</span>
        <span className="text-black">▶</span>
        {categories.map((cat, i) => (
          <a
            href={`#${cat.toLowerCase()}`}
            className="mx-2 text-[1rem] text-black font-medium hover:text-[#C97856] transition"
            key={cat}
          >
            {cat}
          </a>
        ))}
        <span className="text-black">◀</span>
      </div>
    </section>
  );
}

