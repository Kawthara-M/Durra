import "../../public/stylesheets/AboutUs.css"

const AboutUs = () => (
  <section className="durra-about">
    <div className="durra-container">
      <header className="durra-hero">
        <h1 className="durra-hero-title">Durra</h1>
        <p className="durra-hero-subtitle">Arabian Luxury, Modern Elegance</p>
        <div className="durra-hero-line"></div>
      </header>

      <section className="durra-story">
        <h2 className="durra-section-title">Who Are We?</h2>
        <div className="durra-story-text">
          <p>
            <strong>Durra</strong> emerges from Bahrain as a modern
            interpretation of Arabian luxury, blending centuries of jewelry
            craftsmanship with contemporary digital excellence.
          </p>
          <p>
            It connects discerning clients with master artisans, offering
            certified pieces that honor tradition while embracing innovation and
            technology.
          </p>
        </div>
      </section>

      <section className="durra-values">
        <h2 className="durra-section-title">Our Values</h2>
        <div className="durra-values-grid">
          <div className="durra-value-card">
            <h3>Local Legacy</h3>
            <p>
              Celebrating Bahrain's golden heritage through artisans preserving
              traditional techniques.
            </p>
          </div>
          <div className="durra-value-card">
            <h3>Transparent Trust</h3>
            <p>
              DANAT and GIA certified pieces ensuring complete transparency and
              confidence.
            </p>
          </div>
          <div className="durra-value-card">
            <h3>Effortless Experience</h3>
            <p>
              Seamless journey with Shariah-compliant services and personalized
              care for every client.
            </p>
          </div>
        </div>
      </section>

      <section className="durra-team">
        <h2 className="durra-section-title">Meet Our Team</h2>
        <div className="durra-team-grid">
          <div className="durra-team-card">
            <img src="src/assets/user(1).png" alt="K" />
            <h3>Kawthar Mohammad</h3>
            <p>Project Manager & Developer</p>
          </div>
          <div className="durra-team-card">
            <img src="src/assets/user(1).png" alt="G" />
            <h3>Ghadeer Abdulla</h3>
            <p>Developer</p>
          </div>
          <div className="durra-team-card">
            <img src="src/assets/user(1).png" alt="R" />
            <h3>Raghad Abdulla</h3>
            <p>UI/UX Designer</p>
          </div>
        </div>
      </section>

      <section className="durra-testimonials">
        <h2 className="durra-section-title">Client Testimonials</h2>
        <div className="durra-testimonials-grid">
          <div className="durra-testimonial-card">
            <p>
              ""
            </p>
            <h4>– Fatima H.</h4>
          </div>
          <div className="durra-testimonial-card">
            <p>
              ""
            </p>
            <h4>– Ahmed B.</h4>
          </div>
        </div>
      </section>

      <section className="durra-closing">
        <p>
          Durra represents the perfect harmony of Bahrain's jewelry legacy and
          contemporary sophistication, a symbol of heritage, trust, and
          innovation.
        </p>
      </section>
    </div>
  </section>
)

export default AboutUs
