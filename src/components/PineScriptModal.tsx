import React, { useState } from 'react';
import { X, Copy, Check, Code2 } from 'lucide-react';

interface PineScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PINE_SCRIPT_CODE = `//@version=6
indicator("AI Scalper - Gemini Bridge", overlay=true, max_labels_count=500)

apiSecret = input.string("CHANGE_ME", "Webhook Secret")
minConfidence = input.float(75, "Minimum AI Confidence", minval=50, maxval=100)
useMtf = input.bool(true, "Use M15/M5 Context")

ema20 = ta.ema(close, 20)
ema50 = ta.ema(close, 50)
rsi = ta.rsi(close, 14)
atr = ta.atr(14)
m5Close = request.security(syminfo.tickerid, "5", close)
m15Close = request.security(syminfo.tickerid, "15", close)
m5Ema20 = request.security(syminfo.tickerid, "5", ta.ema(close, 20))
m15Ema20 = request.security(syminfo.tickerid, "15", ta.ema(close, 20))
bullContext = not useMtf or (m15Close > m15Ema20 and m5Close > m5Ema20)
bearContext = not useMtf or (m15Close < m15Ema20 and m5Close < m5Ema20)
bullish = close > ema20 and ema20 > ema50 and rsi >= 55 and bullContext
bearish = close < ema20 and ema20 < ema50 and rsi <= 45 and bearContext
signal = bullish ? "BUY_CANDIDATE" : bearish ? "SELL_CANDIDATE" : "WAIT"
plot(ema20, "EMA 20")
plot(ema50, "EMA 50")
plotshape(bullish, title="BUY candidate", style=shape.triangleup, location=location.belowbar, text="AI BUY")
plotshape(bearish, title="SELL candidate", style=shape.triangledown, location=location.abovebar, text="AI SELL")
payload = '{"secret":"' + apiSecret + '","symbol":"' + syminfo.tickerid + '","timeframe":"' + timeframe.period + '","action_candidate":"' + signal + '","price":' + str.tostring(close) + ',"open":' + str.tostring(open) + ',"high":' + str.tostring(high) + ',"low":' + str.tostring(low) + ',"ema20":' + str.tostring(ema20) + ',"ema50":' + str.tostring(ema50) + ',"rsi14":' + str.tostring(rsi) + ',"atr14":' + str.tostring(atr) + ',"m5_close":' + str.tostring(m5Close) + ',"m15_close":' + str.tostring(m15Close) + '}'
alertcondition(bullish, "AI BUY candidate", "AI BUY candidate")
alertcondition(bearish, "AI SELL candidate", "AI SELL candidate")
if barstate.isconfirmed and (bullish or bearish)
    alert(payload, alert.freq_once_per_bar_close)`;

export const PineScriptModal: React.FC<PineScriptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(PINE_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="h-12 border-b border-[#1d2a3a] flex justify-between items-center px-4 bg-[#0a0f17]">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#55a7ff]" />
            <b className="text-white text-sm font-semibold">Pine Script v6 (TradingView Scalper)</b>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="text-xs bg-[#111a26] hover:bg-[#182332] text-white px-2.5 py-1.5 rounded-md border border-[#1d2a3a] flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#35d49a]" /> : <Copy className="w-3.5 h-3.5 text-[#55a7ff]" />}
              <span>{copied ? 'Copied!' : 'Copy Script'}</span>
            </button>
            <button
              onClick={onClose}
              className="text-[#8190a4] hover:text-white p-1 rounded-md hover:bg-[#111a26]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1 font-mono text-xs text-[#aebbd0] bg-[#070b12] leading-relaxed">
          <pre className="whitespace-pre-wrap">{PINE_SCRIPT_CODE}</pre>
        </div>

        <div className="p-3 border-t border-[#1d2a3a] bg-[#0a0f17] text-[11px] text-[#8190a4] flex justify-between items-center">
          <span>Paste this into TradingView Pine Editor → Add to chart → Configure Webhook</span>
          <span className="text-[#55a7ff]">TradingView v6 Compatible</span>
        </div>
      </div>
    </div>
  );
};
