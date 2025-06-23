import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import itertools
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error
from statsmodels.tsa.stattools import adfuller
from statsmodels.tsa.seasonal import seasonal_decompose
from statsmodels.graphics.tsaplots import plot_acf
from statsmodels.graphics.tsaplots import plot_pacf

# dataset handling
data = pd.read_csv("arabicacsv3.csv")
data['Date'] = pd.PeriodIndex(data['Date'], freq='Q')
data.set_index('Date', inplace=True)
data.index = data.index.to_timestamp()

# variable to test
y = data["Net_Return"]

train_size = int(len(y) * 0.8)  # 80% train, 20% test
y_train, y_test = y[:train_size], y[train_size:]

def seasonal_decomp(y_train):
  decomposition = seasonal_decompose(y_train, model='additive', period=4)

  trend = decomposition.trend
  seasonal = decomposition.seasonal
  residual = decomposition.resid

  # Align indices to avoid mismatch after dropna
  common_index = residual.dropna().index.intersection(seasonal.dropna().index)
  residual_aligned = residual.loc[common_index]
  seasonal_aligned = seasonal.loc[common_index]

  # seasonal strength computation
  seasonal_strength = 1 - (np.var(residual_aligned) / np.var(residual_aligned + seasonal_aligned))
  seasonal_strength = max(0, seasonal_strength)  

  print(f"Seasonal Strength: {seasonal_strength:.3f}")

  # Plot the decomposed components
  decomposition.plot()
  plt.suptitle('Seasonal Decomposition of Robusta\'s Farmgate Price', fontsize=16)
  plt.tight_layout()
  plt.show()

def identify_parameter(y_train):

  # STEP 1 CHECK SEASONALITY IF MAY SPIKE SA LAG 4 = NEED SEASONAL DIFFERENCING D=1
  # Original series ACF
  plot_acf(y_train, lags=12)  # Look for spikes at lags 4, 8, 12...
  plt.title("Autocorrelation Function (ACF) Plot of Arabica Farmgate Price Before Differencing") # Change title based on variable currently being tested
  plt.show()

  #STEP 1.1 this is the step to apply seasonal differencing if needed
  # Apply seasonal differencing (lag=4)
  # seasonal_diff = y.diff(4).dropna()
  # plot_acf(seasonal_diff, lags=16)
  # plt.title("Autocorrelation Function (ACF) Plot of Arabica Farmgate Price After Seasonal Differencing") # Change title based on variable currently being tested
  # plt.show()

  #STEP 2 CHECK FOR TREND/STATIONARITY USING ADF. IF P_VALUE >= 0.05 NEED differencing d = 1

  p_value = adfuller(y_train.dropna())[1]
  print(f"ADF p-value: {p_value:.8f}")  

  if p_value > 0.05:
    y_train_diff = y_train.diff().dropna()
    print("After first order difference")

    p_value2 = adfuller(y_train_diff.dropna())[1]
    print(f"ADF p-value: {p_value2:.8f}")  
  else:
    y_train_diff = y_train.dropna()  
  

  # PACF and ACF plot. Change title if needed also change the variable dpending on seasonality check
  plot_pacf(y_train_diff, lags=12)
  plt.title("Partial Autocorrelation Function (PACF) Plot of Arabica Farmgate Price Before  Differencing")

  plot_acf(y_train_diff, lags=12)
  plt.title("Autocorrelation Function (ACF) Plot of Arabica Farmgate Price After Differencing")

  plt.show()

  # Forecast
  model = ARIMA(y_train, order=(4,1,4))
  # If SARIMAX
  # model = SARIMAX(y_train, order=(2,1,2), seasonal_order=(0,0,0,0))
  results = model.fit()

  forecast = results.predict(start=len(y_train), end=len(y)-1)

  # Compute final Error Metrics
  mae = mean_absolute_error(y_test, forecast)
  rmse = np.sqrt(mean_squared_error(y_test, forecast))
  naive_forecast = np.abs(np.diff(y_test)).mean()
  mase = mae / naive_forecast
  mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100

  print(f"\nFinal Evaluation Metrics for the Best Model:")
  print(f"AIC: {results.aic:.2f}")
  print(f"BIC: {results.bic:.2f}")
  print(f"MAE: {mae:.4f}")
  print(f"RMSE: {rmse:.4f}")
  print(f"MASE: {mase:.4f}")
  print(f"MAPE: {mape:.2f}%")

  # Plot Results
  plt.figure(figsize=(10, 5))
  plt.plot(y_test.index, y_test, label="Actual", color="blue")
  plt.plot(y_test.index, forecast, label="Forecast", color="red", linestyle="dashed")
  plt.legend()
  plt.title("Net Return Forecast")
  plt.show()

def tune_parameter(y_train, y_test):

  # Define p, d, q, P, D, Q, s (seasonality) ranges
  p = q = range(0, 2) 
  P = Q = range(0, 2)
  d = D = range(0,2)
  s = [4]  # Seasonal period of 4
      
  #Generate all possible parameter combinations
  param_combinations = list(itertools.product(p, d, q))

  # If SARIMAX
  #param_combinations = list(itertools.product(p, d, q, P, D, Q, s))

  # Grid Search for the best model based on predictive performance
  best_metric = float("inf")
  best_params = None
  results_list = []

  print("Evaluating different parameter combinations...\n")

  for params in param_combinations:
      try:
          model = ARIMA(y_train, order=params[:3])
          # if sarimax
          #model = SARIMAX(y_train, order=params[:3], seasonal_order=params[3:])
          result = model.fit()
          
          forecast = result.predict(start=len(y_train), end=len(y)-1)

          mae = mean_absolute_error(y_test, forecast)
          rmse = np.sqrt(mean_squared_error(y_test, forecast))
          naive_forecast = np.abs(np.diff(y_test)).mean()
          mase = mae / naive_forecast
          mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100
          aic = result.aic  # Still keep AIC for reference
          bic = result.bic 

          # Store results
          results_list.append((params, aic, bic, mae, rmse, mase, mape))
          print(f"Order: {params[:3]}, Seasonal Order: {params[3:]}, AIC: {aic:.2f}, MAE: {mae:.4f}, RMSE: {rmse:.4f}, MASE: {mase:.4f}, MAPE: {mape:.2f}%")
          
          
          if mae < best_metric:
              best_metric = mae
              best_params = params

      except:
          print(f"Failed to fit model for {params}")
          continue  # Ignore models that fail to converge

  # Sort results 
  results_list.sort(key=lambda x: x[3])  # Sorting based on MAE     1- aic 2-bic 3-mae

  # Display the top 10 best combinations 
  print("\nTop 10 parameter combinations based on MAE:")
  for i, (params, aic, bic, mae, rmse, mase, mape) in enumerate(results_list[:10]):
      print(f"{i+1}. Order: {params[:3]}, Seasonal Order: {params[3:]}, AIC: {aic:.2f}, BIC: {bic:.2f}, MAE: {mae:.5f}, RMSE: {rmse:.5f}, MASE: {mase:.5f}, MAPE: {mape:.2f}%")

  print(f"\nBest order based on MAE: {best_params[:3]}, Best seasonal order: {best_params[3:]}, Lowest MAE: {best_metric:.5f}")

  # Train the best ARIMA Model
  best_model = ARIMA(y_train, order=best_params[:3])

  # If SARIMAX
  #best_model = SARIMAX(y_train, order=best_params[:3])
  best_result = best_model.fit()

  # Forecast 
  forecast = best_result.predict(start=len(y_train), end=len(y)-1)

  # evaluation metrics
  mae = mean_absolute_error(y_test, forecast)
  rmse = np.sqrt(mean_squared_error(y_test, forecast))
  naive_forecast = np.abs(np.diff(y_test)).mean()
  mase = mae / naive_forecast
  mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100

  best_model_results = {
      'AIC': best_result.aic,
      'BIC': best_result.bic,
      'MAE': mae,
      'RMSE': rmse,
      'MAPE': mape,
      'MASE': mase
  }

  # Print final evaluation metrics
  print(f"\nFinal Evaluation Metrics for the Best Model:")
  print(f"AIC: {best_model_results['AIC']}")
  print(f"BIC: {best_model_results['BIC']}")
  print(f"MAE: {best_model_results['MAE']}")
  print(f"RMSE: {best_model_results['RMSE']}")
  print(f"MASE: {best_model_results['MASE']}")
  print(f"MAPE: {best_model_results['MAPE']:.2f}%")

  # Plot Results
  plt.figure(figsize=(10, 5))
  plt.plot(y_test.index, y_test, label="Actual", color="blue")
  plt.plot(y_test.index, forecast, label="Forecast", color="red", linestyle="dashed")
  plt.legend()
  plt.title("Production Cost Forecast")
  plt.show()

#identify_parameter(y_train)
tune_parameter(y_train, y_test)