import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip,
} from "chart.js";

import { useState } from "react";
import helpIcon from "../assets/images/help.png";
import historyIcon from "../assets/images/history.png";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Legend,
  Tooltip
);

function ForecastResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const forecastResult = location.state?.forecastResult;

  if (!forecastResult) {
    return (
      <div>
        <p>No forecast result available.</p>
        <button onClick={() => navigate("/")}>Go back</button>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen relative p-5">
      <Navbar />
      {/* Forecast page header under Navbar */}
      <header className="relative flex justify-between items-center p-4 bg-brown-300 rounded mt-10">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-3xl font-bold mr-4"
          >
            ←
          </button>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 bg-primary px-10 py-2 rounded border-2 border-secondary">
          <h2 className="text-lg font-bold text-background">
            {forecastResult.coffee_type} Coffee Bean Farmgate Price Forecast
          </h2>
        </div>

        <div className="flex items-center space-x-2 hover:cursor-pointer">
          <div className="relative group">
            <img src={helpIcon} alt="Help" className="w-8 h-8" />
            <span className="absolute right-5 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200 bg-background text-primary text-xs rounded py-1 px-3 w-48 border-2 border-secondary">
              Lower values (closer to 0) mean better performance.
              <br />
              <br />
              MAE: Average absolute difference between predicted and actual
              values.
              <br />
              <br />
              RMSE: Average magnitude of squared forecast errors.
              <br />
              <br />
              MASE: Measures forecast accuracy relative to a naive model.
              <br />
              <br />
              MAPE: Average percentage error of forecasts.
              <br /> <br />
              Granger Causality: Tests if one time series can predict another
            </span>
          </div>

          <button>
            <img src={historyIcon} alt="History" className="w-8 h-8" />
          </button>
          <button className="bg-highlights text-primary font-bold px-3 py-1 rounded hover:bg-[#a19f43] transition hover:text-background">
            Update Forecast
          </button>
        </div>
      </header>

      <div className="flex gap-4 justify-center">
        {/* Control Group */}
        <div className="bg-primary text-black rounded border-2 border-secondary p-4 shadow w-1/2">
          <h3 className="font-bold mb-2 text-xl text-background">
            Control Group Forecast
          </h3>
          <div className="mt-4 bg-background p-5 border-4 border-secondary rounded text-text">
            <Line
              data={{
                labels: forecastResult.control_model.forecast_dates,
                datasets: [
                  {
                    label: "Forecast",
                    data: forecastResult.control_model.forecast_values,
                    borderColor: "#680100",
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                  },
                  {
                    label: "Actual",
                    data: forecastResult.control_model.actual_values ?? [], // you need to pass actual values if available
                    borderColor: "#A47863",
                    fill: false,
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: true, text: "Control Group Forecast" },
                },
              }}
            />
          </div>

          <div className="mt-4 bg-background p-5 border-4 border-secondary rounded text-text">
            <h2 className="font-bold text-xl">Evaluation:</h2>
            {["MAE", "RMSE", "MASE", "MAPE"].map((m) => (
              <p key={m}>
                {m}:{" "}
                {forecastResult.control_model[m]?.toFixed(m === "MAPE" ? 2 : 4)}
                {m === "MAPE" ? "%" : ""}
              </p>
            ))}
          </div>

          {/* Future forecast control */}
          <div className="mt-4 bg-background p-5 border-4 border-secondary rounded text-text">
            <h2 className="font-bold text-xl text-center">
              Forecast for 2 years
            </h2>
            <Line
              data={{
                labels: forecastResult.control_future_forecast.forecast_dates,
                datasets: [
                  {
                    label: "Forecast",
                    data: forecastResult.control_future_forecast
                      .forecast_values,
                    borderColor: "#680100",
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: true, text: "Control Group Forecast" },
                },
              }}
            />
          </div>
        </div>

        {/* Experimental Group */}
        <div className="bg-primary text-black rounded border-2 border-secondary p-4 shadow w-1/2">
          <h3 className="font-bold mb-2 text-xl text-background">
            Experimental Group Forecast
          </h3>
          <div className="mt-4 bg-background p-5 border-4 border-secondary rounded text-text">
            <Line
              data={{
                labels: forecastResult.experimental_model.forecast_dates,
                datasets: [
                  {
                    label: "Forecast",
                    data: forecastResult.experimental_model.forecast_values,
                    borderColor: "#680100",
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                  },
                  {
                    label: "Actual",
                    data: forecastResult.experimental_model.actual_values ?? [], // optional
                    borderColor: "#A47863",
                    fill: false,
                    tension: 0.1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: true, text: "Experimental Group Forecast" },
                },
              }}
            />
          </div>

          <div className="mt-4 bg-background p-5 border-4 border-secondary rounded text-text">
            <h2 className="font-bold text-xl">Evaluation:</h2>
            {["MAE", "RMSE", "MASE", "MAPE"].map((m) => (
              <p key={m}>
                {m}:{" "}
                {forecastResult.experimental_model[m]?.toFixed(
                  m === "MAPE" ? 2 : 4
                )}
                {m === "MAPE" ? "%" : ""}
              </p>
            ))}
          </div>

          {/* Future forecast experimental */}
          <div className="mt-4 bg-background p-5 border-4 border-secondary rounded text-text">
            <h2 className="font-bold text-xl text-center">
              Forecast for 2 years
            </h2>
            <Line
              data={{
                labels:
                  forecastResult.experimental_future_forecast.forecast_dates,
                datasets: [
                  {
                    label: "Forecast",
                    data: forecastResult.experimental_future_forecast
                      .forecast_values,
                    borderColor: "#680100",
                    fill: false,
                    tension: 0.1,
                    borderDash: [5, 5],
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: true, text: "Control Group Forecast" },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForecastResultPage;
