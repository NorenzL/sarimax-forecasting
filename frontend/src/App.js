// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import CoffeePage from "./pages/CoffeePage";
import ForecastResultPage from "./pages/ForecastResultPage";

// import AboutResearch from "./pages/AboutResearch";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/coffee/:type" element={<CoffeePage />} />
      <Route path="/forecast-result" element={<ForecastResultPage />} />
      {/* <Route path="/about-research" element={<AboutResearch />} /> */}
      {/* optional 404 page */}
      <Route path="*" element={<div className="p-8">Page not found</div>} />
    </Routes>
  );
}

export default App;
