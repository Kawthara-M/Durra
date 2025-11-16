// loadPaddle.js
export const loadPaddleScript = () => {
  return new Promise((resolve) => {
    if (window.Paddle) return resolve(window.Paddle);

    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/paddle.js";
    script.async = true;
    script.onload = () => {
      window.Paddle.Setup({ vendor: "pdl_sdbx_apikey_01ka443qmw5m9eyh0sfadw6sjz_YjbRxBpS5mABGvy7jKTtdf_A5K" }); // Replace with your sandbox vendor ID
      resolve(window.Paddle);
    };
    document.body.appendChild(script);
  });
};
