import React from 'react';
import { RefreshCw, Sparkles } from 'lucide-react';
import { SUPPORTED_SYMBOLS, SUPPORTED_TIMEFRAMES } from '../services/marketData';

interface HeaderProps {
  symbol: string;
  setSymbol: (s: string) => void;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  symbol,
  setSymbol,
  timeframe,
  setTimeframe,
  onAnalyze,
  isLoading,
}) => {
  return (
    <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 mb-4 pb-1">
      <div>
        <span className="text-[#55a7ff] text-[10px] tracking-[1.5px] uppercase font-semibold flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#55a7ff]" />
          Market Analysis Pro
        </span>
        <h1 className="m-0 mt-1 text-xl sm:text-2xl font-bold tracking-tight text-white">
          Advanced Trading Dashboard
        </h1>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <select
          id="symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="bg-[#0d131d] border border-[#1d2a3a] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#55a7ff] cursor-pointer hover:border-[#2a3c52] transition-colors"
        >
          {SUPPORTED_SYMBOLS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id}
            </option>
          ))}
        </select>

        <select
          id="tf"
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="bg-[#0d131d] border border-[#1d2a3a] text-white text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#55a7ff] cursor-pointer hover:border-[#2a3c52] transition-colors"
        >
          {SUPPORTED_TIMEFRAMES.map((tf) => (
            <option key={tf.id} value={tf.id}>
              {tf.label}
            </option>
          ))}
        </select>

        <button
          id="analyze"
          onClick={onAnalyze}
          disabled={isLoading}
          className="bg-[#2879d8] hover:bg-[#2067bc] active:bg-[#1a559d] text-white font-medium text-xs px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Analyzing...' : 'Run Analysis'}</span>
        </button>
      </div>
    </header>
  );
};
