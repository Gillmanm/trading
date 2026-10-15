from __future__ import annotations

import json
import os
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
API_KEY = os.getenv("GEMINI_API_KEY", "")
MIN_CONFIDENCE = float(os.getenv("AI_MIN_CONFIDENCE", "75"))

SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "action": {"type": "STRING", "enum": ["BUY", "SELL", "WAIT"]},
        "symbol": {"type": "STRING"},
        "confidence": {"type": "NUMBER", "minimum": 0, "maximum": 100},
        "entry": {"type": "NUMBER"},
        "stop_loss": {"type": "NUMBER"},
        "take_profit": {"type": "NUMBER"},
        "timeframe": {"type": "STRING"},
        "setup": {"type": "STRING"},
        "reason": {"type": "STRING"},
        "valid_for_seconds": {"type": "INTEGER", "minimum": 10, "maximum": 300}
    },
    "required": ["action", "symbol", "confidence", "entry", "stop_loss", "take_profit", "timeframe", "setup", "reason", "valid_for_seconds"],
    "additionalProperties": False
}


def analyze_with_gemini(market: dict) -> dict:
    if not API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")

    prompt = f"""You are a conservative professional scalping analyst. Analyze only the supplied MT5/TradingView market snapshot. Use M15 for directional context, M5 for confirmation and M1 for entry timing. Consider market structure, BOS/CHoCH, liquidity sweep, displacement, FVG, order blocks, support/resistance, price action, EMA, RSI and ATR when supported by the data. Never invent missing data. Return WAIT when evidence conflicts. Confidence is evidence quality, not profit certainty. If confidence is below {MIN_CONFIDENCE}, action MUST be WAIT. For BUY: SL < entry < TP. For SELL: TP < entry < SL. Target at least 1.5R. Return JSON only.\n\nMARKET SNAPSHOT:\n{json.dumps(market, separators=(',', ':'))}"""

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 1000,
            "responseMimeType": "application/json",
            "responseSchema": SCHEMA
        }
    }
    req = Request(url, data=json.dumps(payload).encode(), method="POST", headers={"Content-Type": "application/json", "x-goog-api-key": API_KEY})
    try:
        with urlopen(req, timeout=20) as response:
            data = json.loads(response.read().decode())
    except HTTPError as exc:
        raise RuntimeError(f"Gemini HTTP {exc.code}: {exc.read().decode(errors='replace')[:500]}") from exc
    except URLError as exc:
        raise RuntimeError(f"Gemini connection error: {exc.reason}") from exc

    text = data["candidates"][0]["content"]["parts"][0]["text"]
    signal = json.loads(text)
    signal["confidence"] = max(0.0, min(100.0, float(signal.get("confidence", 0))))
    if signal.get("action") not in ("BUY", "SELL", "WAIT") or signal["confidence"] < MIN_CONFIDENCE:
        signal["action"] = "WAIT"
    return signal
