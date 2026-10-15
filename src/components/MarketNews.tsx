import React from 'react';
import { NewsItem } from '../types';
import { Newspaper, ExternalLink } from 'lucide-react';

interface MarketNewsProps {
  news: NewsItem[];
  isLoading: boolean;
}

export const MarketNews: React.FC<MarketNewsProps> = ({ news, isLoading }) => {
  return (
    <div className="bg-[#0d131d] border border-[#1d2a3a] rounded-lg overflow-hidden shadow-sm flex flex-col" id="news">
      <div className="h-[49px] border-b border-[#1d2a3a] flex justify-between items-center px-3.5 bg-[#0a0f17]">
        <div className="flex items-center gap-2">
          <Newspaper className="w-4 h-4 text-[#55a7ff]" />
          <b className="text-white text-xs font-semibold">Market News</b>
        </div>
        <span className="text-[#8190a4] text-[11px] font-mono">
          {news.length > 0 ? `${news.length} headlines` : 'Integration ready'}
        </span>
      </div>

      <div className="p-3.5 flex flex-col gap-3 text-xs overflow-y-auto max-h-[380px]">
        {/* News impact badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded text-[#f6c85f] bg-[#f6c85f]/10 border border-[#f6c85f]/20 font-semibold">
            HIGH-IMPACT FILTER
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded text-[#35d49a] bg-[#35d49a]/10 border border-[#35d49a]/20 font-semibold">
            LOW CURRENT RISK
          </span>
        </div>

        {isLoading ? (
          <div className="text-[#8190a4] text-xs py-4 text-center">Loading news headlines...</div>
        ) : news.length > 0 ? (
          news.slice(0, 4).map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-lg bg-[#111a26]/50 border border-[#1d2a3a]/60 hover:border-[#2b3e55] transition-colors"
            >
              <div className="flex justify-between items-start gap-2 mb-1">
                <b className="text-white text-xs font-medium leading-snug">{item.headline}</b>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#8190a4] hover:text-[#55a7ff] shrink-0 mt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <p className="text-[#8190a4] text-[11px] leading-relaxed mb-1.5">{item.summary}</p>
              <div className="flex items-center justify-between text-[10px] text-[#5e6c7e]">
                <span>{item.source}</span>
                <span>
                  {typeof item.datetime === 'number'
                    ? new Date(item.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : item.datetime}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-[#8190a4] text-[11px] leading-relaxed">
            <p className="mb-2">
              Connect Finnhub, NewsAPI or Alpha Vantage through the backend. The production engine pauses or reduces signals inside a configurable news buffer.
            </p>
            <p>News-aware volatility adjustment is enabled in the UI.</p>
          </div>
        )}
      </div>
    </div>
  );
};
