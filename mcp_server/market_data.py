from __future__ import annotations

import json
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen

TIMEFRAME_MAP = {"1m":"1min","5m":"5min","15m":"15min","30m":"30min","1h":"1h","4h":"4h","1d":"1day"}

class MarketDataError(RuntimeError):
    pass

def _request_json(url: str, timeout: int = 15) -> dict:
    request = Request(url, headers={"User-Agent": "trading-analysis-mcp/1.0"})
    try:
        with urlopen(request, timeout=timeout) as response:
            payload = response.read().decode("utf-8")
    except Exception as exc:
        raise MarketDataError(f"Market-data request failed: {exc}") from exc
    try:
        data = json.loads(payload)
    except json.JSONDecodeError as exc:
        raise MarketDataError("Market-data provider returned invalid JSON") from exc
    if isinstance(data, dict) and data.get("status") == "error":
        raise MarketDataError(str(data.get("message") or data))
    return data

def fetch_ohlcv(symbol: str, timeframe: str = "15m", outputsize: int = 250) -> list[dict]:
    api_key = os.getenv("TWELVEDATA_API_KEY")
    if not api_key:
        raise MarketDataError("TWELVEDATA_API_KEY is not configured.")
    interval = TIMEFRAME_MAP.get(timeframe)
    if not interval:
        raise MarketDataError(f"Unsupported timeframe: {timeframe}")
    params = urlencode({"symbol": symbol, "interval": interval, "outputsize": max(50, min(int(outputsize), 5000)), "apikey": api_key, "format": "JSON"})
    data = _request_json(f"https://api.twelvedata.com/time_series?{params}")
    values = data.get("values")
    if not isinstance(values, list) or len(values) < 30:
        raise MarketDataError(f"Not enough candles returned for {symbol} {timeframe}")
    candles = []
    for row in reversed(values):
        candles.append({"time": row.get("datetime"), "open": float(row["open"]), "high": float(row["high"]), "low": float(row["low"]), "close": float(row["close"]), "volume": float(row.get("volume") or 0)})
    return candles

def fetch_quote(symbol: str) -> dict:
    api_key = os.getenv("TWELVEDATA_API_KEY")
    if not api_key:
        raise MarketDataError("TWELVEDATA_API_KEY is not configured.")
    params = urlencode({"symbol": symbol, "apikey": api_key})
    data = _request_json(f"https://api.twelvedata.com/quote?{params}")
    return {"symbol": symbol, "price": float(data.get("close") or data.get("price") or 0), "change": float(data.get("change") or 0), "percent_change": float(data.get("percent_change") or 0), "timestamp": data.get("datetime")}
