import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error
from pmdarima import auto_arima

# Load dataset
data = pd.read_csv("arabicacsv2.csv", parse_dates=["Date"], index_col="Date")

# Define target variable (Farmgate Price) and exogenous features
y = data["Farmgate_Price"]
X = data[["Production_Cost", "Net_Return", "Volume_Of_Production"]]

# Split into training and testing
train_size = int(len(y) * 0.8)  # 80% train, 20% test
y_train, y_test = y[:train_size], y[train_size:]
X_train, X_test = X[:train_size], X[train_size:]

auto_model = auto_arima(
    y_train, 
    exogenous=X_train, 
    seasonal=True, 
    m=12,  # Monthly seasonality
    stepwise=True, 
    trace=True  # Show progress
)
print("\nBest SARIMA Order:", auto_model.order)
print("Best Seasonal Order:", auto_model.seasonal_order)


# Train SARIMAX Model
model = SARIMAX(y_train, exog=X_train, order=auto_model.order, seasonal_order=auto_model.seasonal_order)
result = model.fit()

# Forecast with exogenous variables
forecast = result.predict(start=len(y_train), end=len(y)-1, exog=X_test)

# Compute Error Metrics
mae = mean_absolute_error(y_test, forecast)
rmse = np.sqrt(mean_squared_error(y_test, forecast))

# Compute MASE
naive_forecast = np.abs(np.diff(y_test)).mean()
mase = mae / naive_forecast

# Compute MAPE
mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100

print(f"MAE: {mae}")
print(f"RMSE: {rmse}")
print(f"MASE: {mase}")
print(f"MAPE: {mape:.2f}%")

# Plot Results
plt.figure(figsize=(10, 5))
plt.plot(y_test.index, y_test, label="Actual", color="blue")
plt.plot(y_test.index, forecast, label="Forecast", color="red", linestyle="dashed")
plt.legend()
plt.title("Farmgate Price Forecast with SARIMAX")
plt.show()