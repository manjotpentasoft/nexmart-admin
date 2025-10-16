import React, { useRef, useEffect } from "react";
import "../../styles/home/InstagramCarousel.css";

const images = [
  "assets/images/resource/instagram-1.jpg",
  "assets/images/resource/instagram-2.jpg",
  "assets/images/resource/instagram-3.jpg",
  "assets/images/resource/instagram-4.jpg",
  "assets/images/resource/instagram-5.jpg",
  "assets/images/resource/instagram-6.jpg",
  "assets/images/resource/instagram-7.jpg",
  "assets/images/resource/instagram-8.jpg",
  "assets/images/resource/instagram-9.jpg",
  "assets/images/resource/instagram-10.jpg",
  "assets/images/resource/instagram-11.jpg",
  "assets/images/resource/instagram-12.jpg",
];

const AUTO_SCROLL_SPEED = 1.5; // pixels per frame

const InstagramCarousel = () => {
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const directionRef = useRef(1); // 1 = forward, -1 = backward

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let animationFrame;

    const scroll = () => {
      const maxOffset = track.scrollWidth - track.clientWidth;

      // Reverse direction at edges
      if (offsetRef.current >= maxOffset) directionRef.current = -1;
      if (offsetRef.current <= 0) directionRef.current = 1;

      offsetRef.current += directionRef.current * AUTO_SCROLL_SPEED;
      track.style.transform = `translateX(-${offsetRef.current}px)`;

      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);

    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <section className="instagram-section-custom">
      <div className="instagram-outer-container">
        <div className="carousel-viewport">
          <div className="carousel-track" ref={trackRef}>
            {images.map((src, idx) => (
              <div className="carousel-slide" key={idx}>
                <div className="inner-insta-box">
                  <figure className="image-box">
                    <img src={src} alt="" />
                  </figure>
                  <div className="text-box">
                    <a href="index-3.html">
                      <img
                        src="assets/images/icons/icon-10.svg"
                        alt=""
                        className="insta-icon"
                      />
                      Follow us on Instagram
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default InstagramCarousel;
