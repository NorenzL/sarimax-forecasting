// src/pages/Home.jsx
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ForecastCard from "../components/ForecastCard";
import CommonFactors from "../components/CommonFactors";
import DeleteModal from "../components/DeleteModal";
import { useFactors } from "../contexts/FactorContext";

const Home = () => {
  const { factors, uploadFactor, deleteFactor } = useFactors();
  const [loadingFactor, setLoadingFactor] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const handleUpload = (name, file) => {
    setLoadingFactor(name);
    setTimeout(() => {
      uploadFactor(name, file);
      setLoadingFactor(null);
    }, 800);
  };

  const handleConfirmDelete = (name) => {
    setToDelete(name);
    setShowConfirm(true);
  };

  const handleDelete = () => {
    setLoadingFactor(toDelete); // Show spinner
    setShowConfirm(false); // Close modal

    // Simulate delay (or handle actual async logic)
    setTimeout(() => {
      deleteFactor(toDelete); // Remove the factor
      setLoadingFactor(null); // Stop spinner
      setToDelete(null); // Reset state
    }, 800);
  };

  return (
    <div className="bg-background min-h-screen relative">
      <Navbar />
      <main className="px-8 py-12 mt-8">
        <h1 className="text-center text-4xl font-bold text-text mb-5">
          Coffee Forecast
          <hr className="border-2 border-text mt-5" />
        </h1>

        <div className="flex justify-center gap-8 mb-8">
          <ForecastCard
            title="Arabica Farmgate Price Forecast"
            type="arabica"
          />
          <ForecastCard
            title="Excelsa Farmgate Price Forecast"
            type="excelsa"
          />
          <ForecastCard
            title="Robusta Farmgate Price Forecast"
            type="robusta"
          />
        </div>

        <hr className="border-[2px] border-text mb-6" />

        <CommonFactors
          factors={factors}
          onUpload={handleUpload}
          onConfirmDelete={handleConfirmDelete}
          loadingFactor={loadingFactor}
        />
      </main>

      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DeleteModal
              isOpen={showConfirm}
              onClose={() => setShowConfirm(false)}
              onConfirm={handleDelete}
              fileName={toDelete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
