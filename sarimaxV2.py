import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import itertools
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Load dataset
data = pd.read_csv("arabicacsv4.csv", parse_dates=["Date"], index_col="Date")

# Define target variable (Farmgate Price) and exogenous features
y = data["Farmgate_Price"]
X = data[["Production_Cost", "Net_Return", "Volume_Of_Production"]]

# Split into training (2010-2021) and testing (2022-2024)
y_train = y.loc["2010":"2021"]
y_test = y.loc["2022":"2024"]
X_train = X.loc["2010":"2021"]
X_test = X.loc["2022":"2024"]

# Drop exogenous variables with missing values in X_test
missing_columns = X_test.columns[X_test.isna().any()]
X_train = X_train.drop(columns=missing_columns)
X_test = X_test.drop(columns=missing_columns)

# Define p, d, q, P, D, Q, s (seasonality) ranges
p = d = q = range(0, 2)
P = D = Q = range(0, 2)
s = [4]  # Seasonal period of 4

# Generate all possible parameter combinations
param_combinations = list(itertools.product(p, d, q, P, D, Q, s))

# Grid Search for the best SARIMAX model based on AIC
best_aic = float("inf")
best_params = None
results_list = []

print("Evaluating different parameter combinations...\n")

for params in param_combinations:
    try:
        model = SARIMAX(y_train, exog=X_train, order=params[:3], seasonal_order=params[3:])
        result = model.fit(disp=False)
        aic = result.aic
        results_list.append((params, aic))
        print(f"Order: {params[:3]}, Seasonal Order: {params[3:]}, AIC: {aic:.2f}")
        
        # Check if it's the best model
        if aic < best_aic:
            best_aic = aic
            best_params = params
    except:
        print(f"Failed to fit model for {params}")
        continue  # Ignore models that fail to converge

# Sort results by AIC value
results_list.sort(key=lambda x: x[1])

# Display the top 5 best combinations
print("\nTop 5 parameter combinations:")
for i, (params, aic) in enumerate(results_list[:5]):
    print(f"{i+1}. Order: {params[:3]}, Seasonal Order: {params[3:]}, AIC: {aic:.2f}")

print(f"\nBest order: {best_params[:3]}, Best seasonal order: {best_params[3:]} (Lowest AIC: {best_aic:.2f})")

# Train the best SARIMAX Model
best_model = SARIMAX(y_train, exog=X_train, order=best_params[:3], seasonal_order=best_params[3:])
best_result = best_model.fit()

# Forecast with available exogenous variables
forecast = best_result.predict(start=y_test.index[0], end=y_test.index[-1], exog=X_test)

# Compute Error Metrics
mae = mean_absolute_error(y_test, forecast)
rmse = np.sqrt(mean_squared_error(y_test, forecast))

# Compute MASE
naive_forecast = np.abs(np.diff(y_train)).mean()
mase = mae / naive_forecast

# Compute MAPE
mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100

print(f"\nEvaluation Metrics for the Best Model:")
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
