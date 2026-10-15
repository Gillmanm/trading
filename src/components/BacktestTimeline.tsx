import React from 'react';
import { History, CheckCircle2 } from 'lucide-react';
import { SignalStatus } from '../types';

interface BacktestTimelineProps {
  currentStatus: SignalStatus;
}

export const BacktestTimeline: React.FC<BacktestTimelineProps> = ({ currentStatus }) => {
  const states = [
    { id: 'SETUP_FORMING', label: 'SETUP_FORMING', active: true },
    { id: 'WAITING_FOR_ENTRY', label: 'WAITING_FOR_ENTRY', active: true },
    { id: 'ENTRY_TRIGGERED', label: 'ENTRY_TRIGGERED', active: currentStatus === 'VALID' },
    { id: 'TARGET_1', label: 'TARGET_1', active: false },
    { id: 'TARGET_2', label: 'TARGET_2', active: false },
    { id: 'EXPIRED_SL', label: 'EXPIRED / SL', active: false },
  ];

  return (
    <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg overflow-hidden shadow-sm flex flex-col" id="backtest">
      <div className="h-[49px] border-b border-[#1d2a3a] flex justify-between items-center px-3.5 bg-[#0a0f17]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#55a7ff]" />
          <b className="text-white text-xs font-semibold">Backtest & Signal States</b>
        </div>
        <span className="text-[#8190a4] text-[11px] font-mono">Engine preview</span>
      </div>

      <div className="p-3.5 flex flex-col gap-3">
        {/* Timeline chips */}
        <div className="flex flex-wrap gap-1.5 timeline">
          {states.map((st) => (
            <span
              key={st.id}
              className={`text-[10px] font-mono px-2.5 py-1.5 rounded-md flex items-center gap-1.5 border transition-all ${
                st.active
                  ? 'bg-[#182332] text-[#35d49a] border-[#35d49a]/30 font-semibold shadow-xs'
                  : 'bg-[#111a26] text-[#78879b] border-transparent'
              }`}
            >
              {st.active && <CheckCircle2 className="w-3 h-3 text-[#35d49a]" />}
              <span>{st.label}</span>
            </span>
          ))}
        </div>

        <p className="text-[#8190a4] text-[11px] leading-relaxed m-0 font-normal">
          Production architecture: normalized market data → HTF structure → liquidity → SMC → ICT → CRT → price action → news → confluence → risk → deterministic signal.
        </p>

        <div className="flex items-center gap-3 pt-2 text-[10px] text-[#5e6c7e] border-t border-[#1d2a3a]">
          <span>Strategy: Institutional Multi-Timeframe Confluence</span>
          <span>•</span>
          <span>Target R:R: &gt;= 1.5</span>
        </div>
      </div>
    </div>
  );
};
