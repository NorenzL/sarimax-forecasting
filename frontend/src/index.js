// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { FactorProvider } from "./contexts/FactorContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <FactorProvider>
        <App />
      </FactorProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
