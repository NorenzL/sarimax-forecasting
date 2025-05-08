// src/pages/CoffeePage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import CommonFactors from "../components/CommonFactors";
import DeleteModal from "../components/DeleteModal";
import UploadModal from "../components/UploadModal";
import { useFactors } from "../contexts/FactorContext";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/images/coffee-icon.png";
import inventory from "../assets/images/inventory1.png";
import axios from "axios";
import addIcon from "../assets/images/add-icon.png";
import FullPageSpinner from "../components/FullPageSpinner";

export default function CoffeePage() {
  const { type } = useParams();
  const readable = type[0].toUpperCase() + type.slice(1);

  // your three common factors from context:
  const { factors, uploadFactor, deleteFactor } = useFactors();

  // instead of mainFactors-array-of-names, store file objects:
  const [mainFiles, setMainFiles] = useState({});

  // UI state:
  const [loadingFactor, setLoadingFactor] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState(null);
  const [missingFactors, setMissingFactors] = useState([]);
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [forecastResult, setForecastResult] = useState(null);
  const [isForecasting, setIsForecasting] = useState(false);
  const navigate = useNavigate();

  const requiredFactors = [
    `${readable} Farmgate Price`,
    `${readable} Production Volume`,
    "Inflation rate",
    "Net Return",
    "Production Cost",
  ];

  // step 1: open the upload‐modal
  const handleUploadTrigger = (factorName) => {
    setSelectedFactor(factorName);
    setUploadModalOpen(true);
  };

  // step 2: when the modal hands us back a real File
  const handleUpload = (name, file) => {
    setLoadingFactor(name);
    setTimeout(() => {
      // if it’s one of the two “main” cards, store in mainFiles:
      if (
        name.includes("Farmgate Price") ||
        name.includes("Production Volume")
      ) {
        setMainFiles((prev) => ({ ...prev, [name]: file }));
      } else {
        // otherwise it’s a “common” factor
        uploadFactor(name, file);
      }
      setLoadingFactor(null);
      setUploadModalOpen(false);
    }, 800);
  };

  // confirm ⇒ delete either from mainFiles or context
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
        toDelete.includes("Production Volume")
      ) {
        const { [toDelete]: _, ...rest } = mainFiles;
        setMainFiles(rest);
      } else {
        deleteFactor(toDelete);
      }
      setLoadingFactor(null);
      setToDelete(null);
    }, 800);
  };

  // finally pack up **all** of the File objects and POST
  const handleForecastClick = async () => {
    // build list of missing
    const uploadedNames = [
      ...Object.keys(mainFiles),
      ...factors.filter((f) => f.uploaded).map((f) => f.name),
    ];
    const missing = requiredFactors.filter((f) => !uploadedNames.includes(f));
    if (missing.length) {
      setMissingFactors(missing);
      setShowMissingModal(true);
      return;
    }

    // all good, send them
    const formData = new FormData();
    // main files
    Object.entries(mainFiles).forEach(([name, file]) =>
      formData.append(name, file)
    );
    // common files
    factors.forEach((f) => {
      if (f.uploaded && f.file) {
        formData.append(f.name, f.file);
      }
    });
    formData.append("type", type);

    try {
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
      setIsForecasting(true);
      const res = await axios
        .post("http://localhost:5001/forecast", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((response) => {
          navigate("/forecast-result", {
            state: { forecastResult: response.data },
          });
        })
        .catch((error) => {
          console.error("Error fetching forecast:", error);
        });
    } catch (e) {
      console.error(e.response?.data);
      alert("Forecast failed bugok, see console");
    } finally {
      setIsForecasting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <main className="px-8 py-12 mt-8 flex flex-col items-center gap-10">
        {/* header + back‐arrow */}
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

        {/* the two “main” upload cards */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl justify-center">
          {[`${readable} Farmgate Price`, `${readable} Production Volume`].map(
            (label) => {
              const isUploaded = Boolean(mainFiles[label]);
              return (
                <div
                  key={label}
                  disabled={isUploaded}
                  className={`
                  relative bg-background text-text text-center
                  rounded-md border-2 border-border p-6
                  flex flex-col items-center justify-center shadow
                  transition w-full max-w-96 h-64 
                  ${
                    isUploaded
                      ? "bg-primary text-white hover:bg-primary hover:text-white hover:shadow-lg"
                      : "hover:bg-primary hover:text-background hover:scale-105 cursor-pointer"
                  }
                `}
                  onClick={() => !isUploaded && handleUploadTrigger(label)}
                >
                  <img
                    src={
                      isUploaded
                        ? label.includes("Production")
                          ? inventory
                          : logo
                        : addIcon
                    }
                    alt=""
                    className="w-32 h-32 mb-4"
                  />
                  <h2 className="text-xl font-semibold mb-2">{label}</h2>
                  {isUploaded && (
                    <button
                      className="absolute top-2 right-2 bg-white text-primary rounded-full w-6 h-6
                               flex items-center justify-center shadow-md
                               hover:bg-red-500 hover:text-white transition"
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

        {/* your three common factors */}
        <CommonFactors
          factors={factors}
          onUpload={handleUploadTrigger}
          onConfirmDelete={handleConfirmDelete}
          loadingFactor={loadingFactor}
        />

        {/* forecast button */}
        <div className="flex items-center gap-4 mt-6">
          <button
            className="bg-highlights text-text px-[65px] py-2 rounded-full
                       hover:bg-[#a19f43] transition hover:text-background"
            onClick={handleForecastClick}
          >
            Forecast
          </button>
        </div>
      </main>

      {/* DELETE confirmation */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex
                       items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <DeleteModal
              isOpen={true}
              fileName={toDelete}
              onClose={() => setShowConfirm(false)}
              onConfirm={handleDelete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* UPLOAD modal */}
      <AnimatePresence>
        {uploadModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex
                       items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UploadModal
              isOpen={true}
              factorName={selectedFactor}
              onClose={() => setUploadModalOpen(false)}
              onUpload={handleUpload}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MISSING‐FILES warning */}
      <AnimatePresence>
        {showMissingModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex
                       items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-[#FFF9EC] rounded-md shadow-lg w-full max-w-3xl">
              {/* header */}
              {/* Header */}
              <div className="bg-[#5C4033] text-white px-6 py-4 flex justify-between items-center rounded-t-md">
                <h2 className="text-xl font-semibold">Incomplete Data</h2>
                <button
                  className="text-2xl font-bold hover:text-red-400"
                  onClick={() => setShowMissingModal(false)}
                >
                  ×
                </button>
              </div>
              {/* list */}
              <div className="px-3 py-3">
                <div className="border-2 border-[#5C4033] px-6 py-10 rounded">
                  <h2 className="text-2xl font-bold mb-2 text-[#4d2d1c]">
                    The system detects a missing Data file, please provide the
                    Data of the following:
                  </h2>
                  <ul className="text-left space-y-2">
                    {missingFactors.map((factor) => (
                      <li
                        key={factor}
                        className="flex items-center gap-2 text-[#4d2d1c] font-medium mt-5"
                      >
                        <span className="text-red-600 border-2 border-red-600 rounded-full px-1">
                          ✖
                        </span>
                        {factor}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isForecasting && <FullPageSpinner />}
    </div>
  );
}
