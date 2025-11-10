import React from 'react'
import Hero from '../components/Hero/Hero'
import Featurs from '../components/Featurs/Featurs'
import CategoriesSection from '../components/Categories/Categories';
import Popular from '../components/Popular/Popular'
import Offers from '../components/Offers/Offer'
import NewCollections from '../components/NewCollections/NewCollections'
import NewsLetter from '../components/NewsLetter/NewsLetter'
import Testimonials from '../components/Testimonials/Testimonials';

const Shop = () => {
  return (
    <div>
        <Hero />
        <Featurs />
        <CategoriesSection />
        <Popular />
        <Offers />
        <NewCollections />
        <NewsLetter />
        <Testimonials />
    </div>
  )
}

export default Shop
