import { Candle } from '../types';

export const SUPPORTED_SYMBOLS = [
  { id: 'OANDA:EURUSD', label: 'EUR/USD (Euro / US Dollar)', basePrice: 1.0865, pipDecimals: 5 },
  { id: 'OANDA:GBPUSD', label: 'GBP/USD (British Pound / US Dollar)', basePrice: 1.2940, pipDecimals: 5 },
  { id: 'OANDA:USDJPY', label: 'USD/JPY (US Dollar / Japanese Yen)', basePrice: 153.20, pipDecimals: 3 },
  { id: 'OANDA:XAUUSD', label: 'XAU/USD (Gold / US Dollar)', basePrice: 2685.50, pipDecimals: 2 },
  { id: 'NASDAQ:NDX', label: 'NASDAQ:NDX (Nasdaq 100 Index)', basePrice: 20450.00, pipDecimals: 2 },
  { id: 'BINANCE:BTCUSDT', label: 'BINANCE:BTCUSDT (Bitcoin / USDT)', basePrice: 67800.00, pipDecimals: 2 },
];

export const SUPPORTED_TIMEFRAMES = [
  { id: '5m', label: '5m', tvInterval: '5' },
  { id: '15m', label: '15m', tvInterval: '15' },
  { id: '60m', label: '1H', tvInterval: '60' },
  { id: '240m', label: '4H', tvInterval: '240' },
  { id: '1d', label: '1D', tvInterval: 'D' },
];

// Generates high-fidelity realistic OHLCV candles
function generateRealisticCandles(basePrice: number, count: number = 250, timeframe: string = '15m'): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  
  let stepMs = 15 * 60 * 1000;
  if (timeframe === '5m') stepMs = 5 * 60 * 1000;
  else if (timeframe === '60m') stepMs = 60 * 60 * 1000;
  else if (timeframe === '240m') stepMs = 4 * 60 * 60 * 1000;
  else if (timeframe === '1d') stepMs = 24 * 60 * 60 * 1000;

  let currentPrice = basePrice * (0.97 + Math.random() * 0.02);
  const volatility = basePrice * 0.0022;

  // Generate trend cycle
  let trendBias = (Math.random() - 0.45) * 0.0008;

  for (let i = count; i >= 0; i--) {
    const time = new Date(now - i * stepMs).toISOString();
    
    // Wave oscillation for realistic SMC swing highs/lows
    const cycle = Math.sin((count - i) / 12) * volatility * 1.5;
    const delta = (Math.random() - 0.48) * volatility + trendBias * currentPrice + cycle * 0.15;
    
    const open = currentPrice;
    const close = Math.max(0.0001, open + delta);
    const wickHigh = Math.abs(Math.random() * volatility * 0.8);
    const wickLow = Math.abs(Math.random() * volatility * 0.8);
    const high = Math.max(open, close) + wickHigh;
    const low = Math.min(open, close) - wickLow;
    const volume = Math.floor(1000 + Math.random() * 8500);

    candles.push({
      time,
      open: Number(open.toFixed(5)),
      high: Number(high.toFixed(5)),
      low: Number(low.toFixed(5)),
      close: Number(close.toFixed(5)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

export async function fetchCandles(symbol: string, timeframe: string = '15m', limit: number = 250): Promise<Candle[]> {
  // Try Binance public API for BTCUSDT
  if (symbol.includes('BTCUSDT') || symbol.includes('BTC')) {
    try {
      const intervalMap: Record<string, string> = {
        '5m': '5m',
        '15m': '15m',
        '60m': '1h',
        '240m': '4h',
        '1d': '1d',
      };
      const interval = intervalMap[timeframe] || '15m';
      const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${interval}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 20) {
          return data.map((item: any) => ({
            time: new Date(item[0]).toISOString(),
            open: parseFloat(item[1]),
            high: parseFloat(item[2]),
            low: parseFloat(item[3]),
            close: parseFloat(item[4]),
            volume: parseFloat(item[5]),
          }));
        }
      }
    } catch {
      // Fallback below
    }
  }

  // Check if TwelveData key is configured
  const apiKey = (import.meta as any).env?.VITE_TWELVEDATA_API_KEY;
  if (apiKey) {
    try {
      const tfMap: Record<string, string> = {
        '5m': '5min',
        '15m': '15min',
        '60m': '1h',
        '240m': '4h',
        '1d': '1day',
      };
      const cleanSym = symbol.replace('OANDA:', '').replace('NASDAQ:', '').replace('BINANCE:', '');
      const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(cleanSym)}&interval=${tfMap[timeframe] || '15min'}&outputsize=${limit}&apikey=${apiKey}&format=JSON`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.values && Array.isArray(json.values)) {
          return json.values.reverse().map((r: any) => ({
            time: r.datetime,
            open: parseFloat(r.open),
            high: parseFloat(r.high),
            low: parseFloat(r.low),
            close: parseFloat(r.close),
            volume: parseFloat(r.volume || '0'),
          }));
        }
      }
    } catch {
      // Fallback
    }
  }

  // Realistic synthesized market candles matching asset characteristics
  const meta = SUPPORTED_SYMBOLS.find((s) => s.id === symbol) || { basePrice: 1.0850 };
  return generateRealisticCandles(meta.basePrice, limit, timeframe);
}
