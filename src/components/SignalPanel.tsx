import React from 'react';
import { AnalysisResult } from '../types';
import { Check, ShieldCheck, Zap } from 'lucide-react';

interface SignalPanelProps {
  analysis: AnalysisResult | null;
  onPaperTrade: () => void;
  isLoading: boolean;
}

function fmt(v: number | undefined, symbol: string): string {
  if (v === undefined || isNaN(v)) return '--';
  const isJpy = symbol.includes('JPY');
  const isIndex = symbol.includes('NDX') || symbol.includes('BTC');
  const decimals = isJpy ? 3 : isIndex ? 2 : 5;
  return v.toFixed(decimals);
}

export const SignalPanel: React.FC<SignalPanelProps> = ({
  analysis,
  onPaperTrade,
  isLoading,
}) => {
  const direction = analysis ? analysis.direction : 'BUY';
  const status = isLoading ? 'LOADING' : analysis ? analysis.signal_status : 'VALID';
  const confluences = analysis ? analysis.confluences : 6;
  const evidence = analysis?.evidence || [
    'price_above_ema20',
    'ema20_above_ema50',
    'macd_bullish',
    'rsi_bullish',
    'bullish_price_action',
    'bullish_bos',
  ];

  const sym = analysis?.symbol || 'OANDA:EURUSD';

  return (
    <aside className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg pb-3.5 flex flex-col shadow-sm" id="signals">
      {/* Panel header */}
      <div className="h-[49px] border-b border-[#1d2a3a] flex justify-between items-center px-3.5 bg-[#0a0f17]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#35d49a]" />
          <b className="text-white text-xs font-semibold">Signal Engine</b>
        </div>
        <span className="text-[#35d49a] text-xs font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#35d49a] animate-ping" />
          ● LIVE
        </span>
      </div>

      {/* Signal Head */}
      <div className="flex items-center gap-3 p-3.5">
        <span
          id="dir"
          className={`inline-block px-3.5 py-2 text-xs font-extrabold rounded-lg tracking-wider transition-colors ${
            direction === 'BUY'
              ? 'bg-[#35d49a]/15 text-[#35d49a] border border-[#35d49a]/30'
              : direction === 'SELL'
              ? 'bg-[#ff6175]/15 text-[#ff6175] border border-[#ff6175]/30'
              : 'bg-[#8190a4]/15 text-[#8190a4] border border-[#8190a4]/30'
          }`}
        >
          {direction}
        </span>
        <div>
          <small className="block text-[#8190a4] text-[10px] uppercase tracking-wider font-semibold">SETUP</small>
          <h2 id="status" className="m-0 mt-0.5 text-base font-bold text-white tracking-wide">
            {status}
          </h2>
        </div>
      </div>

      {/* Levels Box */}
      <div className="mx-3.5 border border-[#1d2a3a] rounded-lg overflow-hidden bg-[#111a26]/40 text-xs font-mono">
        <div className="flex justify-between items-center p-2.5 border-b border-[#1d2a3a]">
          <span className="text-[#8190a4] font-sans">Entry</span>
          <b id="entry" className="text-white font-semibold">
            {fmt(analysis?.entry || 1.1725, sym)}
          </b>
        </div>
        <div className="flex justify-between items-center p-2.5 border-b border-[#1d2a3a]">
          <span className="text-[#8190a4] font-sans">Stop Loss</span>
          <b className="text-[#ff6175] font-semibold">
            {fmt(analysis?.stop_loss || 1.1708, sym)}
          </b>
        </div>
        <div className="flex justify-between items-center p-2.5 border-b border-[#1d2a3a]">
          <span className="text-[#8190a4] font-sans">TP 1 (1.5R)</span>
          <b className="text-[#35d49a] font-semibold">
            {fmt(analysis?.take_profit_1 || 1.175, sym)}
          </b>
        </div>
        <div className="flex justify-between items-center p-2.5">
          <span className="text-[#8190a4] font-sans">TP 2 (2.5R)</span>
          <b className="text-[#35d49a] font-semibold">
            {fmt(analysis?.take_profit_2 || 1.178, sym)}
          </b>
        </div>
      </div>

      {/* Confluence */}
      <div className="p-3.5">
        <div className="flex justify-between items-center text-[10px] text-[#8190a4] mb-2 uppercase font-semibold tracking-wider">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#55a7ff]" />
            Confluence
          </span>
          <b className="text-[#35d49a] font-mono text-xs">{confluences}/8</b>
        </div>

        <div id="confl" className="flex flex-col gap-1.5 max-h-[175px] overflow-y-auto pr-1">
          {evidence.length ? (
            evidence.map((item, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-1.5 px-2 rounded bg-[#111a26]/40 border border-[#1d2a3a]/40 text-[11px]"
              >
                <span className="text-[#edf3fb] capitalize">{item.replace(/_/g, ' ')}</span>
                <span className="text-[#35d49a] font-bold">
                  <Check className="w-3.5 h-3.5" />
                </span>
              </div>
            ))
          ) : (
            <div className="text-[#8190a4] text-xs py-2 italic text-center">No confluence data</div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="px-3.5 mt-auto pt-2">
        <button
          id="paper"
          onClick={onPaperTrade}
          className="w-full bg-[#2879d8] hover:bg-[#2067bc] active:bg-[#1a559d] text-white font-medium text-xs py-2.5 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <Zap className="w-3.5 h-3.5 text-white" />
          <span>Paper Trade Signal</span>
        </button>
      </div>
    </aside>
  );
};
