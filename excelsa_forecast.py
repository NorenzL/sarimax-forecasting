import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import itertools
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Load dataset
data = pd.read_csv("excelsa.csv", parse_dates=["Date"], index_col="Date")

# Define target variable (Farmgate Price) and exogenous features
y = data["Farmgate_Price"]
X = data[["Production_Cost", "Net_Return", "Volume_Of_Production"]]

# Split into training and testing
train_size = int(len(y) * 0.8)  # 80% train, 20% test
y_train, y_test = y[:train_size], y[train_size:]
X_train, X_test = X[:train_size], X[train_size:]

# Define p, d, q, P, D, Q, s (seasonality) ranges
p = d = q = range(0, 3)  # Extended range for better exploration
P = D = Q = range(0, 3)
s = [4]  # Seasonal period of 4
    
# Generate all possible parameter combinations
param_combinations = list(itertools.product(p, d, q, P, D, Q, s))

# Grid Search for the best SARIMAX model based on predictive performance
best_metric = float("inf")
best_params = None
results_list = []

print("Evaluating different parameter combinations...\n")

for params in param_combinations:
    try:
        model = SARIMAX(y_train, exog=X_train, order=params[:3], seasonal_order=params[3:])
        result = model.fit(disp=False)
        
        # Forecast using test set
        forecast = result.predict(start=len(y_train), end=len(y)-1, exog=X_test)

        # Compute Error Metrics
        mae = mean_absolute_error(y_test, forecast)
        rmse = np.sqrt(mean_squared_error(y_test, forecast))
        naive_forecast = np.abs(np.diff(y_test)).mean()
        mase = mae / naive_forecast
        mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100
        aic = result.aic  # Still keep AIC for reference

        # Store results
        results_list.append((params, aic, mae, rmse, mase, mape))
        print(f"Order: {params[:3]}, Seasonal Order: {params[3:]}, AIC: {aic:.2f}, MAE: {mae:.4f}, RMSE: {rmse:.4f}, MASE: {mase:.4f}, MAPE: {mape:.2f}%")
        
        # Select the best model based on the lowest MAE
        if mae < best_metric:
            best_metric = mae
            best_params = params

    except:
        print(f"Failed to fit model for {params}")
        continue  # Ignore models that fail to converge

# Sort results by MAE
results_list.sort(key=lambda x: x[2])  # Sorting based on MAE

# Display the top 10 best combinations based on AIC
print("\nTop 10 parameter combinations based on MAE:")
for i, (params, aic, mae, rmse, mase, mape) in enumerate(results_list[:10]):
    print(f"{i+1}. Order: {params[:3]}, Seasonal Order: {params[3:]}, AIC: {aic:.2f}, MAE: {mae:.5f}, RMSE: {rmse:.5f}, MASE: {mase:.5f}, MAPE: {mape:.2f}%")

print(f"\nBest order based on MAE: {best_params[:3]}, Best seasonal order: {best_params[3:]}, Lowest MAE: {best_metric:.5f}")

# Train the best SARIMAX Model
best_model = SARIMAX(y_train, exog=X_train, order=best_params[:3], seasonal_order=best_params[3:])
best_result = best_model.fit()

# Forecast with exogenous variables
forecast = best_result.predict(start=len(y_train), end=len(y)-1, exog=X_test)

# Compute final Error Metrics
mae = mean_absolute_error(y_test, forecast)
rmse = np.sqrt(mean_squared_error(y_test, forecast))
naive_forecast = np.abs(np.diff(y_test)).mean()
mase = mae / naive_forecast
mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100

# Store final results
best_model_results = {
    'AIC': best_result.aic,
    'MAE': mae,
    'RMSE': rmse,
    'MAPE': mape,
    'MASE': mase
}

# Print final evaluation metrics
print(f"\nFinal Evaluation Metrics for the Best Model:")
print(f"AIC: {best_model_results['AIC']}")
print(f"MAE: {best_model_results['MAE']}")
print(f"RMSE: {best_model_results['RMSE']}")
print(f"MASE: {best_model_results['MASE']}")
print(f"MAPE: {best_model_results['MAPE']:.2f}%")

# Plot Results
plt.figure(figsize=(10, 5))
plt.plot(y_test.index, y_test, label="Actual", color="blue")
plt.plot(y_test.index, forecast, label="Forecast", color="red", linestyle="dashed")
plt.legend()
plt.title("EXCELSA Farmgate Price Forecast (control)")
plt.show()
