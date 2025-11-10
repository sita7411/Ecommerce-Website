import React from "react";

import Hero from "../components/Hero/Hero";

import OurStory from "../components/OurStory/OurStory";
import MissionVision from "../components/MissionVision/MissionVision";
import ProductQuality from "../components/ProductQuality/ProductQuality";
import InstagramFeed from "../components/InstagramFeed/InstagramFeed";


const AboutUs = () => {
  const aboutSlide = [
    {
      title: "About Us",
      desc: "We provide high-quality clothing products with exceptional service.",
      subtext: "Our mission is to make online shopping enjoyable for everyone.",
      img: `${process.env.PUBLIC_URL}/images/about-banner.png`,
      btn: "Discover Our Story",
      link: "/AboutUs",
    },
  ];

  return (
    <>
      <Hero slides={aboutSlide} isSlider={false} />
      <OurStory />
      <MissionVision />
      <ProductQuality />
      <InstagramFeed />
    </>
  );
};

export default AboutUs;
