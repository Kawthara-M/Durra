import "../../public/stylesheets/sizeguide.css"

const SizeGuide = () => (
  <div className="sg-container">
    <h1 className="sg-title">Jewelry Size Guide</h1>

    <div className="sg-grid">
      {/* Necklace */}
      <div className="sg-card">
        <img
          src="src/assets/Neck.webp"
          alt="Necklace guide"
          className="sg-image"
        />
        <div className="sg-content">
          <h2>Necklace</h2>
          <p>
            Wrap a string around your neck where you’d like the necklace to sit,
            then measure it with a ruler.
          </p>
        </div>
      </div>

      {/* Ring */}
      <div className="sg-card reverse">
        <img
          src="src/assets/ring2.avif"
          alt="Ring guide"
          className="sg-image"
        />
        <div className="sg-content">
          <h2>Ring</h2>
          <p>
            Cut a strip of paper and wrap it around your finger. Mark where it
            meets, then measure in millimeters.
          </p>
          {/* <table className="sg-ring-table">
            <thead>
              <tr><th>Size</th><th>Diameter (mm)</th></tr>
            </thead>
            <tbody>
              <tr><td>6</td><td>51.9</td></tr>
              <tr><td>7</td><td>54.4</td></tr>
              <tr><td>8</td><td>56.9</td></tr>
              <tr><td>9</td><td>59.5</td></tr>
            </tbody>
          </table> */}
        </div>
      </div>

      {/* Bracelet */}
      <div className="sg-card">
        <img
          src="src/assets/brac.webp"
          alt="Bracelet guide"
          className="sg-image"
        />
        <div className="sg-content">
          <h2>Bracelet</h2>
          <p>
            Wrap a soft tape around your wrist just above the wrist bone. Add
            1–2 cm for comfort.
          </p>
        </div>
      </div>

      {/* Earrings */}
      <div className="sg-card reverse">
        <img
          src="src/assets/ear.jpg"
          alt="Earrings guide"
          className="sg-image"
        />
        <div className="sg-content">
          <h2>Earrings</h2>
          <p>
            Compare the earring diameter to a common object (example: 8 mm ≈
            pencil eraser).
          </p>
        </div>
      </div>
    </div>
  </div>
)

export default SizeGuide
