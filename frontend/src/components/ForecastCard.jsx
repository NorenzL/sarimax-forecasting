// src/components/ForecastCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/images/coffee-icon.png";

const ForecastCard = ({ title, type }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/coffee/${type}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-primary text-background rounded-md border-2 border-border p-6 flex flex-col items-center justify-center shadow hover:scale-105 hover:shadow-lg transition w-64 h-64 cursor-pointer hover:bg-text"
    >
      <img src={logo} alt="Coffee Beans" className="w-32 h-32 mb-4" />
      <h2 className="text-center font-semibold">{title}</h2>
    </div>
  );
};

export default ForecastCard;
