# Trading Analysis Pro

React + TypeScript trading analysis dashboard with TradingView, SMC/ICT/CRT analysis, market news, risk management, paper trading, and a Gemini 2.5 Flash AI bridge.

## Stack

- React + Vite + TypeScript + Tailwind
- TradingView chart/Pine alerts
- Python FastAPI backend on Render
- Gemini 2.5 Flash for AI confirmation
- MT5 signal polling endpoint
- Deterministic local SMC/ICT/CRT engine remains available as a fallback

## AI flow

TradingView chart -> `/webhook/tradingview` -> Gemini 2.5 Flash -> BUY/SELL/WAIT -> `/api/mt5/signal` -> MT5 EA.

The backend keeps the Gemini API key server-side. Never put `GEMINI_API_KEY` in React or Pine Script.

## Render

The Render service should use:

```text
Build: pip install -r mcp_server/requirements.txt
Start: uvicorn mcp_server.server:app --host 0.0.0.0 --port $PORT
Health: /health
```

Required Render environment variables:

```text
GEMINI_API_KEY=<your Gemini API key>
GEMINI_MODEL=gemini-2.5-flash
AI_MIN_CONFIDENCE=75
TRADINGVIEW_WEBHOOK_SECRET=<your secret>
MT5_API_SECRET=<your secret>
```

## TradingView

Open `ai_scalper.pine` in TradingView Pine Editor. Add it to the chart, then create an alert using the script. Use the Render webhook URL:

```text
https://trading-analysis-mcp.onrender.com/webhook/tradingview
```

The webhook payload includes the current chart values and M5/M15 context. The backend asks Gemini for a structured signal.

## MT5

The backend exposes:

```text
GET https://trading-analysis-mcp.onrender.com/api/mt5/signal
```

Send `X-API-Key: <MT5_API_SECRET>` when the secret is configured. The EA should validate symbol, spread, confidence, SL/TP direction, risk/reward and position limits before execution.

## Local development

```bash
npm install
npm run dev
```

Backend:

```bash
pip install -r mcp_server/requirements.txt
uvicorn mcp_server.server:app --reload --port 8000
```

## Security

The Gemini key supplied in chat has been exposed and should be revoked/rotated in Google AI Studio before production use. Add the replacement only as a Render environment secret; do not commit it to GitHub.
