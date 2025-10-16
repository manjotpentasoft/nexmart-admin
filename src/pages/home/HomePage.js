import React, { useEffect, useState } from "react";
import "../../styles/home/Header.css";
import Header from "../../components/home/Header";
import HeroSection from "../../components/home/HeroSection";
import PopularCategories from "../../components/home/popularCategories";
import PopularProducts from "../../components/home/popularProducts";
import ShopBrands from "../../components/home/ShopBrands";
import HomeTopSold from "../../components/home/HomeTopSold";
import HighlightsSection from "../../components/home/HighlightSection";
import Footer from "../../components/home/Footer";
import { subscribeToCollection } from "../../firebase/firestoreService";

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const unsubProducts = subscribeToCollection("products", setProducts);
    const unsubCategories = subscribeToCollection("categories", setCategories);
    const unsubCart = subscribeToCollection("cart", setCartItems);
    return () => {
      unsubProducts();
      unsubCategories();
      unsubCart();
    };
  }, []);

  return (
    <div className="nexmart">
      <Header cartItems={cartItems} categories={categories} />
      <HeroSection products={products} />
      <PopularCategories />
      <PopularProducts />
      <ShopBrands />
      <HomeTopSold />
      <HighlightsSection />
      <Footer />
    </div>
  );
};

export default HomePage;
