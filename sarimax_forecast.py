import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Load dataset
data = pd.read_csv("arabicacsv3.csv", parse_dates=["Date"], index_col="Date")

# Define target variable
y = data["Farmgate_Price"]

# Define exogenous variables
exog_control = data[["Production_Cost", "Net_Return", "Volume_Of_Production"]]
exog_experimental = data[["Production_Cost", "Net_Return", "Volume_Of_Production", "Inflation"]]

# Split into training and testing sets
train_size = int(len(y) * 0.8)
y_train, y_test = y[:train_size], y[train_size:]
X_control_train, X_control_test = exog_control[:train_size], exog_control[train_size:]
X_experimental_train, X_experimental_test = exog_experimental[:train_size], exog_experimental[train_size:]

# Function to train and evaluate SARIMAX model
def train_evaluate_sarimax(y_train, y_test, exog_train, exog_test, order, seasonal_order, label):
    model = SARIMAX(y_train, exog=exog_train, order=order, seasonal_order=seasonal_order)
    result = model.fit(disp=False)
    forecast = result.predict(start=len(y_train), end=len(y_train)+len(y_test)-1, exog=exog_test)
    
    # Compute error metrics
    mae = mean_absolute_error(y_test, forecast)
    rmse = np.sqrt(mean_squared_error(y_test, forecast))
    naive_forecast = np.abs(np.diff(y_test)).mean()
    mase = mae / naive_forecast
    mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100
    
    # Print evaluation metrics
    print(f"\n{label} Model Evaluation Metrics:")
    print(f"AIC: {result.aic}")
    print(f"MAE: {mae}")
    print(f"RMSE: {rmse}")
    print(f"MASE: {mase}")
    print(f"MAPE: {mape:.2f}%")
    
    # Plot results
    plt.figure(figsize=(10, 5))
    plt.plot(y_test.index, y_test, label="Actual", color="blue")
    plt.plot(y_test.index, forecast, label="Forecast", color="red", linestyle="dashed")
    plt.legend()
    plt.title(f"{label} - Farmgate Price Forecast")
    plt.show()
    
    return result

# Train and evaluate Control Model
control_order = (4, 2, 4)
control_seasonal_order = (0, 1, 0, 4)
control_result = train_evaluate_sarimax(y_train, y_test, X_control_train, X_control_test, control_order, control_seasonal_order, "Control")

# Train and evaluate Experimental Model
experimental_order = (3, 2, 3)
experimental_seasonal_order = (3, 1, 3, 4)
experimental_result = train_evaluate_sarimax(y_train, y_test, X_experimental_train, X_experimental_test, experimental_order, experimental_seasonal_order, "Experimental")
