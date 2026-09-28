# Trading Analysis MCP Server

This repository now contains a real Model Context Protocol server, separate from the GitHub Pages frontend.

## MCP endpoint

Production transport:
http://YOUR_HOST/mcp

Local default:
http://localhost:8000/mcp

The server uses the official MCP Python SDK v2 and Streamable HTTP.

## MCP tools

- get_market_quote
- get_market_candles
- analyze_market
- get_market_news
- scan_markets

It also exposes a market analysis resource and an explain_signal prompt.

## Live market data

Set TWELVEDATA_API_KEY in the MCP deployment environment for live OHLCV and quotes.

Set FINNHUB_API_KEY for optional news.

Never put provider secrets in index.html or other browser-side files.

## Run locally

    cd mcp_server
    python -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt

Copy .env.example to .env and add your provider keys.

Start the HTTP MCP server:

    python server.py

The endpoint is:

    http://localhost:8000/mcp

For local development and inspection, the official MCP SDK also provides MCP CLI tooling.

## Docker

From the repository root:

    cp mcp_server/.env.example mcp_server/.env
    docker compose up --build

## Analysis engine

The MCP server performs deterministic calculations for:

- EMA 20/50/200
- RSI
- MACD
- Bollinger Bands
- ATR
- swing highs/lows
- basic BOS
- FVG heuristic
- order-block heuristic
- OTE premium/discount zone
- CRT expansion/contraction phase
- price-action evidence
- confluence count
- confidence
- entry, stop loss and TP1/TP2
- position-size estimate from risk percentage

The LLM is not used to invent market prices or risk levels. It can explain deterministic results.

## Frontend connection

GitHub Pages can host the static dashboard, but it cannot run the Python MCP process. Deploy this MCP service on a Python-capable host and configure the frontend/backend integration to use its HTTPS MCP URL.

## Security

For production:

1. Use HTTPS.
2. Keep provider API keys server-side.
3. Add authentication before exposing the MCP endpoint publicly.
4. Add rate limiting.
5. Restrict CORS/origins at the deployment edge as appropriate.
6. Log tool calls without logging API secrets.
