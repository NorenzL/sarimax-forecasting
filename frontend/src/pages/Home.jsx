import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ForecastCard from "../components/ForecastCard";
import CommonFactors from "../components/CommonFactors";

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
          // Overlay
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Modal box */}
            <motion.div
              className="bg-background p-8 rounded shadow-lg text-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-text mb-4">
                Are you sure you want to delete <br />
                <span className="font-bold">{factorToDelete}</span>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
