// src/pages/Home.jsx
import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ForecastCard from "../components/ForecastCard";
import OtherFactors from "../components/OtherFactors";

const Home = () => {
  const defaultFactors = [
    { name: "Inflation rate", uploaded: true },
    { name: "Net Return", uploaded: false },
    { name: "Production Cost", uploaded: false },
  ];

  const [factors, setFactors] = useState(defaultFactors);

  // Load from localStorage when page loads
  useEffect(() => {
    const savedFactors = localStorage.getItem("factors");
    if (savedFactors) {
      setFactors(JSON.parse(savedFactors));
    }
  }, []);

  // Save to localStorage every time factors change
  useEffect(() => {
    localStorage.setItem("factors", JSON.stringify(factors));
  }, [factors]);

  const handleRemove = (factorName) => {
    setFactors((prevFactors) =>
      prevFactors.map((factor) =>
        factor.name === factorName ? { ...factor, uploaded: false } : factor
      )
    );
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="px-8 py-12 mt-8">
        <h1 className="text-center text-4xl font-bold text-text mb-12">
          Coffee Forecast
          <hr className="border-primary mt-5" />
        </h1>

        <div className="flex justify-center gap-8 mb-16">
          <ForecastCard title="Arabica Farmgate Price Forecast" />
          <ForecastCard title="Excelsa Farmgate Price Forecast" />
          <ForecastCard title="Robusta Farmgate Price Forecast" />
        </div>

        <hr className="border-primary mb-8" />

        <OtherFactors factors={factors} onRemove={handleRemove} />
      </main>
    </div>
  );
};

export default Home;
