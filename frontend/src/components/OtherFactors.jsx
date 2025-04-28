// src/components/OtherFactors.jsx
import React from "react";

const OtherFactors = ({ factors }) => {
  return (
    <div className="flex flex-col items-center gap-2 mt-4">
      <p className="text-xs text-center mb-2 text-text">
        You may {factors.some((f) => f.uploaded) ? "update" : "upload"} the data
        of the following external factors:
      </p>
      {factors.map((factor) => {
        // base border & sizing
        const base = "border-2 border-border px-4 py-2 rounded transition-all";
        // default (not uploaded)
        const inactive =
          "bg-background text-text hover:bg-primary hover:text-background";
        // uploaded
        const active = "bg-primary text-background hover:bg-text";

        return (
          <div key={factor.name} className="flex items-center gap-2">
            <button
              className={`${base} ${factor.uploaded ? active : inactive}
              min-w-[12rem]        /* ← ensures every button is at least 12rem wide */
              text-center         /* center-align the text */
            `}
            >
              {factor.name}
            </button>

            {factor.uploaded && (
              <button className="text-brown hover:text-red-600 font-bold transition">
                ×
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default OtherFactors;
