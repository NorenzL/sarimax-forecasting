// src/pages/ForecastResultPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ForecastResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.forecastResult;

  if (!result) {
    return (
      <div style={{ padding: 20 }}>
        <h2>No forecast result available.</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Forecast Result</h2>

      <h3>Control Model Evaluation:</h3>
      <p>MASE: {result.control_model.MASE?.toFixed(4)}</p>
      <p>RMSE: {result.control_model.RMSE?.toFixed(4)}</p>
      <p>MAPE: {result.control_model.MAPE?.toFixed(2)}%</p>
      <p>MAE: {result.control_model.MAE?.toFixed(4)}</p>

      <img
        src={`data:image/png;base64,${result.control_model.forecast_plot}`}
        alt="Control Forecast"
        style={{ width: "100%", maxWidth: "600px" }}
      />

      <h3>Experimental Model Evaluation:</h3>
      <p>MASE: {result.experimental_model.MASE?.toFixed(4)}</p>
      <p>RMSE: {result.experimental_model.RMSE?.toFixed(4)}</p>
      <p>MAPE: {result.experimental_model.MAPE?.toFixed(2)}%</p>
      <p>MAE: {result.experimental_model.MAE?.toFixed(4)}</p>

      <img
        src={`data:image/png;base64,${result.experimental_model.forecast_plot}`}
        alt="Experimental Forecast"
        style={{ width: "100%", maxWidth: "600px" }}
      />

      <button style={{ marginTop: 20 }} onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
};

export default ForecastResultPage;
