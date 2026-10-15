export interface Candle {
  time: string | number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type SignalDirection = 'BUY' | 'SELL' | 'WAIT';
export type SignalStatus = 'VALID' | 'WAIT' | 'LOADING' | 'DATA ERROR';

export interface AnalysisIndicators {
  ema20: number;
  ema50: number;
  ema200: number;
  rsi14: number;
  macd: number;
  macd_signal: number;
  macd_histogram: number;
  bb_middle: number;
  bb_upper: number;
  bb_lower: number;
  atr14: number;
}

export interface AnalysisStructure {
  bos: 'BULLISH_BOS' | 'BEARISH_BOS' | 'NONE';
  recent_swing_high: number;
  recent_swing_low: number;
  fvg: 'BULLISH_FVG' | 'BEARISH_FVG' | 'NONE';
  order_block: 'BULLISH_OB' | 'BEARISH_OB' | 'NONE';
  ote: 'DISCOUNT_ZONE' | 'PREMIUM_ZONE';
  crt_phase: 'EXPANSION_UP' | 'EXPANSION_DOWN' | 'CONTRACTION';
  mss?: string;
  liquidity_sweep?: string;
}

export interface RiskAnalysis {
  account_balance: number;
  risk_percent: number;
  risk_amount: number;
  position_units_estimate: number;
}

export interface AnalysisResult {
  symbol: string;
  timeframe: string;
  direction: SignalDirection;
  signal_status: SignalStatus;
  entry: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  risk_reward_tp1: number;
  risk_reward_tp2: number;
  confidence: number;
  confluences: number;
  evidence: string[];
  indicators: AnalysisIndicators;
  structure: AnalysisStructure;
  risk: RiskAnalysis;
  last_candle?: Candle;
  timestamp: string;
}

export interface NewsItem {
  id?: string;
  headline: string;
  summary: string;
  source: string;
  url?: string;
  datetime: string | number;
  impact?: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PaperTrade {
  id: string;
  symbol: string;
  direction: SignalDirection;
  timeframe: string;
  entry: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  risk_amount: number;
  units: number;
  status: 'ACTIVE' | 'TP1_HIT' | 'TP2_HIT' | 'SL_HIT' | 'CLOSED';
  pnl: number;
  openedAt: string;
  closedAt?: string;
}
