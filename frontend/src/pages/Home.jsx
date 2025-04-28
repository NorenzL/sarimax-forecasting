// src/pages/Home.jsx
import React from "react";
import Navbar from "../components/Navbar";
import ForecastCard from "../components/ForecastCard";
import OtherFactors from "../components/OtherFactors";

const Home = () => {
  // Define your factors & whether they’re already uploaded
  const factors = [
    { name: "Inflation rate", uploaded: true },
    { name: "Net Return", uploaded: false },
    { name: "Production Cost", uploaded: false },
  ];

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

        {/* ← Replace your inline mapping with the OtherFactors component */}
        <OtherFactors factors={factors} />
      </main>
    </div>
  );
};

export default Home;
