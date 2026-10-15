"""
TradingView AI Scalping bridge.

TradingView cannot execute Python inside a Pine chart. This module is a Python
backend endpoint that accepts TradingView webhook/chart data, performs
structured deterministic checks, and optionally calls an AI provider.

Run with FastAPI/Uvicorn and connect TradingView alerts to /webhook/tradingview.
"""
import json
import os
from typing import Any, Dict, List

import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="TradingView AI Scalper API", version="1.0.0")

AI_URL = os.getenv("AI_URL", "https://api.deepseek.com/chat/completions")
AI_KEY = os.getenv("AI_KEY", "")
AI_MODEL = os.getenv("AI_MODEL", "deepseek-chat")
MIN_CONFIDENCE = float(os.getenv("MIN_CONFIDENCE", "75"))
WEBHOOK_SECRET = os.getenv("TRADINGVIEW_WEBHOOK_SECRET", "change-me")


class TradingViewPayload(BaseModel):
    secret: str
    symbol: str
    timeframe: str = "1"
    price: float
    candles: List[Dict[str, Any]] = Field(default_factory=list)
    indicators: Dict[str, Any] = Field(default_factory=dict)
    market_context: Dict[str, Any] = Field(default_factory=dict)


def deterministic_context(data: TradingViewPayload) -> Dict[str, Any]:
    candles = data.candles[-100:]
    if len(candles) < 5:
        return {"ready": False, "reason": "At least 5 candles are required."}

    highs = [float(x["high"]) for x in candles if "high" in x]
    lows = [float(x["low"]) for x in candles if "low" in x]
    closes = [float(x["close"]) for x in candles if "close" in x]

    if not highs or not lows or not closes:
        return {"ready": False, "reason": "Candle OHLC data is incomplete."}

    recent_high = max(highs[-20:])
    recent_low = min(lows[-20:])
    direction = "BULLISH" if closes[-1] > closes[-5] else "BEARISH" if closes[-1] < closes[-5] else "NEUTRAL"

    return {
        "ready": True,
        "direction": direction,
        "recent_high_20": recent_high,
        "recent_low_20": recent_low,
        "current_close": closes[-1],
        "candle_count": len(candles),
    }


def ai_analyze(payload: TradingViewPayload, context: Dict[str, Any]) -> Dict[str, Any]:
    if not AI_KEY:
        return {
            "action": "WAIT",
            "symbol": payload.symbol,
            "confidence": 0,
            "entry": None,
            "stop_loss": None,
            "take_profit": None,
            "reason": "AI_KEY is not configured.",
        }

    prompt = f"""
You are a conservative ICT/SMC/price-action scalping analyst.
Analyze this TradingView market snapshot. Do not invent prices.
Use higher timeframe context when supplied, then confirm on the requested
scalping timeframe. Look for liquidity sweep, BOS/CHoCH, displacement, FVG,
order block, support/resistance and momentum. Return WAIT when evidence is
mixed. Never force a trade.

Minimum risk/reward: 1.5.
Minimum confidence: {MIN_CONFIDENCE}.

Return JSON only:
{{
  "action":"BUY|SELL|WAIT",
  "symbol":"{payload.symbol}",
  "confidence":0,
  "entry":0,
  "stop_loss":0,
  "take_profit":0,
  "timeframe":"{payload.timeframe}",
  "setup":"",
  "reason":"",
  "valid_for_seconds":60
}}

TradingView data:
{json.dumps(payload.model_dump(), separators=(',', ':'))}

Deterministic context:
{json.dumps(context, separators=(',', ':'))}
"""

    r = requests.post(
        AI_URL,
        headers={"Authorization": f"Bearer {AI_KEY}", "Content-Type": "application/json"},
        json={
            "model": AI_MODEL,
            "temperature": 0.1,
            "messages": [
                {"role": "system", "content": "Output valid JSON only."},
                {"role": "user", "content": prompt},
            ],
        },
        timeout=20,
    )
    r.raise_for_status()
    content = r.json()["choices"][0]["message"]["content"]
    return json.loads(content)


@app.get("/health")
def health():
    return {"ok": True, "service": "tradingview-ai-scalper"}


@app.post("/webhook/tradingview")
def tradingview_webhook(payload: TradingViewPayload):
    if payload.secret != WEBHOOK_SECRET:
        raise HTTPException(status_code=401, detail="Invalid webhook secret")

    context = deterministic_context(payload)
    if not context["ready"]:
        return {"action": "WAIT", "symbol": payload.symbol, "confidence": 0, "reason": context["reason"]}

    try:
        signal = ai_analyze(payload, context)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI analysis failed: {exc}")

    confidence = float(signal.get("confidence", 0))
    if confidence < MIN_CONFIDENCE:
        signal["action"] = "WAIT"

    return signal
