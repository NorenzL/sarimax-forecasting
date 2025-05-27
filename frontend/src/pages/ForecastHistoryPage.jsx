import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; // assuming you use react-router
import Navbar from "../components/Navbar";
import ForecastDisplay from "../pages/ForecastDisplay";

export default function ForecastHistoryPage() {
  const { coffeeType } = useParams();
  const [history, setHistory] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  console.log("Selected forecast data:", selectedResult);

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:5001/api/history")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch history");
        return res.json();
      })
      .then((data) => {
        const filtered = data
          .filter((entry) => entry.coffee_type === coffeeType)
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        setHistory(filtered);
        setSelectedResult(filtered[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching history:", err);
        setError("Could not load forecast history.");
        setLoading(false);
      });
  }, [coffeeType]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-white">
      {/* Navbar stays on top */}
      <Navbar />

      {/* Main section: sidebar and content side by side */}
      <div className="flex flex-1 mt-12">
        {/* Sidebar */}
        <div className="w-64 bg-primary ml-4 mt-4 mb-4 rounded-t-2xl">
          <div className="bg-secondary p-1 flex justify-center items-center h-10 rounded-t-2xl">
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 text-xl font-bold"
            >
              ← Forecast History
            </button>
          </div>

          <div className="overflow-y-auto max-h-[90vh]">
            {history.map((entry, index) => (
              <button
                key={index}
                onClick={() => setSelectedResult(entry)}
                className={`block w-full hover:bg-[#5a3c2d] p-2 rounded text-center border border-border box-border ${
                  index !== 0 ? "-mt-[1px] border-t-0" : ""
                } ${selectedResult === entry ? "bg-[#5a3c2d] text-white" : ""}`}
              >
                {new Date(entry.timestamp).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : error ? (
          <div className="p-6 text-red-500">{error}</div>
        ) : (
          <div className="flex-1 p-6">
            {selectedResult ? (
              <>
                <div className="bg-primary px-10 py-2 rounded-xl border-2 border-secondary mb-3">
                  <h1 className="text-center text-2xl font-bold capitalize">
                    {coffeeType} Coffee Bean Farmgate Price Forecast
                  </h1>
                </div>

                <ForecastDisplay forecastResult={selectedResult} />
              </>
            ) : (
              <p>
                No forecast selected or no history available for{" "}
                <strong>{coffeeType}</strong>.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
