import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForecastPage() {
  const [files, setFiles] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const requiredFiles = [
    "Coffee Farmgate Price",
    "Coffee Production Volume",
    "Inflation rate",
    "Net Return",
    "Production Cost",
  ];

  const handleFileChange = (e, fileKey) => {
    setFiles({ ...files, [fileKey]: e.target.files[0] });
  };

  const handleForecast = () => {
    const formData = new FormData();
    for (let key of requiredFiles) {
      if (!files[key]) {
        setErrorMsg(`Missing file: ${key}`);
        return;
      }
      formData.append(key, files[key]);
    }

    setLoading(true);
    setErrorMsg("");

    axios
      .post("http://localhost:5001/forecast", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((response) => {
        setLoading(false);
        // ✅ instead of setting local state, navigate to result page
        navigate("/forecast-result", {
          state: { forecastResult: response.data },
        });
      })
      .catch((error) => {
        console.error("Error fetching forecast:", error);
        setErrorMsg("Failed to fetch forecast.");
        setLoading(false);
      });
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Arabica Coffee Bean Farmgate Price Forecast</h2>

      <div>
        {requiredFiles.map((fileKey) => (
          <div key={fileKey}>
            <label>
              {fileKey}:
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={(e) => handleFileChange(e, fileKey)}
              />
            </label>
          </div>
        ))}
      </div>

      <button onClick={handleForecast} disabled={loading}>
        {loading ? "Generating Forecast..." : "Update Forecast"}
      </button>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </div>
  );
}

export default ForecastPage;
