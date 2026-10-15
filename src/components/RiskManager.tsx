import React, { useState } from 'react';
import { AnalysisResult } from '../types';
import { Calculator, DollarSign, Percent } from 'lucide-react';

interface RiskManagerProps {
  analysis: AnalysisResult | null;
  accountBalance: number;
  setAccountBalance: (val: number) => void;
  riskPercent: number;
  setRiskPercent: (val: number) => void;
}

export const RiskManager: React.FC<RiskManagerProps> = ({
  analysis,
  accountBalance,
  setAccountBalance,
  riskPercent,
  setRiskPercent,
}) => {
  const [balanceInput, setBalanceInput] = useState(String(accountBalance));
  const [riskInput, setRiskInput] = useState(String(riskPercent));

  const handleCalculate = () => {
    const b = parseFloat(balanceInput) || 10000;
    const r = parseFloat(riskInput) || 1.0;
    setAccountBalance(b);
    setRiskPercent(r);
  };

  const calculatedRiskAmount = (accountBalance * riskPercent) / 100;
  
  // Risk per unit in price
  let priceRisk = 0;
  if (analysis && analysis.entry && analysis.stop_loss) {
    priceRisk = Math.abs(analysis.entry - analysis.stop_loss);
  }
  const unitsEstimate = priceRisk > 0 ? (calculatedRiskAmount / priceRisk).toFixed(2) : '--';

  return (
    <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg overflow-hidden shadow-sm flex flex-col" id="risk">
      <div className="h-[49px] border-b border-[#1d2a3a] flex justify-between items-center px-3.5 bg-[#0a0f17]">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#55a7ff]" />
          <b className="text-white text-xs font-semibold">Risk Manager</b>
        </div>
        <span className="text-[#8190a4] text-[11px] font-mono">Paper trading</span>
      </div>

      <div className="p-3.5 flex flex-wrap gap-2.5 items-end">
        <label className="flex flex-col gap-1 text-[#8190a4] text-[10px] font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-[#55a7ff]" />
            Balance
          </span>
          <input
            id="bal"
            type="number"
            value={balanceInput}
            onChange={(e) => setBalanceInput(e.target.value)}
            className="bg-[#111a26] border border-[#1d2a3a] text-white text-xs px-3 py-2 rounded-md focus:outline-none focus:border-[#55a7ff] w-28 font-mono"
          />
        </label>

        <label className="flex flex-col gap-1 text-[#8190a4] text-[10px] font-medium uppercase tracking-wider">
          <span className="flex items-center gap-1">
            <Percent className="w-3 h-3 text-[#55a7ff]" />
            Risk %
          </span>
          <input
            id="rp"
            type="number"
            step="0.1"
            value={riskInput}
            onChange={(e) => setRiskInput(e.target.value)}
            className="bg-[#111a26] border border-[#1d2a3a] text-white text-xs px-3 py-2 rounded-md focus:outline-none focus:border-[#55a7ff] w-24 font-mono"
          />
        </label>

        {/* Quick presets */}
        <div className="flex gap-1 mb-0.5">
          {[0.5, 1.0, 2.0].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => {
                setRiskInput(String(preset));
                setRiskPercent(preset);
              }}
              className="text-[10px] font-mono px-2 py-1 rounded bg-[#111a26] hover:bg-[#182332] text-[#8190a4] hover:text-white border border-[#1d2a3a]"
            >
              {preset}%
            </button>
          ))}
        </div>

        <button
          id="calc"
          onClick={handleCalculate}
          className="bg-[#111a26] hover:bg-[#182332] border border-[#1d2a3a] text-white text-xs font-medium px-4 py-2 rounded-md transition-all ml-auto"
        >
          Calculate
        </button>
      </div>

      <div className="m-[0_14px_14px] p-3 bg-[#111a26] border border-[#1d2a3a]/60 rounded-lg flex flex-col gap-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#8190a4]">Suggested risk:</span>
          <b id="risk" className="text-[#35d49a] text-base font-mono">
            ${calculatedRiskAmount.toFixed(2)}
          </b>
        </div>
        {analysis && (
          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[#1d2a3a]">
            <span className="text-[#8190a4]">Estimated Position Size:</span>
            <span className="text-white font-mono">{unitsEstimate} units</span>
          </div>
        )}
        <span className="text-[#8190a4] text-[10px] mt-1 leading-normal">
          Position sizing aligns with conservative 1-2% risk-of-ruin protocols.
        </span>
      </div>
    </div>
  );
};
