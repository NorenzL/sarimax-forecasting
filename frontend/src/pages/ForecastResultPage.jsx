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
    <div className="bg-background min-h-screen relative">
      <Navbar />
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Forecast Page</h1>
      </header>

      <button onClick={() => navigate(-1)} className="text-lg mb-4">
        ←
      </button>

      <div className="bg-brown-300 text-white p-4 rounded mb-4 text-center">
        <h2 className="text-xl font-bold">
          {forecastResult.coffeeType} Coffee Bean Farmgate Price Forecast,
          2010–2025
        </h2>
        <button className="bg-yellow-400 text-black px-3 py-1 rounded ml-4">
          Update Forecast
        </button>
      </div>

      <div className="flex gap-4 justify-center mx-4 mb-4">
        {/* Control Group */}
        <div className="bg-primary text-black rounded border-2 border-border p-4 shadow w-1/2">
          <h3 className="font-bold mb-2 text-xl text-background">
            Control Group Forecast
          </h3>
          <div className="mt-4 bg-background p-5 border-4 border-border rounded text-text">
            <Line
              data={{
                labels: forecastResult.control_model.forecast_dates,
                datasets: [
                  {
                    label: "Forecast",
                    data: forecastResult.control_model.forecast_values,
                    borderColor: "red",
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

          <div className="mt-4 bg-background p-5 border-4 border-border rounded text-text">
            <h2 className="font-bold text-xl">Evaluation:</h2>
            {["MAE", "RMSE", "MASE", "MAPE"].map((m) => (
              <p key={m}>
                {m}:{" "}
                {forecastResult.control_model[m]?.toFixed(m === "MAPE" ? 2 : 4)}
                {m === "MAPE" ? "%" : ""}
              </p>
            ))}
          </div>
        </div>

        {/* Experimental Group */}
        <div className="bg-primary text-black rounded border-2 border-border p-4 shadow w-1/2">
          <h3 className="font-bold mb-2 text-xl text-background">
            Experimental Group Forecast
          </h3>
          <div className="mt-4 bg-background p-5 border-4 border-border rounded text-text">
            <Line
              data={{
                labels: forecastResult.experimental_model.forecast_dates,
                datasets: [
                  {
                    label: "Forecast",
                    data: forecastResult.experimental_model.forecast_values,
                    borderColor: "red",
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

          <div className="mt-4 bg-background p-5 border-4 border-border rounded text-text">
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
        </div>
      </div>
    </div>
  );
}

export default ForecastResultPage;
