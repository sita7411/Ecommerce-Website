import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { Link } from "react-router-dom";
import axios from "axios";

import "swiper/css";
import "swiper/css/pagination";

import "./Hero.css";

const API_URL = "http://localhost:4000/api/hero-banners";

const Hero = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const res = await axios.get(API_URL);
      const mappedSlides = res.data.map((banner) => ({
        title: banner.title,
        desc: banner.desc,
        subtext: banner.subtext || "",
        img: banner.imageUrl.startsWith("http")
          ? banner.imageUrl
          : `http://localhost:4000${banner.imageUrl}`, // full path for relative URL
        btn: banner.btnText,
        link: banner.btnLink || "#",
      }));
      setSlides(mappedSlides);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading banners...</div>;
  if (!slides.length) return <div>No banners available</div>;

  return (
    <section className="promo">
      <Swiper
        modules={[Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="promo-slider"
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={index}
            className="promo-slide"
            style={{ backgroundImage: `url(${slide.img})` }}
          >
            <div className="promo-overlay">
              <div className="promo-text fade-in">
                <h1>{slide.title}</h1>
                <p>{slide.desc}</p>
                {slide.subtext && <p className="promo-subtext">{slide.subtext}</p>}
                
                {slide.btn && (
                  slide.link.startsWith("http") ? (
                    // External link
                    <a href={slide.link} target="_blank" rel="noopener noreferrer">
                      <button className="promo-btn">{slide.btn}</button>
                    </a>
                  ) : (
                    // Internal route
                    <Link to={slide.link}>
                      <button className="promo-btn">{slide.btn}</button>
                    </Link>
                  )
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Hero;
