import { useState, useEffect } from "react";
import { loadPaddleScript } from "../services/loadPaddle";

const Payment = () => {
  const [paddleLoaded, setPaddleLoaded] = useState(false);

  useEffect(() => {
    loadPaddleScript().then(() => setPaddleLoaded(true));
  }, []);

  const handleCheckout = () => {
    if (!paddleLoaded || !window.Paddle) {
      console.error("Paddle is not loaded");
      return;
    }

    window.Paddle.Checkout.open({
      product: 123456, // replace with your sandbox product ID
      email: "test@example.com",
      quantity: 1,
      passthrough: JSON.stringify({ userId: 42 }),
      successCallback: (data) => {
        console.log("Payment succeeded!", data);
        alert("Payment successful!");
      },
      closeCallback: () => {
        console.log("Checkout closed");
      },
    });
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Test Payment</h2>
      <p>Click the button below to simulate a payment using Paddle sandbox.</p>
      <button
        onClick={handleCheckout}
        disabled={!paddleLoaded}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: paddleLoaded ? "pointer" : "not-allowed",
        }}
      >
        Pay Now
      </button>
    </div>
  );
};

export default Payment;
