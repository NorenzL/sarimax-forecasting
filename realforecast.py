import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX

# Load dataset
data = pd.read_csv("arabicacsv3.csv", parse_dates=["Date"], index_col="Date")

# --- Example: Forecast Inflation Rate ---
y_inflation = data['Inflation']

model = ARIMA(y_inflation, order=(7,0,0))  # try different params later
result = model.fit()

forecast_steps = 8  # e.g., next 2 years if quarterly
forecast_values = result.forecast(steps=forecast_steps)

print("Forecasted Inflation Rate:")
print(forecast_values)

# Optional: plot
plt.figure(figsize=(10,5))
plt.plot(y_inflation.index, y_inflation, label='Actual')
future_dates = pd.date_range(start=y_inflation.index[-1] + pd.offsets.QuarterBegin(), periods=forecast_steps, freq='Q')
plt.plot(future_dates, forecast_values, label='Forecast', linestyle='dashed')
plt.legend()
plt.show()
