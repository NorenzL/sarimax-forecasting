import React, { useRef } from "react";

const CommonFactors = ({
  factors,
  onUpload,
  onConfirmDelete,
  loadingFactor,
}) => {
  const fileInputRef = useRef();

  const handleChange = (e, name) => {
    const file = e.target.files[0];
    if (!file) return;

    if (
      !file.name.toLowerCase().endsWith(".csv") &&
      !file.name.toLowerCase().endsWith(".xlsx")
    ) {
      alert("Only .csv or .xlsx files are allowed.");
      return;
    }

    onUpload(name, file);
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <p className="text-xs text-center mb-2 text-text">
        You may {factors.some((f) => f.uploaded) ? "update" : "upload"} the data
        of the following external factors:
      </p>

      {factors.map((factor) => {
        const isLoading = loadingFactor === factor.name;
        const base = "border-2 border-border px-4 py-2 rounded transition-all";
        const inactive =
          "bg-background text-text hover:bg-primary hover:text-background";
        const active = "bg-primary text-background";

        return (
          <div
            key={`${factor.name}-${isLoading ? "loading" : "idle"}`}
            className="flex items-center gap-2"
          >
            {/* Hidden file input */}
            <button
              onClick={() => onUpload(factor.name)}
              disabled={factor.uploaded || isLoading}
              className={`${base} ${
                factor.uploaded ? active : inactive
              } min-w-[12rem] text-center flex justify-center items-center`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-secondary border-solid"></div>
              ) : (
                factor.name
              )}
            </button>

            {/* Delete Button */}
            <button
              onClick={() => onConfirmDelete(factor.name)}
              disabled={isLoading || !factor.uploaded}
              className={`font-bold transition hover:text-red-600 ${
                factor.uploaded
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default CommonFactors;
