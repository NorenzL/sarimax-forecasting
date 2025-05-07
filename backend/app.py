from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import io
import base64
from statsmodels.tsa.arima.model import ARIMA
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
        #future_result = run_future_forecast(merged_df)
       
        return jsonify(result)
        # return jsonify({
        #     'result': result,
        #     'future_result': future_result
        # })
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
            result = model.fit()
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
        
        # Run models
        control_result = fit_sarimax(y_train, y_test, X_control_train, X_control_test, control_order, control_seasonal_order, "Control")
        experimental_result = fit_sarimax(y_train, y_test, X_experimental_train, X_experimental_test, experimental_order, experimental_seasonal_order, "Experimental")

                # =================== ADDITIONAL FUTURE FORECAST ===================
        def future_forecast(x_price, exog_vars, exog_columns, order, seasonal_order, label):
            # Fit models for each exogenous variable
            exog_vars_subset = exog_vars[exog_columns]
            exog_forecasts = {}
            forecast_steps = 8
            last_date = exog_vars.index[-1]
            future_dates = pd.date_range(start=last_date + pd.offsets.QuarterBegin(), periods=forecast_steps, freq='Q')

            for col in exog_columns:
                if col == 'Inflation rate':
                    model = ARIMA(exog_vars[col], order=(4, 0, 2))
                elif col == 'Production Volume':
                    model = SARIMAX(exog_vars[col], order=(0, 0, 0), seasonal_order=(1, 0, 2, 4))
                elif col == 'Production Cost':
                    model = SARIMAX(exog_vars[col], order=(0, 2, 2), seasonal_order=(2, 0, 1, 4))
                elif col == 'Net Return':
                    model = SARIMAX(exog_vars[col], order=(3, 0, 1), seasonal_order=(3, 2, 3, 4))
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

            # Fit SARIMAX for Farmgate Price
            model_price = SARIMAX(x_price, exog=exog_vars_subset, order=order, seasonal_order=seasonal_order)
            result_price = model_price.fit()

            # Forecast Farmgate Price
            forecast_price = result_price.forecast(steps=forecast_steps, exog=exog_forecast_df)

            # DEBUG PRINT: Farmgate Price forecast values
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

            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            plt.close(fig)
            buf.seek(0)
            image_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
            buf.close()

            return {
                'forecast_dates': future_dates.strftime('%Y-%m-%d').tolist(),
                'forecast_values': forecast_price.tolist(),
                'plot': image_base64
            }

        # Run future forecasts
        control_future_result = future_forecast(
            y,
            exog_control,
            ['Production Volume', 'Production Cost', 'Net Return'],
            control_order,
            control_seasonal_order,
            'Control'
        )

        experimental_future_result = future_forecast(
            y,
            exog_experimental,
            ['Inflation rate','Production Volume', 'Production Cost', 'Net Return'],
            experimental_order,
            experimental_seasonal_order,
            'Experimental'
        )

        return {
            'control_model': control_result,
            'experimental_model': experimental_result,
            'control_future_forecast': control_future_result,
            'experimental_future_forecast': experimental_future_result
        }

    except Exception as e:
        return {'error': str(e)}

if __name__ == '__main__':
    app.run(debug=True, port=5001)
