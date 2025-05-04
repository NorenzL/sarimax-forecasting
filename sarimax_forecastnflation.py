import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import itertools
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error

# Load dataset
data = pd.read_csv("arabicacsv3.csv", parse_dates=["Date"], index_col="Date")

# Define target variable (Farmgate Price) and exogenous features
y = data["Farmgate_Price"]
X = data[["Production_Cost", "Net_Return", "Volume_Of_Production", "Inflation"]]

# Split into training and testing
train_size = int(len(y) * 0.8)  # 80% train, 20% test
y_train, y_test = y[:train_size], y[train_size:]
X_train, X_test = X[:train_size], X[train_size:]

# # Define p, d, q, P, D, Q, s (seasonality) ranges
# p = d = q = range(0, 3)
# P = D = Q = range(0, 3)
# s = [4]  # Seasonal period of 4

# # Generate all possible parameter combinations
# param_combinations = list(itertools.product(p, d, q, P, D, Q, s))

# # Grid Search for the best SARIMAX model based on AIC
# best_metric = float("inf")
# best_params = None
# results_list = []

# print("Evaluating different parameter combinations...\n")

# for params in param_combinations:
#     try:
#         model = SARIMAX(y_train, exog=X_train, order=params[:3], seasonal_order=params[3:])
#         result = model.fit(disp=False)
        
#         # Forecast using test set
#         forecast = result.predict(start=len(y_train), end=len(y)-1, exog=X_test)

#         # Compute Error Metrics
#         mae = mean_absolute_error(y_test, forecast)
#         rmse = np.sqrt(mean_squared_error(y_test, forecast))
#         naive_forecast = np.abs(np.diff(y_test)).mean()
#         mase = mae / naive_forecast
#         mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100
#         aic = result.aic  # Still keep AIC for reference

#         # Store results
#         results_list.append((params, aic, mae, rmse, mase, mape))
#         print(f"Order: {params[:3]}, Seasonal Order: {params[3:]}, AIC: {aic:.2f}, MAE: {mae:.4f}, RMSE: {rmse:.4f}, MASE: {mase:.4f}, MAPE: {mape:.2f}%")
        
#         # Select the best model based on the lowest MAE
#         if mae < best_metric:
#             best_metric = mae
#             best_params = params

#     except:
#         print(f"Failed to fit model for {params}")
#         continue  # Ignore models that fail to converge

# # Sort results by MAE
# results_list.sort(key=lambda x: x[2])  # Sorting based on MAE

# # Display the top 10 best combinations based on AIC
# print("\nTop 10 parameter combinations based on MAE:")
# for i, (params, aic, mae, rmse, mase, mape) in enumerate(results_list[:10]):
#     print(f"{i+1}. Order: {params[:3]}, Seasonal Order: {params[3:]}, AIC: {aic:.2f}, MAE: {mae:.5f}, RMSE: {rmse:.5f}, MASE: {mase:.5f}, MAPE: {mape:.2f}%")

# print(f"\nBest order based on MAE: {best_params[:3]}, Best seasonal order: {best_params[3:]}, Lowest MAE: {best_metric:.5f}")

# Train the best SARIMAX Model
best_model = SARIMAX(y_train, exog=X_train, order=(3,2,3), seasonal_order=(3,1,3,4))
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
plt.title("Farmgate Price Forecast with Optimized SARIMAX (experimental)")
plt.show()






















#######################################




# import numpy as np
# import pandas as pd
# import matplotlib.pyplot as plt
# import itertools
# from statsmodels.tsa.statespace.sarimax import SARIMAX
# from sklearn.metrics import mean_absolute_error, mean_squared_error

# # Load dataset
# data = pd.read_csv("arabicacsv2.csv", parse_dates=["Date"], index_col="Date")

# data["Date"] = pd.to_datetime(data["Date"], infer_datetime_format=True)
# data = data.set_index(["Date"])

# # Differencing Farmgate_Price for seasonality
# data["Farmgate_Price_diff"] = data['Farmgate_Price'].diff(periods=4)
# data['Farmgate_Price_diff'].fillna(method='backfill', inplace=True)


# # Decompose series
# result = seasonal_decompose(data["Farmgate_Price"], model='multiplicative', period=4)
# trend = result.trend.dropna()
# seasonal = result.seasonal.dropna()
# residual = result.resid.dropna()

# # Plot decomposed components
# # plt.figure(figsize=(6, 6))
# # plt.subplot(4, 1, 1)
# # plt.plot(data['Farmgate_Price'], label='Original Series')
# # plt.legend()
# # plt.subplot(4, 1, 2)
# # plt.plot(trend, label='Trend')
# # plt.legend()
# # plt.subplot(4, 1, 3)
# # plt.plot(seasonal, label='Seasonal')
# # plt.legend()
# # plt.subplot(4, 1, 4)
# # plt.plot(residual, label='Residuals')
# # plt.legend()
# # plt.tight_layout()
# # plt.show()

# # Create month index
# data['month_index'] = data.index.month

# # Split data into train and test set
# train_data = data[:int(0.8 * len(data))]
# test_data = data[int(0.8 * len(data)):]

# # Fit SARIMAX model
# SARIMAX_model = pm.auto_arima(data[['Farmgate_Price']], exogenous=data[['month_index', 'Production_Cost', 'Net_Return', 'Volume_Of_Production']],
#                               start_p=1, start_q=1,
#                               test='adf',
#                               max_p=3, max_q=3, m=12,
#                               start_P=0, seasonal=True,
#                               d=None, D=1,
#                               trace=False,
#                               error_action='ignore',
#                               suppress_warnings=True,
#                               stepwise=True)

# y_test = test_data['Farmgate_Price']
# y_pred = SARIMAX_model.predict(n_periods=len(y_test), exogenous=test_data[['month_index', 'Production_Cost', 'Net_Return', 'Volume_Of_Production']])

# # Calculate metrics
# mae = mean_absolute_error(y_test, y_pred)
# rmse = np.sqrt(mean_squared_error(y_test, y_pred))
# mase = np.mean(np.abs(y_test - y_pred) / np.mean(np.abs(y_test - y_test.shift(1))))
# mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

# # Display results
# print(f"MAE: {mae}")
# print(f"RMSE: {rmse}")
# print(f"MASE: {mase}")
# print(f"MAPE: {mape}")

# # Forecasting function
# def sarimax_forecast(SARIMAX_model, periods=24):
#     n_periods = periods

#     forecasted_value_for_production_cost = data['Production_Cost'].iloc[-1]  # Use the last known value for the forecast
#     forecasted_value_for_net_return = data['Net_Return'].iloc[-1]            # Use the last known value for the forecast
#     forecasted_value_for_volume = data['Volume_Of_Production'].iloc[-1]

#     future_production_costs = [forecasted_value_for_production_cost] * periods
#     future_net_returns = [forecasted_value_for_net_return] * periods
#     future_volumes = [forecasted_value_for_volume] * periods
#     forecast_df = pd.DataFrame({"month_index": pd.date_range(data.index[-1], periods=n_periods, freq='MS').month,
#                                 "Production_Cost": future_production_costs,  # Future values
#                                 "Net_Return": future_net_returns,              # Future values
#                                 "Volume_Of_Production": future_volumes},      # Future values
#                                index=pd.date_range(data.index[-1] + pd.DateOffset(months=1), periods=n_periods, freq='MS'))

#     fitted, confint = SARIMAX_model.predict(n_periods=n_periods,
#                                             return_conf_int=True,
#                                             exogenous=forecast_df[['month_index', 'Production_Cost', 'Net_Return', 'Volume_Of_Production']])
    
#     index_of_fc = pd.date_range(data.index[-1] + pd.DateOffset(months=1), periods=n_periods, freq='MS')

#     fitted_series = pd.Series(fitted, index=index_of_fc)
#     lower_series = pd.Series(confint[:, 0], index=index_of_fc)
#     upper_series = pd.Series(confint[:, 1], index=index_of_fc)

#     # Plot
#     plt.figure(figsize=(15, 7))
#     plt.plot(data["Farmgate_Price"], color='#1f76b4')
#     plt.plot(fitted_series, color='darkgreen')
#     plt.fill_between(lower_series.index, lower_series, upper_series, color='k', alpha=.15)
#     plt.title("SARIMAX - Forecast of Farmgate Price")
#     plt.show()

# # Example: Forecasting for the next 24 periods
# sarimax_forecast(SARIMAX_model, periods=24)


# # # Define target variable (Farmgate Price) and exogenous features
# # y = data["Farmgate_Price"]
# # X = data[["Production_Cost","Net_Return", "Volume_Of_Production", "Inflation"]]

# # # Split into training and testing
# # train_size = int(len(y) * 0.8)  # 80% train, 20% test
# # y_train, y_test = y[:train_size], y[train_size:]
# # X_train, X_test = X[:train_size], X[train_size:]

# # # ---- 🔍 Auto-Tune SARIMAX Order ----




# # # Train SARIMAX Model
# # model = SARIMAX(y_train, exog=X_train, order=(1, 1, 1), seasonal_order=(1, 1, 1, 4))
# # result = model.fit()

# # # Forecast with exogenous variables
# # forecast = result.predict(start=len(y_train), end=len(y)-1, exog=X_test)

# # # Compute Error Metrics
# # mae = mean_absolute_error(y_test, forecast)
# # rmse = np.sqrt(mean_squared_error(y_test, forecast))

# # # Compute MASE
# # naive_forecast = np.abs(np.diff(y_test)).mean()
# # mase = mae / naive_forecast

# # # Compute MAPE
# # mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100

# # print(f"MAE: {mae}")
# # print(f"RMSE: {rmse}")
# # print(f"MASE: {mase}")
# # print(f"MAPE: {mape:.2f}%")

# # # Plot Results
# # plt.figure(figsize=(10, 5))
# # plt.plot(y_test.index, y_test, label="Actual", color="blue")
# # plt.plot(y_test.index, forecast, label="Forecast", color="red", linestyle="dashed")
# # plt.legend()
# # plt.title("Farmgate Price Forecast with SARIMAX EXPERIMENTAL")
# # plt.show()