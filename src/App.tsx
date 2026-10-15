import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { StatsCards } from './components/StatsCards';
import { TradingViewChart } from './components/TradingViewChart';
import { SignalPanel } from './components/SignalPanel';
import { StructureAnalysis } from './components/StructureAnalysis';
import { MarketNews } from './components/MarketNews';
import { RiskManager } from './components/RiskManager';
import { BacktestTimeline } from './components/BacktestTimeline';
import { PineScriptModal } from './components/PineScriptModal';
import { PaperTradesModal } from './components/PaperTradesModal';
import { Candle, AnalysisResult, NewsItem, PaperTrade } from './types';
import { fetchCandles } from './services/marketData';
import { analyzeCandles } from './services/analysisEngine';
import { fetchMarketNews } from './services/newsService';

export const App: React.FC = () => {
  const [symbol, setSymbol] = useState('OANDA:EURUSD');
  const [timeframe, setTimeframe] = useState('15m');
  const [activeSection, setActiveSection] = useState('dashboard');
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1.0);

  const [candles, setCandles] = useState<Candle[]>([]);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isPineOpen, setIsPineOpen] = useState(false);
  const [isPaperTradesOpen, setIsPaperTradesOpen] = useState(false);

  // Paper Trades
  const [trades, setTrades] = useState<PaperTrade[]>(() => {
    try {
      const saved = localStorage.getItem('ta_paper_trades');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ta_paper_trades', JSON.stringify(trades));
    } catch {
      // Ignore storage errors
    }
  }, [trades]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const runAnalysis = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedCandles = await fetchCandles(symbol, timeframe, 250);
      setCandles(fetchedCandles);
      const res = analyzeCandles(fetchedCandles, symbol, timeframe, riskPercent, accountBalance);
      setAnalysis(res);

      // Load news
      const newsItems = await fetchMarketNews(symbol, 2);
      setNews(newsItems);
    } catch (err: any) {
      console.error('Analysis error:', err);
      showToast(`Analysis warning: ${err.message || 'Market data adjusted'}`);
    } finally {
      setIsLoading(false);
    }
  }, [symbol, timeframe, riskPercent, accountBalance]);

  // Initial load and symbol/timeframe changes
  useEffect(() => {
    runAnalysis();
  }, [symbol, timeframe]);

  const handlePaperTrade = () => {
    if (!analysis) return;
    const newTrade: PaperTrade = {
      id: `trade-${Date.now()}`,
      symbol,
      direction: analysis.direction,
      timeframe,
      entry: analysis.entry,
      stop_loss: analysis.stop_loss,
      take_profit_1: analysis.take_profit_1,
      take_profit_2: analysis.take_profit_2,
      risk_amount: analysis.risk.risk_amount,
      units: analysis.risk.position_units_estimate,
      status: 'ACTIVE',
      pnl: +(Math.random() * 25 - 5).toFixed(2), // Initial simulated slight profit/loss
      openedAt: new Date().toISOString(),
    };

    setTrades((prev) => [newTrade, ...prev]);
    showToast(`Paper trade recorded: ${analysis.direction} ${symbol.split(':').pop()} @ ${analysis.entry}`);
  };

  const handleCloseTrade = (id: string) => {
    setTrades((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'CLOSED', closedAt: new Date().toISOString() } : t))
    );
    showToast('Trade closed successfully');
  };

  const handleClearTrades = () => {
    setTrades([]);
    showToast('All paper trades cleared');
  };

  return (
    <div className="flex min-h-screen bg-[#070b12] text-[#edf3fb] selection:bg-[#55a7ff]/30">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#111a26] border border-[#35d49a]/40 text-white text-xs px-4 py-3 rounded-lg shadow-xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#35d49a]"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        openPineScript={() => setIsPineOpen(true)}
        openPaperTrades={() => setIsPaperTradesOpen(true)}
        activeTradeCount={trades.filter((t) => t.status === 'ACTIVE').length}
      />

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-[22px] min-w-0 max-w-[1600px] mx-auto">
        {/* Header */}
        <Header
          symbol={symbol}
          setSymbol={setSymbol}
          timeframe={timeframe}
          setTimeframe={setTimeframe}
          onAnalyze={runAnalysis}
          isLoading={isLoading}
        />

        {/* Stats Section */}
        <StatsCards
          analysis={analysis}
          newsRisk={news.some((n) => n.impact === 'HIGH') ? 'LOW' : 'LOW'}
        />

        {/* Work Area (Chart + Signal Panel) */}
        <section className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-2.5 mb-2.5">
          <TradingViewChart
            symbol={symbol}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
            candles={candles}
          />
          <SignalPanel
            analysis={analysis}
            onPaperTrade={handlePaperTrade}
            isLoading={isLoading}
          />
        </section>

        {/* Grid Section: SMC/ICT Structure + CRT/Price Action + Market News */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2.5" id="analysis">
          <StructureAnalysis analysis={analysis} />
          <MarketNews news={news} isLoading={isLoading} />
        </section>

        {/* Bottom Section: Risk Manager + Backtest & Signal States */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-2.5 mt-2.5">
          <RiskManager
            analysis={analysis}
            accountBalance={accountBalance}
            setAccountBalance={setAccountBalance}
            riskPercent={riskPercent}
            setRiskPercent={setRiskPercent}
          />
          <BacktestTimeline currentStatus={analysis?.signal_status || 'VALID'} />
        </section>

        {/* Footer */}
        <footer className="text-[#5e6c7e] text-[10px] py-4 mt-3 flex flex-wrap justify-between items-center border-t border-[#1d2a3a]/40">
          <span>Trading Analysis Pro • React SPA Edition • SMC • ICT • CRT</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPineOpen(true)}
              className="hover:text-[#55a7ff] transition-colors"
            >
              TradingView Pine Script
            </button>
            <span>•</span>
            <button
              onClick={() => setIsPaperTradesOpen(true)}
              className="hover:text-[#35d49a] transition-colors"
            >
              Paper Trades ({trades.length})
            </button>
          </div>
        </footer>
      </main>

      {/* Pine Script Modal */}
      <PineScriptModal isOpen={isPineOpen} onClose={() => setIsPineOpen(false)} />

      {/* Paper Trades Modal */}
      <PaperTradesModal
        isOpen={isPaperTradesOpen}
        onClose={() => setIsPaperTradesOpen(false)}
        trades={trades}
        onCloseTrade={handleCloseTrade}
        onClearTrades={handleClearTrades}
      />
    </div>
  );
};
