import React from 'react';
import { AnalysisResult } from '../types';
import { Network, Activity } from 'lucide-react';

interface StructureAnalysisProps {
  analysis: AnalysisResult | null;
}

export const StructureAnalysis: React.FC<StructureAnalysisProps> = ({ analysis }) => {
  const structure = analysis?.structure;
  const isBuy = analysis?.direction === 'BUY';
  const isSell = analysis?.direction === 'SELL';

  // SMC Items
  const smcItems = [
    {
      label: 'Market Structure',
      value: structure?.bos ? structure.bos.replace(/_/g, ' ') : 'BOS',
      badgeClass:
        structure?.bos !== 'NONE'
          ? 'text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20'
          : 'text-[#8190a4] bg-[#182332]',
    },
    {
      label: 'Order Block',
      value: structure?.order_block ? structure.order_block.replace(/_/g, ' ') : 'Bullish OB',
      badgeClass:
        structure?.order_block === 'BULLISH_OB'
          ? 'text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20'
          : structure?.order_block === 'BEARISH_OB'
          ? 'text-[#ff6175] bg-[#ff6175]/10 border border-[#ff6175]/20'
          : 'text-[#8190a4] bg-[#182332]',
    },
    {
      label: 'Fair Value Gap',
      value: structure?.fvg ? structure.fvg.replace(/_/g, ' ') : 'Present',
      badgeClass:
        structure?.fvg !== 'NONE'
          ? 'text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20'
          : 'text-[#8190a4] bg-[#182332]',
    },
    {
      label: 'Liquidity',
      value: isBuy ? 'Sell-side swept' : isSell ? 'Buy-side swept' : 'Equal Highs/Lows',
      badgeClass: 'text-[#f6c85f] bg-[#f6c85f]/10 border border-[#f6c85f]/20',
    },
    {
      label: 'MSS / CHoCH',
      value: structure?.bos !== 'NONE' ? 'Confirmed' : 'Testing Support',
      badgeClass:
        structure?.bos !== 'NONE'
          ? 'text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20'
          : 'text-[#8190a4] bg-[#182332]',
    },
    {
      label: 'OTE',
      value: structure?.ote ? structure.ote.replace(/_/g, ' ') : 'Discount Zone 61.8-79%',
      badgeClass: 'text-[#aebbd0] bg-[#182332]',
    },
  ];

  // CRT Items
  const crtItems = [
    {
      label: 'Range',
      value: structure?.crt_phase ? structure.crt_phase.replace(/_/g, ' ') : 'Expansion',
      badgeClass: 'text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20',
    },
    {
      label: 'Manipulation',
      value: 'Detected',
      badgeClass: 'text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20',
    },
    {
      label: 'Distribution',
      value: 'Developing',
      badgeClass: 'text-[#aebbd0] bg-[#182332]',
    },
    {
      label: 'Candle Pattern',
      value: isBuy ? 'Bull Engulfing' : isSell ? 'Bear Engulfing' : 'Consolidation',
      badgeClass: isBuy
        ? 'text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20'
        : isSell
        ? 'text-[#ff6175] bg-[#ff6175]/10 border border-[#ff6175]/20'
        : 'text-[#aebbd0] bg-[#182332]',
    },
    {
      label: 'S/R Flip',
      value: 'Confirmed',
      badgeClass: 'text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20',
    },
    {
      label: 'Trend',
      value: isBuy ? 'Uptrend' : isSell ? 'Downtrend' : 'Neutral',
      badgeClass: isBuy
        ? 'text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20'
        : isSell
        ? 'text-[#ff6175] bg-[#ff6175]/10 border border-[#ff6175]/20'
        : 'text-[#aebbd0] bg-[#182332]',
    },
  ];

  return (
    <>
      {/* SMC / ICT Structure */}
      <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg overflow-hidden shadow-sm flex flex-col">
        <div className="h-[49px] border-b border-[#1d2a3a] flex justify-between items-center px-3.5 bg-[#0a0f17]">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-[#55a7ff]" />
            <b className="text-white text-xs font-semibold">SMC / ICT Structure</b>
          </div>
          <span className="text-[#8190a4] text-[11px] font-mono">HTF → LTF</span>
        </div>
        <div className="p-[7px_14px_12px] flex flex-col divide-y divide-[#172231]">
          {smcItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2.5 text-xs">
              <b className="text-white font-medium">{item.label}</b>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${item.badgeClass}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CRT / Price Action */}
      <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg overflow-hidden shadow-sm flex flex-col">
        <div className="h-[49px] border-b border-[#1d2a3a] flex justify-between items-center px-3.5 bg-[#0a0f17]">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#55a7ff]" />
            <b className="text-white text-xs font-semibold">CRT / Price Action</b>
          </div>
          <span className="text-[#8190a4] text-[11px] font-mono">Pattern scan</span>
        </div>
        <div className="p-[7px_14px_12px] flex flex-col divide-y divide-[#172231]">
          {crtItems.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center py-2.5 text-xs">
              <b className="text-white font-medium">{item.label}</b>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${item.badgeClass}`}>
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
