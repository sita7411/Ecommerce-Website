import React from 'react';
import { Link } from 'react-router-dom';
import './Breadcrums.css';

const Breadcrums = ({ product }) => {
  if (!product) return null;

  // Map category names to routes
  const categoryRoute = {
    mens: "/mens",
    womens: "/womens",
    kids: "/kids",
  };

  return (
    <div className='breadcrum'>
      <Link to="/">HOME</Link> 
      <img src="/images/breadcrum_arrow.png" alt="arrow" />
      
      <Link to="/">SHOP</Link> 
      <img src="/images/breadcrum_arrow.png" alt="arrow" />
      
      <Link to={categoryRoute[product.category]}>{product.category}</Link> 
      <img src="/images/breadcrum_arrow.png" alt="arrow" />
      
      <span>{product.name}</span>
    </div>
  );
}

export default Breadcrums;
