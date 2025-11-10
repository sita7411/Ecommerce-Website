import React, { useEffect } from "react";
import "./Categories.css";

const categoriesData = [
  {
    id: 1,
    title: "For Women’s",
    count: "50+ items",
image: `${process.env.REACT_APP_API_URL}/images/collection_banner_women.png`,
    list: ["Blazers", "T-shirts and Blouses", "Dresses", "Jackets & Coats", "Jeans", "Knit", "Sarees"],
    large: true,
  },
  {
    id: 2,
    title: "For Men’s",
    count: "30+ items",
    image: `${process.env.REACT_APP_API_URL}/images/collection_banner_men.png`,
    list: ["Blazers", "T-shirts and Shirts", "Jackets & Coats", "Jeans"],
  },
  {
    id: 3,
    title: "Kids",
    count: "40+ items",
    image: `${process.env.REACT_APP_API_URL}/images/collection_banner_kids.png`,
    list: ["T-Shirts", "Shorts", "Dresses", "Shoes"],
  },
];

const CategoriesSection = () => {
  useEffect(() => {
    const boxes = document.querySelectorAll(".category-box");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("fade-up");
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      { threshold: 0.2 }
    );

    boxes.forEach((box) => observer.observe(box));
  }, []);

  return (
    <section className="categories-section">
      <h2 className="section-title">SHOP BY COLLECTION</h2>
      <hr />
      <div className="categories-layout">
        {/* Left Large Banner */}
        <div
          className={`category-box ${categoriesData[0].large ? "large" : ""}`}
          style={{ backgroundImage: `url(${categoriesData[0].image})` }}
        >
          <div className="category-overlay">
            <div className="category-text">
              <span className="count">{categoriesData[0].count}</span>
              <h3>{categoriesData[0].title}</h3>
              <ul>
                {categoriesData[0].list.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right Banners */}
        <div className="category-right">
          {categoriesData.slice(1).map((cat) => (
            <div
              key={cat.id}
              className="category-box"
              style={{ backgroundImage: `url(${cat.image})` }}
            >
              <div className="category-overlay">
                <div className="category-text">
                  <span className="count">{cat.count}</span>
                  <h3>{cat.title}</h3>
                  <ul>
                    {cat.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
