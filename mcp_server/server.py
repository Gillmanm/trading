from __future__ import annotations

import json
import os
from typing import Any

from mcp.server.mcpserver import MCPServer
from starlette.middleware.cors import CORSMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse

from analysis import analyze
from market_data import fetch_ohlcv, fetch_quote
from news import get_news

mcp = MCPServer(
    "Trading Analysis MCP",
    version="1.0.0",
    instructions="Use live market tools and deterministic analysis. Never invent prices, candles, news, entries, SL or TP.",
)

@mcp.tool()
def get_market_quote(symbol: str) -> dict[str, Any]:
    """Get the latest quote for a market symbol."""
    return fetch_quote(symbol)

@mcp.tool()
def get_market_candles(symbol: str, timeframe: str = "15m", outputsize: int = 250) -> dict[str, Any]:
    """Fetch real OHLCV candles from the configured market-data provider."""
    candles = fetch_ohlcv(symbol, timeframe, outputsize)
    return {"symbol": symbol, "timeframe": timeframe, "count": len(candles), "candles": candles}

@mcp.tool()
def analyze_market(symbol: str, timeframe: str = "15m", risk_percent: float = 1.0, account_balance: float = 1000.0, outputsize: int = 250) -> dict[str, Any]:
    """Run deterministic indicator, SMC/ICT, CRT and price-action analysis."""
    candles = fetch_ohlcv(symbol, timeframe, outputsize)
    return analyze(candles, symbol, timeframe, risk_percent, account_balance)

@mcp.tool()
def get_market_news(symbol: str, days: int = 2) -> dict[str, Any]:
    """Get recent news when FINNHUB_API_KEY is configured."""
    items = get_news(symbol, days)
    return {"symbol": symbol, "count": len(items), "items": items}

@mcp.tool()
def scan_markets(symbols: list[str], timeframe: str = "15m", minimum_confidence: int = 70) -> dict[str, Any]:
    """Analyze multiple symbols and return only valid signals above the confidence threshold."""
    results, errors = [], []
    for symbol in symbols:
        try:
            result = analyze(fetch_ohlcv(symbol, timeframe, 250), symbol, timeframe)
            if result["signal_status"] == "VALID" and result["confidence"] >= minimum_confidence:
                results.append(result)
        except Exception as exc:
            errors.append({"symbol": symbol, "error": str(exc)})
    return {"timeframe": timeframe, "minimum_confidence": minimum_confidence, "signals": results, "errors": errors}

@mcp.resource("market://{symbol}/{timeframe}")
def market_resource(symbol: str, timeframe: str = "15m") -> str:
    """Expose a current deterministic analysis snapshot as an MCP resource."""
    result = analyze(fetch_ohlcv(symbol, timeframe, 250), symbol, timeframe)
    return json.dumps(result, indent=2)

@mcp.prompt()
def explain_signal(symbol: str, timeframe: str = "15m") -> str:
    """Prompt an LLM to explain, not modify, a deterministic signal."""
    return f"Call analyze_market for {symbol} on {timeframe}. Explain the returned indicators, structure, confluences and risk levels. Do not change or invent the returned entry, SL or TP."

# Browser/API compatibility layer. The MCP endpoint remains /mcp.
SYMBOL_MAP = {
    "OANDA:EURUSD": "EUR/USD",
    "OANDA:GBPUSD": "GBP/USD",
    "OANDA:USDJPY": "USD/JPY",
    "OANDA:XAUUSD": "XAU/USD",
    "NASDAQ:NDX": "NDX",
    "BINANCE:BTCUSDT": "BTC/USD",
}

def provider_symbol(symbol: str) -> str:
    return SYMBOL_MAP.get(symbol, symbol.split(":", 1)[-1] if ":" in symbol else symbol)

@mcp.custom_route("/health", methods=["GET"])
async def health(request: Request):
    return JSONResponse({"status": "ok", "service": "trading-analysis-mcp"})

@mcp.custom_route("/api/quote", methods=["GET"])
async def api_quote(request: Request):
    try:
        symbol = provider_symbol(request.query_params.get("symbol", "OANDA:EURUSD"))
        return JSONResponse(fetch_quote(symbol))
    except Exception as exc:
        return JSONResponse({"error": str(exc)}, status_code=503)

@mcp.custom_route("/api/candles", methods=["GET"])
async def api_candles(request: Request):
    try:
        symbol = provider_symbol(request.query_params.get("symbol", "OANDA:EURUSD"))
        timeframe = request.query_params.get("timeframe", "15m")
        limit = int(request.query_params.get("limit", "250"))
        return JSONResponse({"symbol": symbol, "timeframe": timeframe, "candles": fetch_ohlcv(symbol, timeframe, limit)})
    except Exception as exc:
        return JSONResponse({"error": str(exc)}, status_code=503)

@mcp.custom_route("/api/analyze", methods=["GET"])
async def api_analyze(request: Request):
    try:
        symbol = provider_symbol(request.query_params.get("symbol", "OANDA:EURUSD"))
        timeframe = request.query_params.get("timeframe", "15m")
        risk_percent = float(request.query_params.get("risk_percent", "1"))
        account_balance = float(request.query_params.get("account_balance", "10000"))
        result = analyze(fetch_ohlcv(symbol, timeframe, 250), symbol, timeframe, risk_percent, account_balance)
        return JSONResponse(result)
    except Exception as exc:
        return JSONResponse({"error": str(exc)}, status_code=503)

@mcp.custom_route("/api/news", methods=["GET"])
async def api_news(request: Request):
    try:
        symbol = provider_symbol(request.query_params.get("symbol", "OANDA:EURUSD"))
        days = int(request.query_params.get("days", "2"))
        items = get_news(symbol, days)
        return JSONResponse({"symbol": symbol, "count": len(items), "items": items})
    except Exception as exc:
        return JSONResponse({"error": str(exc)}, status_code=503)

app = mcp.streamable_http_app(
    streamable_http_path="/mcp",
    stateless_http=True,
    json_response=True,
    host="0.0.0.0",
)
app = CORSMiddleware(
    app=app,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=os.getenv("MCP_HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", os.getenv("MCP_PORT", "8000"))),
    )
