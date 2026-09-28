from __future__ import annotations
import json, os
from datetime import datetime, timezone, timedelta
from urllib.parse import urlencode
from urllib.request import Request, urlopen

def get_news(symbol: str, days: int = 2) -> list[dict]:
    token = os.getenv("FINNHUB_API_KEY")
    if not token:
        return []
    end = datetime.now(timezone.utc).date()
    start = end - timedelta(days=max(1, days))
    params = urlencode({"symbol":symbol,"from":start.isoformat(),"to":end.isoformat(),"token":token})
    try:
        req=Request(f"https://finnhub.io/api/v1/company-news?{params}",headers={"User-Agent":"trading-analysis-mcp/1.0"})
        with urlopen(req,timeout=15) as response:
            data=json.loads(response.read().decode("utf-8"))
    except Exception:
        return []
    return [{"headline":x.get("headline"),"summary":x.get("summary"),"source":x.get("source"),"url":x.get("url"),"datetime":x.get("datetime")} for x in data[:20]]
