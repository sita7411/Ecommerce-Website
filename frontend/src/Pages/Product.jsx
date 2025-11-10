import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductDisplay from "../components/ProductDisplay/ProductDisplay";
import Breadcrums from "../components/Breadcrums/Breadcrums";
import DescriptionBox from "../components/DescriptionBox/DescriptionBox";
import RelatedProducts from "../components/RelatedProducts/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/api/products/${productId}`);
        if (!res.ok) throw new Error("Product not found");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <p>Loading product...</p>;
  if (error || !product) return <p>{error || "Product not found"}</p>;

  return (
    <div>
      <Breadcrums product={product} />
      <ProductDisplay product={product} /> {/* ✅ Pass product as prop */}
      <DescriptionBox product={product} />
      <RelatedProducts
        currentProductId={product._id}
        currentCategory={product.category}
      />
    </div>
  );
};

export default Product;
