import { render, screen } from '@testing-library/react';
impoimport React, { useState, useEffect } from 'react';
import '../Navbar/Navbar.css';
import logo from '../Assets/Frontend_Assets/logo.png';
import cart_icon from '../Assets/Frontend_Assets/cart_icon.png';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const [menu, setMenu] = useState("shop");

  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setMenu("shop");
    else if (path === '/mens') setMenu("mens");
    else if (path === '/womens') setMenu("womens");
    else if (path === '/kids') setMenu("kids");
  }, [location]);

  return (
    <div className='navbar'>
      <div className="nav-logo">
        <img src={logo} alt="logo"/>
        <p>SHOPPER</p>
      </div>

      <ul className="nav-menu">
        <li onClick={() => setMenu("shop")}>
          <Link to='/'>Shop</Link>
          {menu === "shop" && <hr />}
        </li>
        <li onClick={() => setMenu("mens")}>
          <Link to='/mens'>Men</Link>
          {menu === "mens" && <hr />}
        </li>
        <li onClick={() => setMenu("womens")}>
          <Link to='/womens'>Women</Link>
          {menu === "womens" && <hr />}
        </li>
        <li onClick={() => setMenu("kids")}>
          <Link to='/kids'>Kids</Link>
          {menu === "kids" && <hr />}
        </li>
      </ul>

      <div className="nav-login-cart">
        <Link to='/loginsignup'><button>Login</button></Link>
        <div className="cart-container">
          <Link to='/cart'>
            <img src={cart_icon} alt="cart_icon"/>
            <div className="nav-cart-count">0</div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Navbar;
