import React, { useRef } from "react";
import { FaArrowLeft, FaArrowRight, FaRegStar, FaStar } from "react-icons/fa";
import "../../styles/home/TestimonialCarousel.css";

const testimonials = [
  {
    img: "assets/images/resource/testimonial-4.png",
    name: "Floyd Miles",
    role: "UI Designer",
    msg: "“Suspendisse est imperdiet pellentesque nulla vulputa te eu pharetra pharetra massa amet ac semper et pelle ntesque dolor tincidunt sodales”",
  },
  {
    img: "assets/images/resource/testimonial-5.png",
    name: "Cody Fisher",
    role: "UI Designer",
    msg: "“Suspendisse est imperdiet pellentesque nulla vulputa te eu pharetra pharetra massa amet ac semper et pelle ntesque dolor tincidunt sodales”",
  },
  {
    img: "assets/images/resource/testimonial-6.png",
    name: "Courtney Henry",
    role: "UI Designer",
    msg: "“Suspendisse est imperdiet pellentesque nulla vulputa te eu pharetra pharetra massa amet ac semper et pelle ntesque dolor tincidunt sodales”",
  },
  {
    img: "assets/images/resource/testimonial-4.png",
    name: "Floyd Miles",
    role: "UI Designer",
    msg: "“Suspendisse est imperdiet pellentesque nulla vulputa te eu pharetra pharetra massa amet ac semper et pelle ntesque dolor tincidunt sodales”",
  },
  {
    img: "assets/images/resource/testimonial-5.png",
    name: "Cody Fisher",
    role: "UI Designer",
    msg: "“Suspendisse est imperdiet pellentesque nulla vulputa te eu pharetra pharetra massa amet ac semper et pelle ntesque dolor tincidunt sodales”",
  },
  {
    img: "assets/images/resource/testimonial-6.png",
    name: "Courtney Henry",
    role: "UI Designer",
    msg: "“Suspendisse est imperdiet pellentesque nulla vulputa te eu pharetra pharetra massa amet ac semper et pelle ntesque dolor tincidunt sodales”",
  },
];

const TestimonialCarousel = () => {
  const carouselRef = useRef(null);

  const scrollLeftFunc = () => {
    carouselRef.current.scrollBy({ left: -400, behavior: "smooth" });
  };

  const scrollRightFunc = () => {
    carouselRef.current.scrollBy({ left: 400, behavior: "smooth" });
  };

  return (
    <section className="testimonial-two-section">
      <div className="testimonial-large-container">
        <div className="testimonial-sec-header">
          <h2>Love from Customers</h2>
          <div className="arrows">
            <button className="arrow-btn" onClick={scrollLeftFunc}>
              <FaArrowLeft />
            </button>
            <button className="arrow-btn" onClick={scrollRightFunc}>
              <FaArrowRight />
            </button>
          </div>
        </div>
        <div className="testimonial-carousel" ref={carouselRef}>
          {testimonials.map((t, idx) => (
            <div key={idx} className="testimonial-block">
              <div className="testimonial-inner-box">
                <div className="testimonial-icon-box">
                  <i className="icon-39"></i>
                </div>
                <ul className="testimonial-rating">
                  <li>
                    <FaStar />
                  </li>
                  <li>
                    <FaStar />
                  </li>
                  <li>
                    <FaStar />
                  </li>
                  <li>
                    <FaStar />
                  </li>
                  <li>
                    <FaRegStar />
                  </li>
                </ul>
                <p>{t.msg}</p>
                <div className="testimonial-author-box">
                  <figure className="testimonial-thumb-box">
                    <img src={t.img} alt={t.name} />
                  </figure>
                  <div className="testimonial-author-info">
                    <h4>{t.name}</h4>
                    <span className="testimonial-designation">{t.role}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialCarousel;
