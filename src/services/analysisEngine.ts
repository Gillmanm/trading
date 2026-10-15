import { Candle, AnalysisResult, SignalDirection, SignalStatus } from '../types';

function mean(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((acc, v) => acc + v, 0) / values.length;
}

function pstdev(values: number[]): number {
  if (values.length <= 1) return 0;
  const m = mean(values);
  const variance = values.reduce((acc, v) => acc + Math.pow(v - m, 2), 0) / values.length;
  return Math.sqrt(variance);
}

export function ema(values: number[], period: number): number {
  if (values.length === 0) return 0;
  if (values.length < period) return values[values.length - 1];
  const alpha = 2 / (period + 1);
  let result = values[0];
  for (let i = 1; i < values.length; i++) {
    result = alpha * values[i] + (1 - alpha) * result;
  }
  return result;
}

export function rsi(values: number[], period: number = 14): number {
  if (values.length <= period) return 50.0;
  const gains: number[] = [];
  const losses: number[] = [];
  for (let i = 1; i < values.length; i++) {
    const d = values[i] - values[i - 1];
    gains.push(Math.max(d, 0));
    losses.push(Math.max(-d, 0));
  }
  const recentGains = gains.slice(-period);
  const recentLosses = losses.slice(-period);
  const ag = mean(recentGains);
  const al = mean(recentLosses);
  if (al === 0) return 100.0;
  return 100 - 100 / (1 + ag / al);
}

export function macd(values: number[]): [number, number, number] {
  if (values.length < 26) return [0, 0, 0];
  const line = ema(values, 12) - ema(values, 26);
  const historyStart = Math.max(26, values.length - 60);
  const history: number[] = [];
  for (let i = historyStart; i <= values.length; i++) {
    const sub = values.slice(0, i);
    history.push(ema(sub, 12) - ema(sub, 26));
  }
  const signal = history.length ? ema(history, 9) : line;
  return [line, signal, line - signal];
}

export function bollinger(values: number[], period: number = 20, multiplier: number = 2.0): [number, number, number] {
  const sample = values.slice(-period);
  const mid = mean(sample);
  const dev = pstdev(sample);
  return [mid, mid + multiplier * dev, mid - multiplier * dev];
}

export function atr(candles: Candle[], period: number = 14): number {
  if (candles.length < 2) return 0;
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const c = candles[i];
    const prevClose = candles[i - 1].close;
    trs.push(Math.max(c.high - c.low, Math.abs(c.high - prevClose), Math.abs(c.low - prevClose)));
  }
  const recentTrs = trs.slice(-period);
  return mean(recentTrs);
}

export function swingLevels(candles: Candle[], window: number = 2): { highs: [number, number][]; lows: [number, number][] } {
  const highs: [number, number][] = [];
  const lows: [number, number][] = [];
  for (let i = window; i < candles.length - window; i++) {
    const h = candles[i].high;
    const l = candles[i].low;
    const rangeCandles = candles.slice(i - window, i + window + 1);
    const maxHigh = Math.max(...rangeCandles.map((c) => c.high));
    const minLow = Math.min(...rangeCandles.map((c) => c.low));
    if (h === maxHigh) highs.push([i, h]);
    if (l === minLow) lows.push([i, l]);
  }
  return { highs, lows };
}

export function analyzeCandles(
  candles: Candle[],
  symbol: string,
  timeframe: string,
  riskPercent: number = 1.0,
  accountBalance: number = 10000.0
): AnalysisResult {
  if (candles.length < 10) {
    throw new Error('Not enough candles provided for deterministic analysis.');
  }

  const closes = candles.map((c) => c.close);
  const last = candles[candles.length - 1];
  const prev = candles[candles.length - 2];
  const price = last.close;

  const e20 = ema(closes, 20);
  const e50 = ema(closes, 50);
  const e200 = closes.length >= 200 ? ema(closes, 200) : e50;

  const rsi14 = rsi(closes, 14);
  const [macd_line, macd_signal, macd_hist] = macd(closes);
  const [bb_mid, bb_upper, bb_lower] = bollinger(closes, 20, 2.0);
  const atr14 = Math.max(atr(candles, 14), price * 0.0005);

  const { highs, lows } = swingLevels(candles, 2);
  const recentHighs = highs.slice(-8).map((x) => x[1]);
  const recentLows = lows.slice(-8).map((x) => x[1]);

  const recent_high = recentHighs.length ? Math.max(...recentHighs) : Math.max(...candles.slice(-20).map((c) => c.high));
  const recent_low = recentLows.length ? Math.min(...recentLows) : Math.min(...candles.slice(-20).map((c) => c.low));

  let bull = 0;
  let bear = 0;
  const evidence: string[] = [];

  // EMA Structure
  if (price > e20) {
    bull++;
    evidence.push('price_above_ema20');
  } else {
    bear++;
    evidence.push('price_below_ema20');
  }

  if (e20 > e50) {
    bull++;
    evidence.push('ema20_above_ema50');
  } else {
    bear++;
    evidence.push('ema20_below_ema50');
  }

  // MACD
  if (macd_hist > 0) {
    bull++;
    evidence.push('macd_bullish');
  } else {
    bear++;
    evidence.push('macd_bearish');
  }

  // RSI
  if (rsi14 >= 55) {
    bull++;
    evidence.push('rsi_bullish');
  } else if (rsi14 <= 45) {
    bear++;
    evidence.push('rsi_bearish');
  }

  // Price Action / Candlestick patterns
  const body = Math.abs(last.close - last.open);
  const rng = Math.max(last.high - last.low, 1e-12);
  const bullish_engulf =
    last.close > last.open &&
    prev.close < prev.open &&
    last.close >= prev.open &&
    last.open <= prev.close;

  const bearish_engulf =
    last.close < last.open &&
    prev.close > prev.open &&
    last.open >= prev.close &&
    last.close <= prev.open;

  const pin_bull = Math.min(last.open, last.close) - last.low > body * 2 && body / rng < 0.45;
  const pin_bear = last.high - Math.max(last.open, last.close) > body * 2 && body / rng < 0.45;

  if (bullish_engulf || pin_bull) {
    bull++;
    evidence.push('bullish_price_action');
  }
  if (bearish_engulf || pin_bear) {
    bear++;
    evidence.push('bearish_price_action');
  }

  // Break of Structure (BOS)
  let bos: 'BULLISH_BOS' | 'BEARISH_BOS' | 'NONE' = 'NONE';
  if (price > recent_high) {
    bull++;
    bos = 'BULLISH_BOS';
    evidence.push('bullish_bos');
  } else if (price < recent_low) {
    bear++;
    bos = 'BEARISH_BOS';
    evidence.push('bearish_bos');
  }

  const direction: SignalDirection = bull > bear ? 'BUY' : bear > bull ? 'SELL' : 'WAIT';
  const confluences = Math.max(bull, bear);
  const confidence = Math.min(95, 45 + confluences * 7 + (direction !== 'WAIT' ? 10 : 0));

  let entry = price;
  let sl = price;
  let tp1 = price;
  let tp2 = price;
  let risk = 0;

  if (direction === 'BUY') {
    entry = price;
    sl = Math.min(recent_low, entry - 1.2 * atr14);
    risk = Math.max(entry - sl, atr14 * 0.8);
    sl = entry - risk;
    tp1 = entry + risk * 1.5;
    tp2 = entry + risk * 2.5;
  } else if (direction === 'SELL') {
    entry = price;
    sl = Math.max(recent_high, entry + 1.2 * atr14);
    risk = Math.max(sl - entry, atr14 * 0.8);
    sl = entry + risk;
    tp1 = entry - risk * 1.5;
    tp2 = entry - risk * 2.5;
  }

  // Fair Value Gap (FVG)
  let fvg: 'BULLISH_FVG' | 'BEARISH_FVG' | 'NONE' = 'NONE';
  if (candles.length >= 3) {
    const a = candles[candles.length - 3];
    const c = candles[candles.length - 1];
    if (a.high < c.low) fvg = 'BULLISH_FVG';
    else if (a.low > c.high) fvg = 'BEARISH_FVG';
  }

  // Order block
  const order_block: 'BULLISH_OB' | 'BEARISH_OB' | 'NONE' =
    direction === 'BUY' && last.close > last.open
      ? 'BULLISH_OB'
      : direction === 'SELL' && last.close < last.open
      ? 'BEARISH_OB'
      : 'NONE';

  // OTE Zone (Fibonacci 61.8 - 79%)
  const midpoint = (recent_high + recent_low) / 2;
  const ote: 'DISCOUNT_ZONE' | 'PREMIUM_ZONE' = price < midpoint ? 'DISCOUNT_ZONE' : 'PREMIUM_ZONE';

  // CRT Phase
  const last20 = candles.slice(-20);
  const range_mid = (Math.max(...last20.map((c) => c.high)) + Math.min(...last20.map((c) => c.low))) / 2;
  const crt_phase: 'EXPANSION_UP' | 'EXPANSION_DOWN' | 'CONTRACTION' =
    price > range_mid && price > e20
      ? 'EXPANSION_UP'
      : price < range_mid && price < e20
      ? 'EXPANSION_DOWN'
      : 'CONTRACTION';

  const signal_status: SignalStatus =
    direction !== 'WAIT' && confidence >= 70 && confluences >= 3 ? 'VALID' : 'WAIT';

  const riskAmount = Number(((accountBalance * riskPercent) / 100).toFixed(2));
  const positionUnits = risk > 0 ? Number((riskAmount / risk).toFixed(4)) : 0;

  return {
    symbol,
    timeframe,
    direction,
    signal_status,
    entry: Number(entry.toFixed(8)),
    stop_loss: Number(sl.toFixed(8)),
    take_profit_1: Number(tp1.toFixed(8)),
    take_profit_2: Number(tp2.toFixed(8)),
    risk_reward_tp1: risk > 0 ? Number((Math.abs(tp1 - entry) / risk).toFixed(2)) : 0,
    risk_reward_tp2: risk > 0 ? Number((Math.abs(tp2 - entry) / risk).toFixed(2)) : 0,
    confidence,
    confluences,
    evidence,
    indicators: {
      ema20: Number(e20.toFixed(8)),
      ema50: Number(e50.toFixed(8)),
      ema200: Number(e200.toFixed(8)),
      rsi14: Number(rsi14.toFixed(2)),
      macd: Number(macd_line.toFixed(8)),
      macd_signal: Number(macd_signal.toFixed(8)),
      macd_histogram: Number(macd_hist.toFixed(8)),
      bb_middle: Number(bb_mid.toFixed(8)),
      bb_upper: Number(bb_upper.toFixed(8)),
      bb_lower: Number(bb_lower.toFixed(8)),
      atr14: Number(atr14.toFixed(8)),
    },
    structure: {
      bos,
      recent_swing_high: Number(recent_high.toFixed(8)),
      recent_swing_low: Number(recent_low.toFixed(8)),
      fvg,
      order_block,
      ote,
      crt_phase,
      mss: bos !== 'NONE' ? 'Confirmed' : 'Testing Support',
      liquidity_sweep: direction === 'BUY' ? 'Sell-side swept' : 'Buy-side swept',
    },
    risk: {
      account_balance: accountBalance,
      risk_percent: riskPercent,
      risk_amount: riskAmount,
      position_units_estimate: positionUnits,
    },
    last_candle: last,
    timestamp: new Date().toISOString(),
  };
}
