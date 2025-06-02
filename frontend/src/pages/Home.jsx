import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "../components/Navbar";
import ForecastCard from "../components/ForecastCard";
import CommonFactors from "../components/CommonFactors";
import DeleteModal from "../components/DeleteModal";
import UploadModal from "../components/UploadModal";
import { useFactors } from "../contexts/FactorContext";

const Home = () => {
  const { factors, uploadFactor, deleteFactor } = useFactors();
  const [loadingFactor, setLoadingFactor] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState(null);

  const handleUploadTrigger = (factorName) => {
    setSelectedFactor(factorName);
    setUploadModalOpen(true);
  };

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
    setLoadingFactor(toDelete);
    setShowConfirm(false);

    setTimeout(() => {
      deleteFactor(toDelete);
      setLoadingFactor(null);
      setToDelete(null);
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
            type="Arabica"
          />
          <ForecastCard
            title="Excelsa Farmgate Price Forecast"
            type="Excelsa"
          />
          <ForecastCard
            title="Robusta Farmgate Price Forecast"
            type="Robusta"
          />
        </div>

        <hr className="border-[2px] border-text mb-6" />

        <CommonFactors
          factors={factors}
          onUpload={handleUploadTrigger}
          onConfirmDelete={handleConfirmDelete}
          loadingFactor={loadingFactor}
        />
      </main>

      {/* Delete Modal */}
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

      {/* Upload Modal (with animation) */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UploadModal
              isOpen={uploadModalOpen}
              onClose={() => setUploadModalOpen(false)}
              onUpload={handleUpload}
              factorName={selectedFactor}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
