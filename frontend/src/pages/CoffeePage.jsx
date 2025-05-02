// src/pages/CoffeePage.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import CommonFactors from "../components/CommonFactors";
import DeleteModal from "../components/DeleteModal";
import addIcon from "../assets/images/add-icon.png";
import UploadModal from "../components/UploadModal";
import { useFactors } from "../contexts/FactorContext";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/images/coffee-icon.png";
import inventory from "../assets/images/inventory1.png";

const CoffeePage = () => {
  const { type } = useParams();
  const readable = type[0].toUpperCase() + type.slice(1);
  const { factors, uploadFactor, deleteFactor } = useFactors();
  const [loadingFactor, setLoadingFactor] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState(null);
  const [mainFactors, setMainFactors] = useState([]);

  const handleUploadTrigger = (factorName) => {
    setSelectedFactor(factorName);
    setUploadModalOpen(true);
  };

  const handleUpload = (name, file) => {
    setLoadingFactor(name);
    setTimeout(() => {
      // Check if it's a main factor
      if (name.includes("Farmgate Price") || name.includes("Production")) {
        setMainFactors((prev) => [...prev, name]);
      } else {
        uploadFactor(name, file);
      }
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
      if (
        toDelete.includes("Farmgate Price") ||
        toDelete.includes("Production")
      ) {
        setMainFactors((prev) => prev.filter((item) => item !== toDelete));
      } else {
        deleteFactor(toDelete);
      }
      setLoadingFactor(null);
      setToDelete(null);
    }, 800);
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="px-8 py-12 mt-8 flex flex-col items-center gap-10">
        <div className="w-full max-w-6xl flex flex-col gap-3">
          <div className="flex items-center gap-4">
            <button onClick={() => window.history.back()}>
              <span className="text-2xl font-bold text-text hover:text-[#4d2d1c]">
                &larr;
              </span>
            </button>
            <h1 className="text-3xl font-bold text-text">
              {readable} Data Collection
            </h1>
          </div>
          <hr className="border-2 border-text w-full" />
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
          {[`${readable} Farmgate Price`, `${readable} Production`].map(
            (label) => {
              const isUploaded = mainFactors.includes(label);
              return (
                <div
                  key={label}
                  className={`relative bg-background text-text text-center rounded-md border-2 border-border p-6 flex flex-col items-center justify-center shadow transition w-full max-w-96 h-64 cursor-pointer ${
                    isUploaded
                      ? "hover:scale-105 hover:shadow-lg hover:bg-primary bg-primary text-white"
                      : "hover:scale-105 hover:shadow-lg hover:bg-primary hover:text-background"
                  }`}
                  onClick={() => {
                    if (!isUploaded) handleUploadTrigger(label);
                  }}
                >
                  <img
                    src={
                      isUploaded
                        ? label.includes("Production")
                          ? inventory
                          : logo
                        : addIcon
                    }
                    alt="Icon"
                    className="w-32 h-32 mb-4"
                  />
                  <h2 className="text-xl font-semibold mb-2">{label}</h2>
                  {isUploaded && (
                    <button
                      className="absolute top-2 text-text right-2 bg-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-500 hover:text-white transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmDelete(label);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              );
            }
          )}
        </div>

        <CommonFactors
          factors={factors}
          onUpload={handleUploadTrigger}
          onConfirmDelete={handleConfirmDelete}
          loadingFactor={loadingFactor}
        />

        <div className="flex items-center gap-4 mt-6">
          <button className="bg-highlights text-text px-[65px] py-2 rounded-full hover:bg-[#a19f43] transition hover:text-background">
            Forecast
          </button>
          <button className="opacity-0 pointer-events-none">×</button>
        </div>
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

export default CoffeePage;
