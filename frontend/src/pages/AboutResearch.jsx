import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Norenz from "../assets/images/norenz.png";
import Aaron from "../assets/images/aaron.png";
import Ashly from "../assets/images/ashly.png";

function AboutResearch() {
  return (
    <div className="bg-background min-h-screen relative">
      <Navbar />

      <main className="px-8 py-12 mt-8">
        <h1 className="text-center text-4xl font-bold text-text mb-5">
          About the System
          <hr className="border-2 border-text mt-5" />
        </h1>

        <div className="flex justify-center gap-8 mb-8">
          Sales and price forecasting is essential for organizational planning
          and decision-making (Assey, 2024). It serves as a strategic tool that
          helps businesses anticipate trends and manage costs to maintain
          profitability (Ensafi et al., 2022). However, its accuracy can be
          hindered by incomplete or unreliable data (Assey, 2024). To improve
          forecasting precision, recent studies recommend using advanced models
          and integrating external macroeconomic factors, such as inflation.
          Despite its potential impact, the relationship between inflation and
          green coffee bean farmgate prices remains underexplored.
          <br />
          <br />
          This study aims to fill that gap by using the SARIMAX model, which
          captures both seasonal patterns and the influence of inflation as an
          external variable. It evaluates whether incorporating inflation
          improves the accuracy of forecasting green coffee bean prices in the
          Philippines. The research uses data from the Philippine Statistics
          Authority, including the Philippines' inflation rates, Arabica,
          Excelsa, and Robusta green coffee beans farmgate prices, production
          volume, production cost, and net returns.
          <br />
          <br />
          The system is also able to forecast two years’ worth of price data
          from the latest available dataset. A control group without inflation
          and an experimental group with inflation are compared using MAE, RMSE,
          MASE, and MAPE to assess model performance.
        </div>

        <h1 className="text-center text-4xl font-bold text-text mb-5">
          The Researchers
        </h1>

        <div className="flex flex-wrap justify-center gap-8">
          <div className="bg-primary text-background rounded-2xl border-2 border-secondary p-6 flex flex-col items-center justify-center shadow hover:scale-105 hover:shadow-lg transition w-64 h-74 cursor-pointer">
            <div className="mb-2 bg-background w-full px-5 border-4 border-secondary text-text rounded-t-2xl">
              <img src={Aaron} alt="aaron image" className="w-full" />
            </div>
            <h2 className="text-center font-semibold mt-4">
              Villaluz, Aaron Vincent M.
            </h2>
            <h3 className="text-center font-semibold">UI/UX Designer</h3>
          </div>

          <div className="bg-primary text-background rounded-2xl border-2 border-secondary p-6 flex flex-col items-center justify-center shadow hover:scale-105 hover:shadow-lg transition w-64 h-74 cursor-pointer">
            <div className="mb-2 bg-background w-full px-5 border-4 border-secondary rounded-t-2xl text-text">
              <img src={Norenz} alt="norenz image" className="w-full" />
            </div>
            <h2 className="text-center font-semibold mt-4">
              Laurito, Mark Norenz S.
            </h2>
            <h3 className="text-center font-semibold">Developer</h3>
          </div>

          <div className="bg-primary text-background rounded-2xl border-2 border-secondary p-6 flex flex-col items-center justify-center shadow hover:scale-105 hover:shadow-lg transition w-64 h-74 cursor-pointer">
            <div className="mb-2 bg-background w-full px-5 border-4 border-secondary rounded-t-2xl text-text">
              <img src={Ashly} alt="Ashly image" className="w-full" />
            </div>
            <h2 className="text-center font-semibold mt-4">Pusa, Ashly P.</h2>
            <h3 className="text-center font-semibold">Documentation</h3>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AboutResearch;
