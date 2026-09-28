from __future__ import annotations

from statistics import mean, pstdev

def ema(values, period):
    if len(values) < period:
        return values[-1]
    alpha = 2 / (period + 1)
    result = values[0]
    for value in values[1:]:
        result = alpha * value + (1 - alpha) * result
    return result

def rsi(values, period=14):
    if len(values) <= period:
        return 50.0
    gains, losses = [], []
    for i in range(1, len(values)):
        d = values[i] - values[i-1]
        gains.append(max(d, 0))
        losses.append(max(-d, 0))
    ag, al = mean(gains[-period:]), mean(losses[-period:])
    if al == 0:
        return 100.0
    return 100 - 100 / (1 + ag / al)

def macd(values):
    line = ema(values, 12) - ema(values, 26)
    history = [ema(values[:i], 12) - ema(values[:i], 26) for i in range(max(26, len(values)-60), len(values)+1)]
    signal = ema(history, 9) if history else line
    return line, signal, line - signal

def bollinger(values, period=20, multiplier=2.0):
    sample = values[-period:]
    mid = mean(sample)
    dev = pstdev(sample) if len(sample) > 1 else 0
    return mid, mid + multiplier*dev, mid - multiplier*dev

def atr(candles, period=14):
    trs = []
    for i in range(1, len(candles)):
        c, prev = candles[i], candles[i-1]["close"]
        trs.append(max(c["high"]-c["low"], abs(c["high"]-prev), abs(c["low"]-prev)))
    return mean(trs[-period:]) if trs else 0.0

def swing_levels(candles, window=2):
    highs, lows = [], []
    for i in range(window, len(candles)-window):
        h, l = candles[i]["high"], candles[i]["low"]
        if h == max(x["high"] for x in candles[i-window:i+window+1]): highs.append((i,h))
        if l == min(x["low"] for x in candles[i-window:i+window+1]): lows.append((i,l))
    return highs, lows

def analyze(candles, symbol, timeframe, risk_percent=1.0, account_balance=1000.0):
    closes = [c["close"] for c in candles]
    last, prev = candles[-1], candles[-2]
    price = last["close"]
    e20, e50 = ema(closes,20), ema(closes,50)
    e200 = ema(closes,200) if len(closes) >= 200 else e50
    rsi14 = rsi(closes)
    macd_line, macd_signal, macd_hist = macd(closes)
    bb_mid, bb_upper, bb_lower = bollinger(closes)
    atr14 = max(atr(candles), price*0.0005)
    highs, lows = swing_levels(candles)
    recent_high = max((x[1] for x in highs[-8:]), default=max(c["high"] for c in candles[-20:]))
    recent_low = min((x[1] for x in lows[-8:]), default=min(c["low"] for c in candles[-20:]))

    bull = bear = 0
    evidence = []
    if price > e20: bull += 1; evidence.append("price_above_ema20")
    else: bear += 1; evidence.append("price_below_ema20")
    if e20 > e50: bull += 1; evidence.append("ema20_above_ema50")
    else: bear += 1; evidence.append("ema20_below_ema50")
    if macd_hist > 0: bull += 1; evidence.append("macd_bullish")
    else: bear += 1; evidence.append("macd_bearish")
    if rsi14 >= 55: bull += 1; evidence.append("rsi_bullish")
    elif rsi14 <= 45: bear += 1; evidence.append("rsi_bearish")

    body = abs(last["close"]-last["open"])
    rng = max(last["high"]-last["low"], 1e-12)
    bullish_engulf = last["close"] > last["open"] and prev["close"] < prev["open"] and last["close"] >= prev["open"] and last["open"] <= prev["close"]
    bearish_engulf = last["close"] < last["open"] and prev["close"] > prev["open"] and last["open"] >= prev["close"] and last["close"] <= prev["open"]
    pin_bull = (min(last["open"],last["close"])-last["low"]) > body*2 and body/rng < .45
    pin_bear = (last["high"]-max(last["open"],last["close"])) > body*2 and body/rng < .45
    if bullish_engulf or pin_bull: bull += 1; evidence.append("bullish_price_action")
    if bearish_engulf or pin_bear: bear += 1; evidence.append("bearish_price_action")

    bos = "NONE"
    if price > recent_high: bull += 1; bos = "BULLISH_BOS"; evidence.append("bullish_bos")
    elif price < recent_low: bear += 1; bos = "BEARISH_BOS"; evidence.append("bearish_bos")

    direction = "BUY" if bull > bear else "SELL" if bear > bull else "WAIT"
    confluences = max(bull,bear)
    confidence = min(95, 45 + confluences*7 + (10 if direction != "WAIT" else 0))

    if direction == "BUY":
        entry = price; sl = min(recent_low, entry-1.2*atr14); risk = max(entry-sl, atr14*.8); sl = entry-risk; tp1 = entry+risk*1.5; tp2 = entry+risk*2.5
    elif direction == "SELL":
        entry = price; sl = max(recent_high, entry+1.2*atr14); risk = max(sl-entry, atr14*.8); sl = entry+risk; tp1 = entry-risk*1.5; tp2 = entry-risk*2.5
    else:
        entry=sl=tp1=tp2=price; risk=0

    fvg = "NONE"
    if len(candles) >= 3:
        a,c = candles[-3],candles[-1]
        if a["high"] < c["low"]: fvg="BULLISH_FVG"
        elif a["low"] > c["high"]: fvg="BEARISH_FVG"

    order_block = "BULLISH_OB" if direction=="BUY" and last["close"]>last["open"] else "BEARISH_OB" if direction=="SELL" and last["close"]<last["open"] else "NONE"
    midpoint=(recent_high+recent_low)/2
    ote="DISCOUNT_ZONE" if price < midpoint else "PREMIUM_ZONE"
    range_mid=(max(c["high"] for c in candles[-20:])+min(c["low"] for c in candles[-20:]))/2
    crt_phase="EXPANSION_UP" if price>range_mid and price>e20 else "EXPANSION_DOWN" if price<range_mid and price<e20 else "CONTRACTION"

    return {
        "symbol":symbol,"timeframe":timeframe,"direction":direction,
        "signal_status":"VALID" if direction!="WAIT" and confidence>=70 and confluences>=3 else "WAIT",
        "entry":round(entry,8),"stop_loss":round(sl,8),"take_profit_1":round(tp1,8),"take_profit_2":round(tp2,8),
        "risk_reward_tp1":round(abs(tp1-entry)/risk,2) if risk else 0,
        "risk_reward_tp2":round(abs(tp2-entry)/risk,2) if risk else 0,
        "confidence":confidence,"confluences":confluences,"evidence":evidence,
        "indicators":{"ema20":round(e20,8),"ema50":round(e50,8),"ema200":round(e200,8),"rsi14":round(rsi14,2),"macd":round(macd_line,8),"macd_signal":round(macd_signal,8),"macd_histogram":round(macd_hist,8),"bb_middle":round(bb_mid,8),"bb_upper":round(bb_upper,8),"bb_lower":round(bb_lower,8),"atr14":round(atr14,8)},
        "structure":{"bos":bos,"recent_swing_high":round(recent_high,8),"recent_swing_low":round(recent_low,8),"fvg":fvg,"order_block":order_block,"ote":ote,"crt_phase":crt_phase},
        "risk":{"account_balance":account_balance,"risk_percent":risk_percent,"risk_amount":round(account_balance*risk_percent/100,2),"position_units_estimate":round((account_balance*risk_percent/100)/risk,4) if risk else 0},
        "last_candle":last,
    }
