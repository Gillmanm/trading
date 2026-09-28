# Trading Analysis Pro

Advanced trading-analysis dashboard with TradingView, SMC, ICT, CRT, price action, confluence, signals, risk management and news-filter UI.

## GitHub Pages
This repository contains the static frontend/demo. Production market-data, PostgreSQL, Redis, WebSocket, news and MCP services must run on a separate backend. Never put private API keys in the Pages frontend.

## Production pipeline
Market data → candle normalization → HTF structure → liquidity → SMC → ICT → CRT → price action → support/resistance → news filter → confluence → risk engine → deterministic Entry/SL/TP → REST/WebSocket → dashboard/MCP.

LLMs should explain deterministic analysis rather than invent prices or risk levels.
