from __future__ import annotations

import json
import os
from typing import Any

from mcp.server.mcpserver import MCPServer

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
    return {"symbol":symbol,"timeframe":timeframe,"count":len(candles),"candles":candles}

@mcp.tool()
def analyze_market(symbol: str, timeframe: str = "15m", risk_percent: float = 1.0, account_balance: float = 1000.0, outputsize: int = 250) -> dict[str, Any]:
    """Run deterministic indicator, SMC/ICT, CRT and price-action analysis."""
    candles = fetch_ohlcv(symbol, timeframe, outputsize)
    return analyze(candles, symbol, timeframe, risk_percent, account_balance)

@mcp.tool()
def get_market_news(symbol: str, days: int = 2) -> dict[str, Any]:
    """Get recent news when FINNHUB_API_KEY is configured."""
    items=get_news(symbol,days)
    return {"symbol":symbol,"count":len(items),"items":items}

@mcp.tool()
def scan_markets(symbols: list[str], timeframe: str = "15m", minimum_confidence: int = 70) -> dict[str, Any]:
    """Analyze multiple symbols and return only valid signals above the confidence threshold."""
    results, errors = [], []
    for symbol in symbols:
        try:
            result=analyze(fetch_ohlcv(symbol,timeframe,250),symbol,timeframe)
            if result["signal_status"]=="VALID" and result["confidence"]>=minimum_confidence:
                results.append(result)
        except Exception as exc:
            errors.append({"symbol":symbol,"error":str(exc)})
    return {"timeframe":timeframe,"minimum_confidence":minimum_confidence,"signals":results,"errors":errors}

@mcp.resource("market://{symbol}/{timeframe}")
def market_resource(symbol: str, timeframe: str = "15m") -> str:
    """Expose a current deterministic analysis snapshot as an MCP resource."""
    result=analyze(fetch_ohlcv(symbol,timeframe,250),symbol,timeframe)
    return json.dumps(result,indent=2)

@mcp.prompt()
def explain_signal(symbol: str, timeframe: str = "15m") -> str:
    """Prompt an LLM to explain, not modify, a deterministic signal."""
    return f"Call analyze_market for {symbol} on {timeframe}. Explain the returned indicators, structure, confluences and risk levels. Do not change or invent the returned entry, SL or TP."

if __name__ == "__main__":
    transport=os.getenv("MCP_TRANSPORT","streamable-http")
    if transport=="stdio":
        mcp.run()
    else:
        mcp.run(
            transport="streamable-http",
            host=os.getenv("MCP_HOST","0.0.0.0"),
            port=int(os.getenv("MCP_PORT","8000")),
            stateless_http=True,
            json_response=True,
        )
