// src/components/ForecastCard.jsx
import React from "react";

const ForecastCard = ({ title }) => {
  return (
    <div className="bg-primary text-background rounded-md border-2 border-border p-6 flex flex-col items-center justify-center shadow hover:scale-105 hover:shadow-lg transition w-64 h-64">
      <img
        src="/coffee-beans.png"
        alt="Coffee Beans"
        className="w-16 h-16 mb-4"
      />
      <h2 className="text-center font-semibold">{title}</h2>
    </div>
  );
};

export default ForecastCard;
