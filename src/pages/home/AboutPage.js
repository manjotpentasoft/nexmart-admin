import React from "react";
import Header from "../../components/home/Header";
import ShopBrands from "../../components/home/ShopBrands";
import HighlightsSection from "../../components/home/HighlightSection";
import Footer from "../../components/home/Footer";
import "../../styles/home/AboutPage.css";
import TestimonialCarousel from "../../components/home/TestimonialCarousel";
import InstagramCarousel from "../../components/home/InstagramCarousel";

const AboutPage = () => {
  return (
    <>
      <Header />
      <div className="about-page-main">
        <h2 className="about-title">About Us</h2>
        <div className="about-hero-section">
          <div className="about-images-wrapper">
            <div className="about-hero-image">
              <img
                src="/assets/images/resource/about-1.jpg"
                alt="Packages"
                className="about-image-box"
              />
            </div>

            <div className="about-experience-badge">
              <span className="about-experience-number">20</span>
              <span className="about-experience-text">Years of experience</span>
            </div>

            <div className="about-hero-person">
              <img
                src="/assets/images/resource/about-2.jpg"
                alt="Person Working Laptop"
                className="about-image-person"
              />
            </div>
          </div>

          <div className="about-description">
            <h2>
              We are a retail business in Ecommerce Products and accessories
            </h2>
            <p>
              Garaze Auto Parts, with a rich legacy spanning 12 years, stands as
              a venerable online destination for automotive enthusiasts seeking
              a diverse range of high-quality vehicle components.
            </p>
            <p>
              All components featured in their inventory undergo rigorous
              quality checks to meet or exceed industry standards, instilling
              confidence in customers regarding the reliability of their
              purchases.
            </p>

            <div className="about-stats">
              <div className="about-stats-item">
                <span>25+</span>
                <span>Retail Stores in the City</span>
              </div>
              <div className="about-stats-item">
                <span>3k+</span>
                <span>Active Delivery Persons</span>
              </div>
              <div className="about-stats-item">
                <span>120+</span>
                <span>Brands and Companies</span>
              </div>
            </div>
          </div>
        </div>

        <section className="luxury-video-banner">
          <div
            className="luxury-bg-layer"
            style={{
              backgroundImage: `url("assets/images/background/video-bg.jpg")`,
            }}
          ></div>
          {/* <figure className="luxury-image-layer">
            <img src="assets/images/resource/video-1.png" alt="Watch" />
          </figure> */}
          <span className="luxury-big-text">LUXURY WATCH</span>
          <div className="luxury-large-container">
            <div className="luxury-inner-container">
              <div className="luxury-content-box">
                <span className="luxury-text-box">New Release</span>
                <h2 className="luxury-title">
                  Find Your Dream Luxury Watch from here
                </h2>
                <a href="shop-details.html" className="luxury-btn">
                  Shop Now
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </a>
              </div>
              <div className="luxury-video-btn">
                <a
                  href="https://www.youtube.com/watch?v=nfP5N9Yc72A&t=28s"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="luxury-lightbox"
                >
                  <i className="luxury-icon-play"></i>
                </a>
              </div>
            </div>
          </div>
        </section>
        <ShopBrands />
        <section className="apps-section-custom">
          <div className="apps-large-container">
            <div className="apps-inner-container">
              <div
                className="apps-bg-layer"
                style={{
                  backgroundImage: `url(assets/images/background/apps-bg.jpg)`,
                }}
              ></div>
              <figure className="apps-image-layer">
                <img
                  src="assets/images/resource/mockup-1.png"
                  alt="App Mockup"
                />
              </figure>
              <div className="apps-content-box">
                <h2 className="apps-title">
                  Download Mobile App for your device
                </h2>
                <div className="apps-btn-box">
                  <a
                    href="about.html"
                    className="apps-store-btn apple-store-btn"
                  >
                    <img
                      src="assets/images/icons/icon-6.png"
                      alt="App Store Icon"
                    />
                    <span className="apps-store-span">Download on</span>
                    App Store
                  </a>
                  <a
                    href="about.html"
                    className="apps-store-btn play-store-btn"
                  >
                    <img
                      src="assets/images/icons/icon-7.png"
                      alt="Google Play Icon"
                    />
                    <span className="apps-store-span">Get it on</span>
                    Google Play
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
        <TestimonialCarousel />
        <InstagramCarousel />
        <HighlightsSection />
        <Footer />
      </div>
    </>
  );
};

export default AboutPage;
