from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import gc
from statsmodels.tsa.arima.model import ARIMA
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.stattools import grangercausalitytests
from sklearn.metrics import mean_absolute_error, mean_squared_error
from functools import reduce
import os
import json
from datetime import datetime


app = Flask(__name__)
CORS(app)

@app.route('/forecast', methods=['POST'])
def forecast():
    try:
        # get coffee type from form
        coffee_type = request.form.get('type')

        print(f"Received type: {coffee_type}")
        print(f"Received files: {list(request.files.keys())}")
        if not coffee_type:
            return jsonify({'error': 'Missing coffee type'}), 400

        coffee_settings = {
            'Arabica': {
                'farmgate': f"{coffee_type} Farmgate Price",
                'volume': f"{coffee_type} Production Volume",
                'control_order': (4, 2, 4),
                'control_seasonal': (0, 1, 0, 4),
                'experimental_order': (3, 2, 3),
                'experimental_seasonal': (3, 1, 3, 4),
                'volume_order': (0, 0, 0),
                'volume_seasonal': (1, 0, 2, 4)
            },
            'Excelsa': {
                'farmgate': f"{coffee_type} Farmgate Price",
                'volume': f"{coffee_type} Production Volume",
                'control_order': (2, 2, 1),
                'control_seasonal': (0, 0, 4, 4),
                'experimental_order': (3, 0, 3),
                'experimental_seasonal': (4, 0, 4, 4),
                'volume_order': (3, 0, 2),
                'volume_seasonal': (0, 1, 4, 4)
            },
            'Robusta': {
                'farmgate': f"{coffee_type} Farmgate Price",
                'volume': f"{coffee_type} Production Volume",
                'control_order': (2, 0, 0),
                'control_seasonal': (1, 0, 2, 4),
                'experimental_order': (0, 2, 3),
                'experimental_seasonal': (4, 1, 4, 4),
                'volume_order': (0, 0, 2),
                'volume_seasonal': (4, 0, 1, 4)
            }
            
        }

        # required files identification
        required_files = [
            f"{coffee_type} Farmgate Price",
            f"{coffee_type} Production Volume",
            "Inflation rate",
            "Net Return",
            "Production Cost"
        ]

        uploaded_files = {}
        missing_files = []

        for file_key in required_files:
            uploaded_file = request.files.get(file_key)
            if not uploaded_file:
                missing_files.append(file_key)
            else:
                uploaded_files[file_key] = uploaded_file

        if missing_files:
            return jsonify({'error': f'Missing files: {missing_files}'}), 400

        # file format checker
        dfs = []
        for key, file in uploaded_files.items():
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.filename.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
            else:
                return jsonify({'error': f'Unsupported file format for {key}'}), 400
            dfs.append(df)

        # Merge data using "date" column
        merged_df = reduce(lambda left, right: pd.merge(left, right, on='date', how='outer'), dfs)

        print("Merged DataFrame:")
        print(merged_df)


        # forecast Call
        result = run_forecast(merged_df, coffee_type, coffee_settings)


        # Record result data
        save_to_history(result)
        return jsonify(result)
    
    
    except Exception as e:
        print(f"Exception occurred: {e}")
        return jsonify({'error': str(e)}), 500
    
def run_forecast(merged_df, coffee_type, coffee_settings):
    try:
        # Check date column if date
        merged_df['date'] = pd.to_datetime(merged_df['date'])
        merged_df = merged_df.sort_values('date')
        merged_df = merged_df.set_index('date')

        granger_df = merged_df[['Farmgate Price', 'Inflation rate']].dropna()
        max_lag = 4 

        print("\n[INFO] Running Granger Causality Test (Inflation rate → Farmgate Price)...")
        granger_result = grangercausalitytests(granger_df[['Farmgate Price', 'Inflation rate']], maxlag=max_lag, verbose=False)

        # Extract p-values
        granger_pvalues = {f'lag {lag}': round(res[0]['ssr_ftest'][1], 4) for lag, res in granger_result.items()}

        print("[INFO] Granger causality test p-values:")
        for lag, pval in granger_pvalues.items():
            print(f"{lag}: {pval}")


        # Target variable
        y = merged_df['Farmgate Price']

        # exog variables
        exog_control = merged_df[['Production Cost', 'Net Return', 'Production Volume']]
        exog_experimental = merged_df[['Production Cost', 'Net Return', 'Production Volume', 'Inflation rate']]

        # 80/20 train-test split
        train_size = int(len(y) * 0.8)
        y_train, y_test = y[:train_size], y[train_size:]
        X_control_train, X_control_test = exog_control[:train_size], exog_control[train_size:]
        X_experimental_train, X_experimental_test = exog_experimental[:train_size], exog_experimental[train_size:]

        # Define parameters
        coffee_config = coffee_settings[coffee_type]
        control_order = coffee_config['control_order']
        control_seasonal_order = coffee_config['control_seasonal']
        experimental_order = coffee_config['experimental_order']
        experimental_seasonal_order = coffee_config['experimental_seasonal']
        volume_order = coffee_config['volume_order']
        volume_seasonal = coffee_config['volume_seasonal']

        # forecast function
        def fit_sarimax(y_train, y_test, X_train, X_test, order, seasonal_order, label):
            model = SARIMAX(y_train, exog=X_train, order=order, seasonal_order=seasonal_order)
            result = model.fit()
            forecast = result.predict(start=len(y_train), end=len(y_train)+len(y_test)-1, exog=X_test)

            # metric eval
            mae = mean_absolute_error(y_test, forecast)
            rmse = np.sqrt(mean_squared_error(y_test, forecast))
            naive_forecast = np.abs(np.diff(y_test)).mean() if len(y_test) > 1 else 1
            mase = mae / naive_forecast if naive_forecast != 0 else None
            mape = np.mean(np.abs((y_test - forecast) / y_test)) * 100

            # Plot
            fig, ax = plt.subplots(figsize=(10,5))
            fig.patch.set_facecolor('#F1F0E2')
            ax.set_facecolor('#F1F0E2')  
            ax.plot(y_test.index, y_test, label='Actual', color='blue')
            ax.plot(y_test.index, forecast, label='Forecast', color='red', linestyle='dashed')
            ax.set_title(f'{label} - Farmgate Price Forecast')
            ax.legend()

            plt.close(fig)

            
            return {
                'AIC': result.aic,
                'MAE': mae,
                'RMSE': rmse,
                'MASE': mase,
                'MAPE': mape,
                'forecast_dates': y_test.index.strftime('%Y-%m-%d').tolist(),
                'actual_values': y_test.tolist(),
                'forecast_values': forecast.tolist(),  
            }
        
        # forecast call
        control_result = fit_sarimax(y_train, y_test, X_control_train, X_control_test, control_order, control_seasonal_order, "Control")
        experimental_result = fit_sarimax(y_train, y_test, X_experimental_train, X_experimental_test, experimental_order, experimental_seasonal_order, "Experimental")

        
        def future_forecast(x_price, exog_vars, exog_columns, order, seasonal_order, volume_order, volume_seasonal, label):
            # Fit models for each exogenous variable
            exog_vars_subset = exog_vars[exog_columns]
            exog_forecasts = {}
            forecast_steps = 8 # time frame 
            last_date = exog_vars.index[-1]
            future_dates = pd.date_range(start=last_date + pd.offsets.QuarterBegin(), periods=forecast_steps, freq='Q')

            for col in exog_columns:
                if col == 'Inflation rate':
                    model = ARIMA(exog_vars[col], order=(4, 0, 2))
                elif col == 'Production Volume':
                    model = SARIMAX(exog_vars[col], order=volume_order, seasonal_order=volume_seasonal)
                elif col == 'Production Cost':
                    model = ARIMA(exog_vars[col], order=(4, 1, 1))
                elif col == 'Net Return':
                    model = ARIMA(exog_vars[col], order=(3, 2, 4))
                else:
                    raise ValueError(f"Unknown column '{col}' for modeling.")
                result = model.fit()
                forecast = result.forecast(steps=forecast_steps)
                exog_forecasts[col] = forecast

            # Combine future exog forecasts into DataFrame
            exog_forecast_df = pd.concat([exog_forecasts[col] for col in exog_columns], axis=1)
            exog_forecast_df.columns = exog_columns
            exog_forecast_df.index = future_dates

            print("\n[INFO] Exogenous variables used for price forecast:")
            print(exog_forecast_df.columns.tolist())

            print("\n[INFO] Forecasted values for exogenous variables:")
            print(exog_forecast_df)

            # model fitting
            model_price = SARIMAX(x_price, exog=exog_vars_subset, order=order, seasonal_order=seasonal_order)
            result_price = model_price.fit()

            # Forecast Farmgate Price
            forecast_price = result_price.forecast(steps=forecast_steps, exog=exog_forecast_df)

            
            print("\n[INFO] Forecasted Farmgate Prices:")
            for date, value in zip(future_dates, forecast_price):
                print(f"{date.strftime('%Y-%m-%d')}: {value:.2f}")

            # Plot
            fig, ax = plt.subplots(figsize=(10, 5))
            fig.patch.set_facecolor('#F1F0E2')
            ax.set_facecolor('#F1F0E2')
            ax.plot(x_price.index, x_price, label='Historical Farmgate Price', color='blue')
            ax.plot(future_dates, forecast_price, label='Forecasted Farmgate Price (Future)', color='green', linestyle='dashed')
            ax.set_title(f'{label} - 2-Year Forecast')
            ax.legend()

            return {
                'forecast_dates': future_dates.strftime('%Y-%m-%d').tolist(),
                'forecast_values': forecast_price.tolist()
            }

        # Run future forecasts
        control_future_result = future_forecast(
            y,
            exog_control,
            ['Production Volume', 'Production Cost', 'Net Return'],
            control_order,
            control_seasonal_order,
            volume_order,
            volume_seasonal,
            'Control', 
        )

        experimental_future_result = future_forecast(
            y,
            exog_experimental,
            ['Inflation rate','Production Volume', 'Production Cost', 'Net Return'],
            experimental_order,
            experimental_seasonal_order,
            volume_order,
            volume_seasonal,
            'Experimental',
        )

        gc.collect()

        return {
            'control_model': control_result,
            'experimental_model': experimental_result,
            'control_future_forecast': control_future_result,
            'experimental_future_forecast': experimental_future_result,
            'granger_causality_pvalues': granger_pvalues,
            'coffee_type': coffee_type,
            'granger_pvalues': granger_pvalues,
        }  

    except Exception as e:
        return {'error': str(e)}

def save_to_history(result):
    history_file = 'forecast_history.json'
    try:
        if os.path.exists(history_file):
            with open(history_file, 'r') as f:
                history = json.load(f)
        else:
            history = []

        result['timestamp'] = datetime.now().isoformat()
        history.append(result)

        with open(history_file, 'w') as f:
            json.dump(history, f, indent=4)
    except Exception as e:
        print(f"[ERROR] Saving history failed: {e}")

@app.route('/api/history', methods=['GET'])
def get_forecast_history():
    history_file = 'forecast_history.json'
    try:
        if os.path.exists(history_file):
            with open(history_file, 'r') as f:
                history = json.load(f)
        else:
            history = []
        return jsonify(history)
    except Exception as e:
        print(f"[ERROR] Reading history failed: {e}")
        return jsonify({"error": "Failed to load history"}), 500
    
if __name__ == '__main__':
    app.run(debug=True, port=5001)
