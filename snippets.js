// C:\Users\iswas\.gemini\antigravity\scratch\quant-tracker\snippets.js

window.QUANT_SNIPPETS = [
  {
    id: "fetch-data",
    title: "Fetch Historical Market Data",
    description: "Download stock price history from Yahoo Finance, calculate daily log returns, and inspect data structures.",
    libraries: ["yfinance", "pandas", "numpy"],
    code: `import yfinance as yf
import pandas as pd
import numpy as np

# Define the ticker symbol and the date range
ticker_symbol = "AAPL"
start_date = "2023-01-01"
end_date = "2023-12-31"

# Fetch historical data
print(f"Fetching data for {ticker_symbol}...")
data = yf.download(ticker_symbol, start=start_date, end=end_date)

# Keep only 'Close' and 'Volume' columns
data = data[['Close', 'Volume']]

# Calculate daily log returns
data['Log_Return'] = np.log(data['Close'] / data['Close'].shift(1))

# Drop NaN values (first row will be NaN after shift)
data.dropna(inplace=True)

# Display the first few rows
print("\\nFirst 5 rows of data:")
print(data.head())

# Output summary statistics
print("\\nSummary Statistics:")
print(data.describe())
`
  },
  {
    id: "sharpe-ratio",
    title: "Calculate Portfolio Sharpe Ratio",
    description: "Compute the annualized Sharpe Ratio for an asset or portfolio given a risk-free rate of return.",
    libraries: ["yfinance", "pandas", "numpy"],
    code: `import yfinance as yf
import pandas as pd
import numpy as np

# Fetch historical prices for a diversified portfolio
tickers = ["AAPL", "MSFT", "GOOGL", "AMZN"]
data = yf.download(tickers, start="2023-01-01", end="2023-12-31")['Close']

# Calculate daily simple returns
returns = data.pct_change().dropna()

# Equal portfolio weights
weights = np.array([0.25, 0.25, 0.25, 0.25])

# Calculate portfolio returns
portfolio_returns = returns.dot(weights)

# Parameters
risk_free_rate = 0.04  # 4% annual risk-free rate (e.g. Treasury Yields)
trading_days = 252

# Annualize returns and volatility
mean_daily_return = portfolio_returns.mean()
daily_volatility = portfolio_returns.std()

annualized_return = mean_daily_return * trading_days
annualized_volatility = daily_volatility * np.sqrt(trading_days)

# Calculate Sharpe Ratio
daily_risk_free = risk_free_rate / trading_days
excess_returns = portfolio_returns - daily_risk_free
sharpe_ratio = (excess_returns.mean() / excess_returns.std()) * np.sqrt(trading_days)

print(f"Annualized Portfolio Return: {annualized_return:.2%}")
print(f"Annualized Portfolio Volatility: {annualized_volatility:.2%}")
print(f"Calculated Sharpe Ratio: {sharpe_ratio:.3f}")
`
  },
  {
    id: "sma-crossover",
    title: "SMA Crossover Backtesting",
    description: "A vectorized backtest for a Simple Moving Average (SMA) crossover trading strategy.",
    libraries: ["yfinance", "pandas", "numpy", "matplotlib"],
    code: `import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Download historical data for SPY (S&P 500 ETF)
ticker = "SPY"
df = yf.download(ticker, start="2020-01-01", end="2023-12-31")['Close'].to_frame()

# Define short and long window moving averages
df['SMA_Fast'] = df['Close'].rolling(window=20).mean()
df['SMA_Slow'] = df['Close'].rolling(window=50).mean()

df.dropna(inplace=True)

# Generate buy/sell signals
# 1 when fast SMA > slow SMA (Buy/Hold), -1 or 0 otherwise (Sell/Short)
df['Signal'] = np.where(df['SMA_Fast'] > df['SMA_Slow'], 1, 0)

# Calculate daily asset log returns
df['Market_Returns'] = np.log(df['Close'] / df['Close'].shift(1))

# Strategy returns: signal from previous day determines returns of current day
df['Strategy_Returns'] = df['Market_Returns'] * df['Signal'].shift(1)
df.dropna(inplace=True)

# Compute cumulative returns
df['Cum_Market_Returns'] = df['Market_Returns'].cumsum().apply(np.exp) - 1
df['Cum_Strategy_Returns'] = df['Strategy_Returns'].cumsum().apply(np.exp) - 1

# Performance results
final_market = df['Cum_Market_Returns'].iloc[-1]
final_strategy = df['Cum_Strategy_Returns'].iloc[-1]

print(f"Buy and Hold Cumulative Return: {final_market:.2%}")
print(f"SMA Crossover Cumulative Return: {final_strategy:.2%}")

# Optional: Plot the performance comparison
# plt.figure(figsize=(12, 6))
# plt.plot(df['Cum_Market_Returns'], label='S&P 500 (Buy & Hold)', color='gray')
# plt.plot(df['Cum_Strategy_Returns'], label='20/50 SMA Crossover Strategy', color='emerald')
# plt.title('Strategy vs. Buy & Hold')
# plt.legend()
# plt.show()
`
  },
  {
    id: "bollinger-bands",
    title: "Calculate and Plot Bollinger Bands",
    description: "Generate Bollinger Bands, which are key volatility indicators placed above and below a moving average.",
    libraries: ["yfinance", "pandas", "numpy", "matplotlib"],
    code: `import yfinance as yf
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

# Download stock prices
ticker = "MSFT"
df = yf.download(ticker, start="2023-06-01", end="2023-12-31")['Close'].to_frame()

# Parameters
window = 20
num_std = 2

# Calculate Simple Moving Average (Middle Band)
df['Middle_Band'] = df['Close'].rolling(window=window).mean()

# Calculate Rolling Standard Deviation
df['STD'] = df['Close'].rolling(window=window).std()

# Upper and Lower Bands
df['Upper_Band'] = df['Middle_Band'] + (df['STD'] * num_std)
df['Lower_Band'] = df['Middle_Band'] - (df['STD'] * num_std)

df.dropna(inplace=True)

print("Bollinger Bands statistics:")
print(df[['Close', 'Lower_Band', 'Middle_Band', 'Upper_Band']].tail())

# Helper: Show how to plot them in matplotlib
# plt.figure(figsize=(14, 7))
# plt.plot(df['Close'], label='Share Price', color='white', alpha=0.9)
# plt.plot(df['Middle_Band'], label='20-day SMA', color='orange', linestyle='--')
# plt.plot(df['Upper_Band'], label='Upper Band (+2 STD)', color='red', alpha=0.5)
# plt.plot(df['Lower_Band'], label='Lower Band (-2 STD)', color='green', alpha=0.5)
# plt.fill_between(df.index, df['Lower_Band'], df['Upper_Band'], color='gray', alpha=0.1)
# plt.title(f'{ticker} Bollinger Bands')
# plt.legend()
# plt.grid(True, alpha=0.1)
# plt.show()
`
  }
];
