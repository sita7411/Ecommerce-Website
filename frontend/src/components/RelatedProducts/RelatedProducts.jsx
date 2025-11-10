import React, { useEffect, useState } from "react";
import axios from "axios";
import Item from "../Item/Item";
import "./RelatedProducts.css";

const RelatedProducts = ({ currentProductId }) => {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!currentProductId) return;

    const fetchRelated = async () => {
      try {
        const res = await axios.get(
          `http://localhost:4000/api/products/related/${currentProductId}`
        );
        const products = res.data;

        console.log("API related products:", products);

        // Filter out current product
        const filtered = products.filter(
          (p) => p._id.toString() !== currentProductId.toString()
        );

        // Shuffle & limit 4
        const shuffled = filtered.sort(() => 0.5 - Math.random()).slice(0, 4);
        setRelated(shuffled);
      } catch (err) {
        console.error("❌ Error fetching related products:", err);
      }
    };

    fetchRelated();
  }, [currentProductId]);

  return (
    <div className="relatedproducts">
      <h1>Related Products</h1>
      <hr />
      <div className="relatedproducts-item">
        {related.length === 0 ? (
          <p>No related products found.</p>
        ) : (
          related.map((item) => (
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

export default RelatedProducts;
