import React from "react";

const OtherFactors = ({ factors, onRemove }) => {
  // ← add onRemove here
  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <p className="text-xs text-center mb-2 text-text">
        You may {factors.some((f) => f.uploaded) ? "update" : "upload"} the data
        of the following external factors:
      </p>
      {factors.map((factor) => {
        const base = "border-2 border-border px-4 py-2 rounded transition-all";
        const inactive =
          "bg-background text-text hover:bg-primary hover:text-background";
        const active = "bg-primary text-background hover:bg-text";

        return (
          <div key={factor.name} className="flex items-center gap-2">
            <button
              className={`${base} ${factor.uploaded ? active : inactive}
                min-w-[12rem] text-center`}
            >
              {factor.name}
            </button>

            {/* Always render the cross button, but toggle opacity */}
            <button
              onClick={() => onRemove(factor.name)} // ← ADD this onClick
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

export default OtherFactors;
