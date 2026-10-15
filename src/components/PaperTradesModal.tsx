import React from 'react';
import { PaperTrade } from '../types';
import { X, Trash2, ArrowUpRight, ArrowDownRight, Briefcase } from 'lucide-react';

interface PaperTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: PaperTrade[];
  onCloseTrade: (id: string) => void;
  onClearTrades: () => void;
}

export const PaperTradesModal: React.FC<PaperTradesModalProps> = ({
  isOpen,
  onClose,
  trades,
  onCloseTrade,
  onClearTrades,
}) => {
  if (!isOpen) return null;

  const totalPnl = trades.reduce((acc, t) => acc + t.pnl, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        <div className="h-12 border-b border-[#1d2a3a] flex justify-between items-center px-4 bg-[#0a0f17]">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-[#35d49a]" />
            <b className="text-white text-sm font-semibold">Paper Trading Ledger</b>
            <span className="text-xs text-[#8190a4]">({trades.length} trades)</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xs">
              <span className="text-[#8190a4] mr-1.5">Total PnL:</span>
              <span
                className={`font-mono font-bold ${
                  totalPnl >= 0 ? 'text-[#35d49a]' : 'text-[#ff6175]'
                }`}
              >
                ${totalPnl.toFixed(2)}
              </span>
            </div>
            {trades.length > 0 && (
              <button
                onClick={onClearTrades}
                title="Clear all trades"
                className="text-[#ff6175] hover:text-[#ff8595] p-1.5 rounded hover:bg-[#111a26]"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#8190a4] hover:text-white p-1 rounded-md hover:bg-[#111a26]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {trades.length === 0 ? (
            <div className="text-center py-12 text-[#8190a4] text-xs">
              <p className="mb-2">No paper trades recorded yet.</p>
              <p>Click "Paper Trade Signal" in the Signal Engine to simulate an order.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {trades.map((t) => (
                <div
                  key={t.id}
                  className="bg-[#111a26] border border-[#1d2a3a] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono flex items-center gap-1 ${
                        t.direction === 'BUY'
                          ? 'bg-[#35d49a]/15 text-[#35d49a] border border-[#35d49a]/30'
                          : 'bg-[#ff6175]/15 text-[#ff6175] border border-[#ff6175]/30'
                      }`}
                    >
                      {t.direction === 'BUY' ? (
                        <ArrowUpRight className="w-3 h-3" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3" />
                      )}
                      {t.direction}
                    </span>
                    <div>
                      <b className="text-white font-medium">{t.symbol}</b>
                      <span className="text-[#8190a4] font-mono ml-2 text-[11px]">{t.timeframe}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-[11px] font-mono text-[#edf3fb]">
                    <div>
                      <span className="text-[#8190a4] text-[10px] block">Entry</span>
                      <span>{t.entry}</span>
                    </div>
                    <div>
                      <span className="text-[#ff6175] text-[10px] block">SL</span>
                      <span>{t.stop_loss}</span>
                    </div>
                    <div>
                      <span className="text-[#35d49a] text-[10px] block">TP 1</span>
                      <span>{t.take_profit_1}</span>
                    </div>
                    <div>
                      <span className="text-[#8190a4] text-[10px] block">Units</span>
                      <span>{t.units}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-[#8190a4] block">PnL</span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          t.pnl >= 0 ? 'text-[#35d49a]' : 'text-[#ff6175]'
                        }`}
                      >
                        {t.pnl >= 0 ? `+$${t.pnl.toFixed(2)}` : `-$${Math.abs(t.pnl).toFixed(2)}`}
                      </span>
                    </div>

                    {t.status === 'ACTIVE' ? (
                      <button
                        onClick={() => onCloseTrade(t.id)}
                        className="bg-[#182332] hover:bg-[#202f43] text-white text-[10px] px-2.5 py-1 rounded border border-[#1d2a3a]"
                      >
                        Close
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#8190a4] bg-[#070b12] px-2 py-0.5 rounded">
                        {t.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
