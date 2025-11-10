import React, { useEffect, useState } from "react";
import axios from "axios";
import Item from "../Item/Item";
import "./NewCollection.css";

const NewCollections = () => {
  const [newProducts, setNewProducts] = useState([]);

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/products");
        const filtered = res.data.filter((p) => p.isNew);
        setNewProducts(filtered);
      } catch (err) {
        console.error("❌ Error fetching new products:", err);
      }
    };
    fetchNewProducts();
  }, []);

  return (
    <div className="newcollections">
      <h1>NEW COLLECTIONS</h1>
      <hr />
      <div className="newcollections-grid">
        {newProducts.length === 0 ? (
          <p>No new products found.</p>
        ) : (
          newProducts.map((item) => (
            <Item
              key={item._id}
              _id={item._id}
              name={item.name}
              images={item.images}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default NewCollections;
