import React, { useState, useEffect, useMemo } from "react";
import "../Pages/CSS/Shopcategory.css";
import Item from "../components/Item/Item";

const ShopCategory = ({ category }) => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState(""); // dynamic banner

  // Fetch products
  useEffect(() => {
    fetch("http://localhost:4000/api/products")
      .then((res) => res.json())
      .then((data) => {
        setAllProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // Fetch banner dynamically
  useEffect(() => {
    fetch(`http://localhost:4000/api/category-banners?category=${category}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.length > 0) setBanner(data[0].imageUrl);
      })
      .catch((err) => console.error("Error fetching banner:", err));
  }, [category]);

  // Filter & sort states
  const [sortOption, setSortOption] = useState("default");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState(500);

  const toggleFilter = (value, state, setState) => {
    setState((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const normalize = (str) =>
    str?.toString().toLowerCase().trim().replace(/s$/, "");

  // Filter & sort products
  const filteredAndSortedProducts = useMemo(() => {
    let products = allProducts || [];

    if (category) {
      const normalizedCategory = normalize(category);
      products = products.filter((item) => {
        if (Array.isArray(item.category)) {
          return item.category.some(
            (c) => normalize(c) === normalizedCategory
          );
        }
        return normalize(item.category) === normalizedCategory;
      });
    }

    if (selectedCategories.length > 0) {
      const normalizedSelected = selectedCategories.map(normalize);
      products = products.filter((item) => {
        if (Array.isArray(item.category)) {
          return item.category.some((c) =>
            normalizedSelected.includes(normalize(c))
          );
        }
        return normalizedSelected.includes(normalize(item.category));
      });
    }

    products = products.filter((item) => item.new_price <= priceRange);

    if (selectedColors.length > 0) {
      const normalizedColors = selectedColors.map(normalize);
      products = products.filter((item) =>
        item.colors?.some((c) => normalizedColors.includes(normalize(c)))
      );
    }


    if (selectedSizes.length > 0) {
      const normalizedSizes = selectedSizes.map((s) => s.toUpperCase());
      products = products.filter((item) =>
        item.sizes?.some((size) => normalizedSizes.includes(size.toUpperCase()))
      );
    }

    products = [...products].sort((a, b) => {
      if (sortOption === "low-high") return a.new_price - b.new_price;
      if (sortOption === "high-low") return b.new_price - a.new_price;
      return 0;
    });

    return products;
  }, [
    allProducts,
    category,
    selectedCategories,
    selectedColors,
    selectedSizes,
    priceRange,
    sortOption,
  ]);

  // Active filters
  const activeFilters = [
    ...selectedCategories.map((c) => ({ type: "category", label: c })),
    ...selectedColors.map((c) => ({ type: "color", label: c })),
    ...selectedSizes.map((s) => ({ type: "size", label: s })),
    priceRange < 500 ? { type: "price", label: `Under $${priceRange}` } : null,
  ].filter(Boolean);

  const removeFilter = (filter) => {
    if (filter.type === "category") setSelectedCategories((prev) => prev.filter((c) => c !== filter.label));
    else if (filter.type === "color") setSelectedColors((prev) => prev.filter((c) => c !== filter.label));
    else if (filter.type === "size") setSelectedSizes((prev) => prev.filter((s) => s !== filter.label));
    else if (filter.type === "price") setPriceRange(500);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange(500);
    setSortOption("default");
  };

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="sc-shop-category">
      {banner && <img className="sc-banner" src={banner} alt={`${category} banner`} />}
      <div className="sc-layout">
        {/* Sidebar */}
        <div className="sc-filters">
          <h3>Filter Options</h3>

          {/* Category filter */}
          <div className="sc-filter-block">
            <h4>Category</h4>
            <ul>
              {["Men", "Women", "Kids"].map((cat) => (
                <li key={cat} className={selectedCategories.includes(cat) ? "active" : ""}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleFilter(cat, selectedCategories, setSelectedCategories)}
                  />
                  {cat}
                </li>
              ))}
            </ul>
          </div>

          {/* Price filter */}
          <div className="sc-filter-block">
            <h4>Price</h4>
            <input
              type="range"
              min="0"
              max="500"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
            />
            <div className="sc-price-range">Under ${priceRange}</div>
          </div>

          {/* Color filter */}
          <div className="sc-filter-block">
            <h4>Color</h4>
            <ul className="sc-color-options">
              {Array.from(new Set(allProducts.flatMap((p) => p.colors))).map((color) => {
                const isSelected = selectedColors.includes(color);
                return (
                  <li key={color}>
                    <span
                      className={`sc-color ${color.toLowerCase()} ${isSelected ? "selected" : ""}`}
                      onClick={() => toggleFilter(color, selectedColors, setSelectedColors)}
                    ></span>
                    <span className="sc-color-name">{color}</span>
                  </li>
                );
              })}
            </ul>
          </div>


          {/* Size filter */}
          <div className="sc-filter-block">
            <h4>Size</h4>
            <ul>
              {["S", "M", "L", "XL", "XXL", "XXXL"].map((size) => (
                <li key={size} className={selectedSizes.includes(size) ? "active" : ""}>
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => toggleFilter(size, selectedSizes, setSelectedSizes)}
                  />
                  {size}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main section */}
        <div className="sc-main">
          {activeFilters.length > 0 && (
            <div className="sc-active-filters-bar">
              <span className="label">Active Filters:</span>
              {activeFilters.map((filter, i) => (
                <span key={i} className="sc-filter-tag">
                  {filter.label} <button onClick={() => removeFilter(filter)}>×</button>
                </span>
              ))}
              <button className="sc-clear-all" onClick={clearAllFilters}>Clear All</button>
            </div>
          )}

          <div className="sc-topbar">
            <p>
              Showing <b>{filteredAndSortedProducts.length}</b> of {allProducts.length} results
            </p>
            <div className="sc-sort">
              <label>Sort by:</label>
              <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
                <option value="default">Default Sorting</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="sc-products">
            {filteredAndSortedProducts.length > 0 ? (
              filteredAndSortedProducts.map((item) => <Item key={item._id} {...item} />)
            ) : (
              <p className="sc-no-products">No products available.</p>
            )}
          </div>
        </div>
      </div>

      <div className="sc-loadmore">Explore More</div>
    </div>
  );
};

export default ShopCategory;
