import React from "react";
import "./Testimonials.css";
import { FaStar, FaQuoteRight } from "react-icons/fa";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

const testimonials = [
  {
    name: "Aarav Mehta",
    role: "Fashion Enthusiast",
    image: "https://randomuser.me/api/portraits/men/33.jpg",
    rating: 5,
    text: "I love shopping here! The clothing quality is amazing and the delivery was super fast. The styles are trendy and perfectly fit my wardrobe.",
  },
  {
    name: "Priya Sharma",
    role: "Student",
    image: "https://randomuser.me/api/portraits/women/45.jpg",
    rating: 5,
    text: "The website is so easy to use, and I found exactly what I needed for my college fest. Great prices and awesome fabric quality!",
  },
  {
    name: "Rohan Patel",
    role: "Working Professional",
    image: "https://randomuser.me/api/portraits/men/51.jpg",
    rating: 5,
    text: "I ordered formal shirts and they fit perfectly. The material feels premium and the look is just perfect for office wear.",
  },
  {
    name: "Simran Kaur",
    role: "Lifestyle Blogger",
    image: "https://randomuser.me/api/portraits/women/60.jpg",
    rating: 5,
    text: "This store is my go-to for casual and party outfits. The collection is stylish, comfortable, and gets me so many compliments!",
  },
];

export default function Testimonials() {
  return (
    <section className="testimonials-section">
      <h1 className="testimonial-subtitle">Testimonials</h1>
      <hr />
  

      <Swiper
        modules={[Pagination, Autoplay]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop={true}
        breakpoints={{
          425: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1200: { slidesPerView: 2 },
        }}
        className="testimonial-swiper"
      >
        {testimonials.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="testimonial-card">
              <div className="testimonial-header">
                <img
                  src={item.image}
                  alt={item.name}
                  className="testimonial-img"
                />
                <div>
                  <h3 className="testimonial-name">{item.name}</h3>
                  <p className="testimonial-role">{item.role}</p>
                  <div className="testimonial-rating">
                    {[...Array(item.rating)].map((_, i) => (
                      <FaStar key={i} className="star-icon" />
                    ))}
                    <span className="rating-score">
                      {item.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <FaQuoteRight className="quote-icon" />
              </div>
              <p className="testimonial-text">{item.text}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
