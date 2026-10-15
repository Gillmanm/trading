# Trading Analysis Pro (React Edition)

Advanced institutional trading analysis dashboard built with React, TypeScript, Vite, and Tailwind CSS. Features Smart Money Concepts (SMC), Inner Circle Trader (ICT), Candle Range Theory (CRT), deterministic quantitative signal engine, live interactive TradingView chart, risk management calculations, news filters, and paper trade execution.

## Features

- **Interactive Live Chart**: Full integration with the TradingView widget supporting multi-timeframe navigation (`5m`, `15m`, `1H`, `4H`, `1D`) with an adaptive canvas fallback.
- **Deterministic SMC / ICT Structure**: Real-time evaluation of:
  - Break of Structure (BOS)
  - Order Blocks (OB)
  - Fair Value Gaps (FVG)
  - Liquidity Sweeps (Buy-side / Sell-side)
  - Change of Character (MSS / CHoCH)
  - Optimal Trade Entry (OTE Discount vs. Premium zones 61.8%–79%)
- **CRT & Price Action Model**: Candle Range Theory expansion/contraction cycles, manipulation (Judas swings), and engulfing/pin-bar pattern scans.
- **Signal Engine**: Deterministic Entry, Stop Loss, Take Profit 1 (1.5R), Take Profit 2 (2.5R), and multi-factor confluence scoring.
- **Risk Manager**: Account balance position sizing based on strict risk-of-ruin protocols (0.5%–2.0%).
- **Paper Trading Ledger**: In-app execution and PnL simulation with persistent storage.
- **Market News Intelligence**: High-impact news event monitoring and volatility adjustment.
- **Pine Script v6**: Embedded Pine Script strategy for TradingView alerts and webhooks.

## Development

```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Build for production
npm run build
```
