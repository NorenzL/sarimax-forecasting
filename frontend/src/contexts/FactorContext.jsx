import React, { createContext, useContext, useState } from "react";

const FactorContext = createContext();

export const useFactors = () => useContext(FactorContext);

export const FactorProvider = ({ children }) => {
  // three common factors global state
  const [factors, setFactors] = useState([
    { name: "Inflation rate", uploaded: false, file: null },
    { name: "Net Return", uploaded: false, file: null },
    { name: "Production Cost", uploaded: false, file: null },
  ]);

  // File upload
  const uploadFactor = (name, file) => {
    setFactors((prev) =>
      prev.map((factor) =>
        factor.name === name ? { ...factor, uploaded: true, file } : factor
      )
    );
  };

  // Remove file
  const deleteFactor = (name) => {
    setFactors((prev) =>
      prev.map((f) =>
        f.name === name ? { ...f, uploaded: false, file: null } : f
      )
    );
  };

  return (
    <FactorContext.Provider value={{ factors, uploadFactor, deleteFactor }}>
      {children}
    </FactorContext.Provider>
  );
};
