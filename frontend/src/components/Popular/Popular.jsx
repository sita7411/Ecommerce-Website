import React, { useState, useEffect } from "react";
import Item from "../Item/Item";
import "./Popular.css";
import axios from "axios";

const Popular = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/products`);
        const popular = res.data.filter((p) => p.isPopular);
        setProducts(popular);
      } catch (err) {
        console.error("❌ Error fetching popular products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPopular();
  }, []);

  return (
    <div className="popular">
      <h1>POPULAR IN WOMEN</h1>
      <hr />
      {loading ? (
        <p>Loading popular products...</p>
      ) : products.length === 0 ? (
        <p>No popular products found.</p>
      ) : (
        <div className="popular-item">
          {products.map((product) => (
            <Item
              key={product._id}
              _id={product._id}
              name={product.name}
              images={product.images}
              new_price={product.new_price}
              old_price={product.old_price}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Popular;
