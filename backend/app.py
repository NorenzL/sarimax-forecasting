from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
from statsmodels.tsa.statespace.sarimax import SARIMAX
from sklearn.metrics import mean_absolute_error, mean_squared_error
from functools import reduce


app = Flask(__name__)
CORS(app)

@app.route('/forecast', methods=['POST'])
def forecast():
    try:
        # ✅ Get coffee type from form data
        coffee_type = request.form.get('type')

        print(f"Received type: {coffee_type}")
        print(f"Received files: {list(request.files.keys())}")
        if not coffee_type:
            return jsonify({'error': 'Missing coffee type'}), 400

        # ✅ Dynamically build required file keys
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

        # ✅ Read files into dataframes
        dfs = []
        for key, file in uploaded_files.items():
            if file.filename.endswith('.csv'):
                df = pd.read_csv(file)
            elif file.filename.endswith(('.xls', '.xlsx')):
                df = pd.read_excel(file)
            else:
                return jsonify({'error': f'Unsupported file format for {key}'}), 400
            dfs.append(df)

        # ✅ Merge dataframes on 'date'
        merged_df = reduce(lambda left, right: pd.merge(left, right, on='date', how='outer'), dfs)

        print("Merged DataFrame:")
        print(merged_df)

        # ✅ Call your forecast logic
        result = run_forecast(merged_df)

        return jsonify(result)
    except Exception as e:
        print(f"Exception occurred: {e}")
        return jsonify({'error': str(e)}), 500
    
def run_forecast(merged_df):
    try:
        # Ensure 'date' column is datetime and set as index
        merged_df['date'] = pd.to_datetime(merged_df['date'])
        merged_df = merged_df.sort_values('date')
        merged_df = merged_df.set_index('date')

        # Define target variable
        y = merged_df['Farmgate Price']

        # Define exogenous variables
        exog_control = merged_df[['Production Cost', 'Net Return', 'Production Volume']]
        exog_experimental = merged_df[['Production Cost', 'Net Return', 'Production Volume', 'Inflation rate']]

        # Split into training and testing sets
        train_size = int(len(y) * 0.8)
        y_train, y_test = y[:train_size], y[train_size:]
        X_control_train, X_control_test = exog_control[:train_size], exog_control[train_size:]
        X_experimental_train, X_experimental_test = exog_experimental[:train_size], exog_experimental[train_size:]

        # Define SARIMAX parameters
        control_order = (4, 2, 4)
        control_seasonal_order = (0, 1, 0, 4)
        experimental_order = (3, 2, 3)
        experimental_seasonal_order = (3, 1, 3, 4)

        # Function to fit and evaluate SARIMAX
        def fit_sarimax(y_train, y_test, X_train, X_test, order, seasonal_order, label):
            model = SARIMAX(y_train, exog=X_train, order=order, seasonal_order=seasonal_order)
            result = model.fit(disp=False)
            forecast = result.predict(start=len(y_train), end=len(y_train)+len(y_test)-1, exog=X_test)

            # Compute metrics
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

            # Save plot to in-memory buffer
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            plt.close(fig)
            buf.seek(0)
            image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            buf.close()

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
        
        # # ---------- FUTURE FORECASTING ----------
        # # Fit SARIMAX on full data
        # control_model_full = SARIMAX(y, exog=exog_control, order=control_order, seasonal_order=control_seasonal_order)
        # control_fit_full = control_model_full.fit(disp=False)

        # experimental_model_full = SARIMAX(y, exog=exog_experimental, order=experimental_order, seasonal_order=experimental_seasonal_order)
        # experimental_fit_full = experimental_model_full.fit(disp=False)

        # # Forecast exogenous variables for next 8 steps (2 years = 8 quarters)
        # # For simplicity → we can carry forward last values or set as mean for now
        # future_exog_control = pd.DataFrame({
        #     'Production Cost': [exog_control['Production Cost'].iloc[-1]] * 8,
        #     'Net Return': [exog_control['Net Return'].iloc[-1]] * 8,
        #     'Production Volume': [exog_control['Production Volume'].iloc[-1]] * 8
        # })

        # future_exog_experimental = future_exog_control.copy()
        # future_exog_experimental['Inflation rate'] = [exog_experimental['Inflation rate'].iloc[-1]] * 8

        # # Future index
        # future_dates = pd.date_range(start=y.index[-1] + pd.offsets.QuarterEnd(), periods=8, freq='Q')

        # # Forecast farmgate price for next 2 years
        # control_future_forecast = control_fit_full.forecast(steps=8, exog=future_exog_control)
        # experimental_future_forecast = experimental_fit_full.forecast(steps=8, exog=future_exog_experimental)

        # def plot_future_forecast(forecast_values, forecast_dates, label):
        #     fig, ax = plt.subplots(figsize=(10,5))
        #     fig.patch.set_facecolor('#F1F0E2')
        #     ax.set_facecolor('#F1F0E2')
        #     ax.plot(y.index, y, label='Historical', color='blue')
        #     ax.plot(forecast_dates, forecast_values, label='Forecast', color='red', linestyle='dashed')
        #     ax.set_title(f'{label} - 2-Year Forecast (Future)')
        #     ax.legend()

        #     buf = io.BytesIO()
        #     plt.savefig(buf, format='png')
        #     plt.close(fig)
        #     buf.seek(0)
        #     image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
        #     buf.close()
        #     return image_base64
        
        # control_future_plot = plot_future_forecast(control_future_forecast, future_dates, "Control")
        # experimental_future_plot = plot_future_forecast(experimental_future_forecast, future_dates, "Experimental")

        # # Append future results
        # control_result['future_forecast_dates'] = future_dates.strftime('%Y-%m-%d').tolist()
        # control_result['future_forecast_values'] = control_future_forecast.tolist()
        # control_result['future_forecast_plot'] = control_future_plot

        # experimental_result['future_forecast_dates'] = future_dates.strftime('%Y-%m-%d').tolist()
        # experimental_result['future_forecast_values'] = experimental_future_forecast.tolist()
        # experimental_result['future_forecast_plot'] = experimental_future_plot


        
        # Run models
        control_result = fit_sarimax(y_train, y_test, X_control_train, X_control_test, control_order, control_seasonal_order, "Control")
        experimental_result = fit_sarimax(y_train, y_test, X_experimental_train, X_experimental_test, experimental_order, experimental_seasonal_order, "Experimental")

        return {
            'control_model': control_result,
            'experimental_model': experimental_result
        }

    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    app.run(debug=True, port=5001)
