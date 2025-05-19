import React from "react";
import { Line } from "react-chartjs-2";

function ForecastDisplay({ forecastResult }) {
  if (!forecastResult) return <p>No forecast data.</p>;

  return (
    <>
      <div className="flex gap-4 justify-center">
        {/* Control Group */}
        <div className="bg-primary text-black rounded border-2 border-secondary p-4 shadow w-1/2">
          <h3 className="font-bold mb-2 text-xl text-background">
            Forecasted Values (Control)
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
                    data: forecastResult.control_model.actual_values ?? [],
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
                scales: {
                  x: { title: { display: true, text: "Date" } },
                  y: { title: { display: true, text: "Farmgate Price" } },
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
                scales: {
                  x: { title: { display: true, text: "Date" } },
                  y: { title: { display: true, text: "Farmgate Price" } },
                },
              }}
            />
          </div>
        </div>

        {/* Experimental Group */}
        <div className="bg-primary text-black rounded border-2 border-secondary p-4 shadow w-1/2">
          <h3 className="font-bold mb-2 text-xl text-background">
            Forecasted Values Adjusted to inflation (Experimental)
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
                    data: forecastResult.experimental_model.actual_values ?? [],
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
                scales: {
                  x: { title: { display: true, text: "Date" } },
                  y: { title: { display: true, text: "Farmgate Price" } },
                },
              }}
            />
          </div>

          <div className="mt-4 bg-background p-5 border-4 border-secondary rounded text-text">
            <div className="flex gap-8">
              <div className="flex-1">
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

              {forecastResult.granger_pvalues && (
                <div className="flex-1">
                  <h2 className="font-bold text-xl">Granger Causality Test:</h2>
                  {Object.entries(forecastResult.granger_pvalues).map(
                    ([variable, pValue]) => (
                      <p key={variable}>
                        <strong>{variable}</strong> p-value ={" "}
                        {pValue.toFixed(4)}
                        {pValue < 0.05 && " (significant)"}
                      </p>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

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
                  title: { display: true, text: "Experimental Group Forecast" },
                },
                scales: {
                  x: { title: { display: true, text: "Date" } },
                  y: { title: { display: true, text: "Farmgate Price" } },
                },
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default ForecastDisplay;
