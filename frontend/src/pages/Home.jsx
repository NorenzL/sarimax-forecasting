import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ForecastCard from "../components/ForecastCard";
import CommonFactors from "../components/CommonFactors";
import DeleteModal from "../components/DeleteModal";

const Home = () => {
  const [factors, setFactors] = useState([
    { name: "Inflation rate", uploaded: true },
    { name: "Net Return", uploaded: false },
    { name: "Production Cost", uploaded: false },
  ]);
  const [loadingFactor, setLoadingFactor] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [factorToDelete, setFactorToDelete] = useState(null);

  const handleUpload = (name) => {
    setLoadingFactor(name);
    setTimeout(() => {
      setFactors((prev) =>
        prev.map((f) => (f.name === name ? { ...f, uploaded: true } : f))
      );
      setLoadingFactor(null);
    }, 800);
  };

  const handleConfirmDelete = (name) => {
    setFactorToDelete(name);
    setShowConfirm(true);
  };

  const handleDelete = () => {
    setLoadingFactor(factorToDelete);
    setShowConfirm(false);
    setTimeout(() => {
      setFactors((prev) =>
        prev.map((f) =>
          f.name === factorToDelete ? { ...f, uploaded: false } : f
        )
      );
      setLoadingFactor(null);
      setFactorToDelete(null);
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

      {/* AnimatePresence will handle mounting/unmounting animations */}
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
              fileName={factorToDelete}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
