import React from 'react';
import { AnalysisResult } from '../types';
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, Percent, Compass, ShieldCheck } from 'lucide-react';

interface StatsCardsProps {
  analysis: AnalysisResult | null;
  newsRisk: 'LOW' | 'MEDIUM' | 'HIGH';
}

export const StatsCards: React.FC<StatsCardsProps> = ({ analysis, newsRisk }) => {
  const bias = analysis
    ? analysis.direction === 'BUY'
      ? 'Bullish'
      : analysis.direction === 'SELL'
      ? 'Bearish'
      : 'Neutral'
    : 'Bullish';

  const confidence = analysis ? `${analysis.confidence}%` : '78%';
  const rr = analysis && analysis.risk_reward_tp1 > 0 ? `1 : ${analysis.risk_reward_tp1.toFixed(1)}` : '1 : 2.5';

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-3.5">
      {/* HTF Bias */}
      <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-[#8190a4] text-xs">
          <span>HTF Bias</span>
          <Compass className="w-3.5 h-3.5 text-[#55a7ff]" />
        </div>
        <b
          id="bias"
          className={`block text-lg font-bold my-1.5 flex items-center gap-1.5 ${
            bias === 'Bullish'
              ? 'text-[#35d49a]'
              : bias === 'Bearish'
              ? 'text-[#ff6175]'
              : 'text-[#8190a4]'
          }`}
        >
          {bias === 'Bullish' && <ArrowUpRight className="w-5 h-5 text-[#35d49a]" />}
          {bias === 'Bearish' && <ArrowDownRight className="w-5 h-5 text-[#ff6175]" />}
          {bias === 'Neutral' && <Minus className="w-5 h-5 text-[#8190a4]" />}
          <span>{bias}</span>
        </b>
        <small className="block text-[#8190a4] text-[11px]">4H structure aligned</small>
      </div>

      {/* Confidence */}
      <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-[#8190a4] text-xs">
          <span>Confidence</span>
          <Percent className="w-3.5 h-3.5 text-[#55a7ff]" />
        </div>
        <b id="confidence" className="block text-lg font-bold my-1.5 text-white">
          {confidence}
        </b>
        <small className="block text-[#8190a4] text-[11px]">Minimum 70% required</small>
      </div>

      {/* Risk / Reward */}
      <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-[#8190a4] text-xs">
          <span>Risk / Reward</span>
          <ShieldCheck className="w-3.5 h-3.5 text-[#55a7ff]" />
        </div>
        <b className="block text-lg font-bold my-1.5 text-white font-mono">
          {rr}
        </b>
        <small className="block text-[#8190a4] text-[11px]">Calculated setup</small>
      </div>

      {/* News Risk */}
      <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-[#8190a4] text-xs">
          <span>News Risk</span>
          <AlertCircle className={`w-3.5 h-3.5 ${newsRisk === 'LOW' ? 'text-[#35d49a]' : 'text-[#f6c85f]'}`} />
        </div>
        <b
          className={`block text-lg font-bold my-1.5 tracking-wider ${
            newsRisk === 'LOW' ? 'text-[#35d49a]' : newsRisk === 'MEDIUM' ? 'text-[#f6c85f]' : 'text-[#ff6175]'
          }`}
        >
          {newsRisk}
        </b>
        <small className="block text-[#8190a4] text-[11px]">
          {newsRisk === 'LOW' ? 'No high-impact event nearby' : 'High volatility window active'}
        </small>
      </div>
    </section>
  );
};
