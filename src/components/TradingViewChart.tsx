import React, { useEffect, useRef, useState } from 'react';
import { Candle } from '../types';
import { SUPPORTED_TIMEFRAMES } from '../services/marketData';
import { Maximize2, BarChart2 } from 'lucide-react';

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: any) => any;
    };
  }
}

interface TradingViewChartProps {
  symbol: string;
  timeframe: string;
  setTimeframe: (tf: string) => void;
  candles: Candle[];
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol,
  timeframe,
  setTimeframe,
  candles,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tvLoaded, setTvLoaded] = useState(false);
  const [useFallbackCanvas, setUseFallbackCanvas] = useState(false);

  const cleanSym = symbol.split(':').pop() || symbol;

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    const initTv = () => {
      if (window.TradingView && containerRef.current) {
        containerRef.current.innerHTML = '';
        const tvDiv = document.createElement('div');
        tvDiv.id = `tv-widget-${Math.random().toString(36).substring(7)}`;
        tvDiv.style.width = '100%';
        tvDiv.style.height = '100%';
        containerRef.current.appendChild(tvDiv);

        const interval =
          timeframe === '1d' ? 'D' : timeframe.replace('m', '');

        try {
          new window.TradingView.widget({
            container_id: tvDiv.id,
            autosize: true,
            symbol: symbol,
            interval: interval,
            timezone: 'Etc/UTC',
            theme: 'dark',
            style: '1',
            locale: 'en',
            enable_publishing: false,
            hide_top_toolbar: false,
            allow_symbol_change: false,
            save_image: false,
            studies: [
              'RSI@tv-basicstudies',
              'MACD@tv-basicstudies',
              'BB@tv-basicstudies',
            ],
          });
          setTvLoaded(true);
        } catch {
          setUseFallbackCanvas(true);
        }
      } else {
        // Retry or fallback
        timer = setTimeout(() => {
          if (!window.TradingView) {
            setUseFallbackCanvas(true);
          } else {
            initTv();
          }
        }, 800);
      }
    };

    initTv();

    return () => {
      clearTimeout(timer);
    };
  }, [symbol, timeframe]);

  // Fallback high-fidelity canvas candlestick renderer if TV widget is unavailable
  useEffect(() => {
    if (!useFallbackCanvas || !canvasRef.current || !candles.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    const height = (canvas.height = 540);

    ctx.fillStyle = '#0d131d';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1d2a3a';
    ctx.lineWidth = 1;
    for (let y = 50; y < height; y += 70) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let x = 60; x < width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    const visibleCandles = candles.slice(-50);
    const highs = visibleCandles.map((c) => c.high);
    const lows = visibleCandles.map((c) => c.low);
    const maxP = Math.max(...highs);
    const minP = Math.min(...lows);
    const range = maxP - minP || 1;

    const candleWidth = Math.max(4, (width - 80) / visibleCandles.length - 3);

    visibleCandles.forEach((c, i) => {
      const x = 30 + i * (candleWidth + 3);
      const yOpen = height - 40 - ((c.open - minP) / range) * (height - 80);
      const yClose = height - 40 - ((c.close - minP) / range) * (height - 80);
      const yHigh = height - 40 - ((c.high - minP) / range) * (height - 80);
      const yLow = height - 40 - ((c.low - minP) / range) * (height - 80);

      const isBull = c.close >= c.open;
      ctx.strokeStyle = isBull ? '#35d49a' : '#ff6175';
      ctx.fillStyle = isBull ? '#35d49a' : '#ff6175';

      // Wick
      ctx.beginPath();
      ctx.moveTo(x + candleWidth / 2, yHigh);
      ctx.lineTo(x + candleWidth / 2, yLow);
      ctx.stroke();

      // Body
      const top = Math.min(yOpen, yClose);
      const bodyH = Math.max(2, Math.abs(yClose - yOpen));
      ctx.fillRect(x, top, candleWidth, bodyH);
    });

    // Price scale on right
    ctx.fillStyle = '#8190a4';
    ctx.font = '11px JetBrains Mono, monospace';
    for (let i = 0; i < 6; i++) {
      const p = minP + (range / 5) * i;
      const y = height - 40 - (i / 5) * (height - 80);
      ctx.fillText(p.toFixed(symbol.includes('JPY') ? 3 : p > 100 ? 2 : 5), width - 70, y + 4);
    }
  }, [useFallbackCanvas, candles, symbol]);

  return (
    <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg min-h-[580px] flex flex-col overflow-hidden shadow-sm">
      {/* Header bar */}
      <div className="h-[49px] border-b border-[#1d2a3a] flex justify-between items-center px-3.5 bg-[#0a0f17]">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#55a7ff]" />
          <b className="text-white text-xs sm:text-sm font-semibold">
            Live Market Chart <span id="sym" className="text-[#55a7ff] font-mono ml-1">{cleanSym}</span>
          </b>
        </div>

        <div className="flex items-center gap-1.5 chips">
          {SUPPORTED_TIMEFRAMES.map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-2 py-1 text-xs font-mono rounded transition-colors ${
                timeframe === tf.id
                  ? 'bg-[#1c2c40] text-white font-medium border border-[#55a7ff]/30 shadow-xs'
                  : 'text-[#8190a4] hover:text-white hover:bg-[#111a26]'
              }`}
            >
              {tf.label}
            </button>
          ))}
          <button
            onClick={() => setUseFallbackCanvas((prev) => !prev)}
            title="Toggle between TradingView Interactive widget and Canvas fallback"
            className="text-[#8190a4] hover:text-white p-1 rounded hover:bg-[#111a26] ml-1"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart container */}
      <div className="flex-1 w-full relative min-h-[530px] bg-[#070b12]">
        {!useFallbackCanvas ? (
          <div ref={containerRef} className="w-full h-full min-h-[530px]" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2">
            <canvas ref={canvasRef} className="w-full h-[530px]" />
          </div>
        )}
      </div>
    </div>
  );
};
