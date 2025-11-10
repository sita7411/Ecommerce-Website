import React, { useContext } from "react";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { ShopContext } from "../../context/ShopContext";
import "./Item.css";

const Item = ({ _id, name, images = [], new_price = 0, old_price }) => {
  const { wishlist = {}, toggleWishlist, addToCart } = useContext(ShopContext);
  const idStr = _id.toString();
  const isWishlisted = Boolean(wishlist[idStr]);

  const placeholder = "https://via.placeholder.com/300x400?text=No+Image";

  return (
    <div className="item">
      <div className="item-image-container">
        <Link to={`/product/${idStr}`}>
          <img
            src={images?.[0] || placeholder}
            alt={name || "Product"}
            onMouseOver={(e) => {
              e.currentTarget.src = images?.[1] || images?.[0] || placeholder;
            }}
            onMouseOut={(e) => {
              e.currentTarget.src = images?.[0] || placeholder;
            }}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = placeholder;
            }}
          />
        </Link>
        <div className="item-icons">
          <button
            className={`icon-btn wishlist ${isWishlisted ? "active" : ""}`}
            onClick={() => toggleWishlist(idStr)}
          >
            <FaHeart />
          </button>
          <button
            className="icon-btn cart"
            onClick={() => addToCart(idStr, 1, null)} // default qty=1, size=null
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>

      <div className="item-info">
        <Link to={`/product/${idStr}`} className="item-link">
          <p className="item-name">{name || "Product"}</p>
        </Link>
        <div className="item-prices">
          <span className="item-price-new">${Number(new_price).toFixed(2)}</span>
          {old_price && (
            <span className="item-price-old">${Number(old_price).toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Item;
