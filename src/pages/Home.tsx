import React from 'react';
import './Menu.css';

const Menu: React.FC = () => {
  return (
    <div className="menu-page">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo">
              <img src="/src/assets/logos/Logo-Completo.png" alt="LogoPrincipal" />
            </div>
          </div>
          <div className="food-images">
            <img src="/src/assets/img/Header.jpg" alt="Burger" className="food-image" />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-content">
          <span className="nav-label">CATEGORÍAS ▶</span>
          <div className="nav-items">
            <a href="#" className="nav-item">Pizzas</a>
            <a href="#" className="nav-item">Lomos</a>
            <a href="#" className="nav-item active">Burgers</a>
            <a href="#" className="nav-item">Tacos</a>
            <a href="#" className="nav-item">Bebidas</a>
            <span>◀</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="promos-section">
        <h2 className="section-title">Promos de la semana</h2>
        
        {/* Featured Promo */}
        <div className="promo-card">
          <img src="/src/assets/img/burger-x.jpg" alt="Burger X" className="promo-image" />
          <div className="promo-content">
            <h3 className="promo-title">Burger X</h3>
            <p className="promo-description">
              Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod 
              tempor incididunt ut labore et dolore magna aliqua.
            </p>
            <div className="ingredients">
              <div className="ingredients-title">Ingredientes:</div>
              <div className="ingredient">- Ingrediente 1</div>
              <div className="ingredient">- Ingrediente 2</div>
              <div className="ingredient">- Ingrediente 3</div>
              <div className="ingredient">- Ingrediente 4</div>
            </div>
            <div className="price-tag">$ 2.300,00</div>
          </div>
          <button className="arrow-btn">→</button>
        </div>

        {/* Hamburger Section */}
        <div className="products-section">
          <h3 className="section-title">Hamburguesas</h3>
          <div className="products-grid">
            <div className="product-card">
              <img src="/src/assets/img/burger1.png" alt="Big Super" className="product-image" />
              <h4 className="product-name">Big Super</h4>
              <p className="product-description">Ingredientes, ingredientes, ingredientes</p>
              <div className="product-price">$ 3.000</div>
              <button className="order-btn">Pedir</button>
            </div>
            
            <div className="product-card featured">
              <img src="/src/assets/img/burger1.png" alt="Big Super" className="product-image" />
              <h4 className="product-name">Big Super</h4>
              <p className="product-description">Ingredientes, ingredientes, ingredientes</p>
              <div className="product-price">$ 3.000</div>
              <button className="order-btn">No Disponible</button>
            </div>
            
            <div className="product-card">
              <img src="/src/assets/img/burger1.png" alt="Big Super" className="product-image" />
              <h4 className="product-name">Big Super</h4>
              <p className="product-description">Ingredientes, ingredientes, ingredientes</p>
              <div className="product-price">$ 3.000</div>
              <button className="order-btn">Pedir</button>
            </div>
            
            <div className="product-card">
              <img src="/src/assets/img/burger1.png" alt="Big Super" className="product-image" />
              <h4 className="product-name">Big Super</h4>
              <p className="product-description">Ingredientes, ingredientes, ingredientes</p>
              <div className="product-price">$ 5.000</div>
              <button className="order-btn">Pedir</button>
            </div>
          </div>

          {/* Pizzas Section */}
          <h3 className="section-title">Pizzas</h3>
          <div className="products-grid">
            <div className="product-card">
              <img src="/src/assets/img/pizza1.png" alt="Pizza mozzarella" className="product-image" />
              <h4 className="product-name">Pizza mozzarella</h4>
              <p className="product-description">Ingredientes, ingredientes, ingredientes</p>
              <div className="product-price">$ 3.400</div>
              <button className="order-btn">Pedir</button>
            </div>
            
            <div className="product-card">
              <img src="/src/assets/img/pizza1.png" alt="Pizza mozzarella" className="product-image" />
              <h4 className="product-name">Pizza mozzarella</h4>
              <p className="product-description">Ingredientes, ingredientes, ingredientes</p>
              <div className="product-price">$ 3.600</div>
              <button className="order-btn">Pedir</button>
            </div>
            
            <div className="product-card">
              <img src="/src/assets/img/pizza1.png" alt="Pizza mozzarella" className="product-image" />
              <h4 className="product-name">Pizza mozzarella</h4>
              <p className="product-description">Ingredientes, ingredientes, ingredientes</p>
              <div className="product-price">$ 3.600</div>
              <button className="order-btn">Pedir</button>
            </div>
            
            <div className="product-card">
              <img src="/src/assets/img/pizza1.png" alt="Pizza mozzarella" className="product-image" />
              <h4 className="product-name">Pizza mozzarella</h4>
              <p className="product-description">Ingredientes, ingredientes, ingredientes</p>
              <div className="product-price">$ 3.600</div>
              <button className="order-btn">Pedir</button>
            </div>
          </div>

          <div className="view-more">
            <button className="view-more-btn">Ver más</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Menu;