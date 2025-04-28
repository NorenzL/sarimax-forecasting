// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
// import AboutResearch from "./pages/AboutResearch";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* <Route path="/about-research" element={<AboutResearch />} /> */}
      {/* optional 404 page */}
      <Route path="*" element={<div className="p-8">Page not found</div>} />
    </Routes>
  );
}

export default App;
