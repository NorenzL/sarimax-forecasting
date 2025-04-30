import React, { useRef, useState } from "react";
import inventory from "../assets/images/inventory-2.png";

const UploadModal = ({ isOpen, onClose, onUpload, factorName }) => {
  const fileInputRef = useRef();
  const [fileName, setFileName] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onUpload(factorName, file);
      onClose();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onUpload(factorName, file);
      onClose();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="bg-[#FFF9EC] rounded-md shadow-lg w-full max-w-3xl"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {/* Header */}
        <div className="bg-[#5C4033] text-white px-6 py-4 flex justify-between items-center rounded-t-md">
          <h2 className="text-xl font-semibold">{factorName}</h2>
          <button
            className="text-2xl font-bold hover:text-red-400"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-1 text-center">
          <div className="border-4 border-dashed border-[#5C4033] p-16 rounded flex flex-col items-center">
            <div
              className="cursor-pointer w-full flex flex-col items-center"
              onClick={() => fileInputRef.current.click()}
            >
              <img
                src={inventory}
                alt="Upload"
                className="mx-auto w-24 h-24 mb-4"
              />
              <button className="bg-primary text-white py-2 px-4 rounded hover:bg-[#3A1E1E]">
                Browse File
              </button>
              <p className="text-xs text-text mt-2">or Drag CSV/Excel File</p>

              {fileName && (
                <p className="text-sm text-text mt-2 font-medium">
                  Selected file: <span className="italic">{fileName}</span>
                </p>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
