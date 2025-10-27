import React, { useEffect, useState } from "react";
import '../../public/stylesheets/Home.css'; 
import bg2 from '../assets/bg2.jpeg';
import bg4 from '../assets/bg4.png';
import bg5 from '../assets/bg5.png';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    { id: 1, image: bg2, alt: "Luxury Gold Collection" },
    { id: 2, image: bg4, alt: "Heritage Jewelry" },
    { id: 3, image: bg5, alt: "Bahraini Craftsmanship" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  return (
    <div className="hp-home-page">
      <section className="hp-hero-section">
        <div
          className="hp-hero-slider"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {slides.map((slide) => (
            <div key={slide.id} className="hp-hero-slide">
              <img src={slide.image} alt={slide.alt} className="hp-hero-image" />
              <div className="hp-overlay"></div>
            </div>
          ))}
        </div>

        <div className="hp-hero-text">
          <h1>“Gold from the heart of Bahrain”</h1>
          <p>Beauty shaped by legacy.</p>
        </div>

        <div className="hp-hero-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`hp-dot ${currentSlide === index ? "active" : ""}`}
              onClick={() => setCurrentSlide(index)}
            ></span>
          ))}
        </div>
      </section>

      <section className="hp-models-section">
        <div className="hp-model-card">
          <div className="hp-model-image-placeholder">
            <img src= "src/assets/bracelet21k.jpg" />
             <a href="/collections" className="hp-shop-now">Shop Now</a>
          </div>
          <p>“Where elegance meets heritage.”</p>
        </div>
        <div className="hp-model-card">
          <div className="hp-model-image-placeholder">
            <img src= "src/assets/possiblebanner1.jpg" />
             <a href="/collections" className="hp-shop-now">Shop Now</a>
          </div>
          <p>“Fine Bahraini gold collections.”</p>
        </div>
        <div className="hp-model-card">
          <div className="hp-model-image-placeholder">
            <img src= "src/assets/Bangles1.jpg" />
             <a href="/collections" className="hp-shop-now">Shop Now</a>
          </div>
          <p>“Crafted with passion and grace.”</p>
        </div>
      </section>

      <section className="hp-info-strip">
  <div className="hp-info-item">
    <img src="src\assets\delivery.png" alt="Free Shipping" />
    <p>Free Shipping</p>
  </div>
  <div className="hp-info-item">
    <img src="src\assets\premium.png" alt="Authenticity & Quality" />
    <p>Authenticity & Quality</p>
  </div>
  <div className="hp-info-item">
    <img src="" alt="" />
    <p>Something..</p>
  </div>
</section>



      <section className="hp-trending-section">
        <h2>Top Trending Picks</h2>
        <div className="hp-trending-grid">
          <div className="hp-trend-card">
            <div className="hp-trend-image-placeholder">
              <img src= "src/assets/EARINGS1.png" />
            </div>
            <h3>Antique Necklace</h3>
            <p className="hp-price">BD 800</p>
          </div>
          <div className="hp-trend-card">
            <div className="hp-trend-image-placeholder">
              <img src= "src/assets/RING3.png"/>
            </div>
            <h3>Gold & Pearl Set</h3>
            <p className="hp-price">BD 1200</p>
          </div>
          <div className="hp-trend-card">
            <div className="hp-trend-image-placeholder">
              <img src= "src/assets/RING1.png"/> 
            </div>
            <h3>Elegant Bracelet</h3>
            <p className="hp-price">BD 600</p>
          </div>
          <div className="hp-trend-card">
            <div className="hp-trend-image-placeholder">
               <img src= "src/assets/RING1.png"/> 
            </div>
            <h3>Engagement Ring</h3>
            <p className="hp-price">BD 1500</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
