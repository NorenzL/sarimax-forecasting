// src/pages/CoffeePage.jsx
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import CommonFactors from "../components/CommonFactors";
import DeleteModal from "../components/DeleteModal";
import addIcon from "../assets/images/add-icon.png";
import { useFactors } from "../contexts/FactorContext";

const CoffeePage = () => {
  const { type } = useParams();
  const readable = type[0].toUpperCase() + type.slice(1);
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
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="px-8 py-12 mt-8 flex flex-col items-center gap-10">
        <h1 className="text-3xl font-bold text-text text-center">
          {readable} Data Collection
          <hr className="border-primary mt-5 w-full" />
        </h1>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
          {[`${readable} Farmgate Price`, `${readable} Production`].map(
            (label) => (
              <div
                key={label}
                className="bg-background text-text text-center rounded-md border-2 border-border p-6 flex flex-col items-center justify-center shadow hover:scale-105 hover:shadow-lg transition w-full max-w-96 h-64 cursor-pointer hover:bg-primary hover:text-background"
              >
                <img src={addIcon} alt="Add" className="w-32 h-32 mb-4" />
                <h2 className="text-xl font-semibold mb-2">{label}</h2>
              </div>
            )
          )}
        </div>

        <CommonFactors
          factors={factors}
          onUpload={handleUpload}
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

      {showConfirm && (
        <DeleteModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleDelete}
          fileName={toDelete}
        />
      )}
    </div>
  );
};

export default CoffeePage;
