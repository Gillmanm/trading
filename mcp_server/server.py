import os, time, uuid
from typing import Any, Dict, Optional
import requests
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Trading Analysis AI API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
AI_MIN_CONFIDENCE = float(os.getenv("AI_MIN_CONFIDENCE", "75"))
TV_SECRET = os.getenv("TRADINGVIEW_WEBHOOK_SECRET", "CHANGE_ME")
MT5_SECRET = os.getenv("MT5_API_SECRET", "CHANGE_ME")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

LATEST_SIGNAL: Dict[str, Any] = {"action": "WAIT", "confidence": 0, "updated_at": 0}

class MarketSnapshot(BaseModel):
    symbol: str
    timeframe: str = "1"
    price: float
    open: Optional[float] = None
    high: Optional[float] = None
    low: Optional[float] = None
    ema20: Optional[float] = None
    ema50: Optional[float] = None
    rsi14: Optional[float] = None
    atr14: Optional[float] = None
    m5_close: Optional[float] = None
    m15_close: Optional[float] = None
    candles_m1: list = Field(default_factory=list)
    candles_m5: list = Field(default_factory=list)
    candles_m15: list = Field(default_factory=list)

class TVPayload(MarketSnapshot):
    secret: str
    action_candidate: str = "WAIT"

SYSTEM_PROMPT = """You are a conservative professional scalping analyst. Analyze only the supplied market data. Use M15 for directional context, M5 for setup confirmation, and M1 for execution timing. Consider market structure, BOS, CHoCH/MSS, liquidity sweeps, displacement, FVG, order blocks, support/resistance, price action, EMA, RSI and ATR when the supplied data supports them. Do not invent candles or news. If evidence is mixed, return WAIT. Never force a trade. For a non-WAIT signal, provide realistic entry, invalidation stop loss and take profit with risk/reward >= 1.5. Return ONLY valid JSON with keys: action, symbol, confidence, entry, stop_loss, take_profit, timeframe, setup, reason, valid_for_seconds. action must be BUY, SELL or WAIT. confidence is 0-100."""

def gemini_analyze(market: Dict[str, Any]) -> Dict[str, Any]:
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY is not configured on Render")
    prompt = SYSTEM_PROMPT + "\nMARKET SNAPSHOT:\n" + str(market)
    body = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"}}
    r = requests.post(GEMINI_URL, params={"key": GEMINI_API_KEY}, json=body, timeout=20)
    if r.status_code >= 400:
        raise HTTPException(502, f"Gemini API error: {r.text[:500]}")
    data = r.json()
    text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
    import json
    try:
        signal = json.loads(text)
    except Exception:
        raise HTTPException(502, "Gemini returned invalid JSON")
    action = str(signal.get("action", "WAIT")).upper()
    confidence = float(signal.get("confidence", 0))
    if action not in {"BUY", "SELL", "WAIT"} or confidence < AI_MIN_CONFIDENCE:
        action = "WAIT"
    signal["action"] = action
    signal["confidence"] = confidence
    signal["id"] = str(uuid.uuid4())
    signal["updated_at"] = int(time.time())
    return signal

@app.get("/health")
def health():
    return {"ok": True, "model": GEMINI_MODEL, "min_confidence": AI_MIN_CONFIDENCE}

@app.post("/api/analyze")
def analyze(market: MarketSnapshot):
    signal = gemini_analyze(market.model_dump())
    global LATEST_SIGNAL
    LATEST_SIGNAL = signal
    return signal

@app.post("/webhook/tradingview")
def tradingview(payload: TVPayload):
    if payload.secret != TV_SECRET:
        raise HTTPException(401, "Invalid TradingView secret")
    data = payload.model_dump(exclude={"secret"})
    signal = gemini_analyze(data)
    global LATEST_SIGNAL
    LATEST_SIGNAL = signal
    return signal

@app.get("/api/mt5/signal")
def mt5_signal(x_api_key: Optional[str] = Header(default=None)):
    if MT5_SECRET != "CHANGE_ME" and x_api_key != MT5_SECRET:
        raise HTTPException(401, "Invalid MT5 API key")
    return LATEST_SIGNAL
