import React from 'react';
import {
  LayoutDashboard,
  LineChart,
  Zap,
  History,
  ShieldAlert,
  Newspaper,
  Code2,
  Briefcase,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  openPineScript: () => void;
  openPaperTrades: () => void;
  activeTradeCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  setActiveSection,
  openPineScript,
  openPaperTrades,
  activeTradeCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analysis', label: 'Analysis', icon: LineChart },
    { id: 'signals', label: 'Signals', icon: Zap },
    { id: 'backtest', label: 'Backtest', icon: History },
    { id: 'risk', label: 'Risk Manager', icon: ShieldAlert },
    { id: 'news', label: 'News', icon: Newspaper },
  ];

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <aside className="w-[235px] bg-[#090e16] border-r border-[#1d2a3a] p-[22px_14px] flex flex-col gap-6 shrink-0 h-screen sticky top-0 hidden lg:flex select-none">
      {/* Brand */}
      <div className="flex gap-2.5 items-center">
        <div className="w-[38px] h-[38px] rounded-[10px] bg-gradient-to-br from-[#3388ff] to-[#56d5b1] grid place-items-center font-extrabold text-[#070b12] text-sm shadow-lg shadow-blue-500/20">
          TA
        </div>
        <div>
          <b className="text-white text-sm font-semibold tracking-wide">Trading Analysis</b>
          <small className="block text-[#8190a4] text-[10px] font-mono mt-0.5">SMC • ICT • CRT</small>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left ${
                isActive
                  ? 'bg-[#111a26] text-white border border-[#1d2a3a]/80 shadow-sm'
                  : 'text-[#9aa8bb] hover:bg-[#111a26]/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#55a7ff]' : 'text-[#8190a4]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="my-2 border-t border-[#1d2a3a]" />

        {/* Action navigation */}
        <button
          onClick={openPaperTrades}
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium text-[#9aa8bb] hover:bg-[#111a26]/60 hover:text-white transition-all text-left"
        >
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-4 h-4 text-[#35d49a]" />
            <span>Paper Trades</span>
          </div>
          {activeTradeCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-[#35d49a]/20 text-[#35d49a] rounded-full font-bold">
              {activeTradeCount}
            </span>
          )}
        </button>

        <button
          onClick={openPineScript}
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-[#9aa8bb] hover:bg-[#111a26]/60 hover:text-white transition-all text-left"
        >
          <Code2 className="w-4 h-4 text-[#55a7ff]" />
          <span>Pine Script</span>
        </button>
      </nav>

      {/* Engine Status Card */}
      <div className="mt-auto border border-[#1d2a3a] bg-[#0d131d] p-3 rounded-lg text-[#8190a4] text-[11px]">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8190a4]/80">Engine Status</span>
        <b className="block text-white my-1.5 flex items-center gap-1.5 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#35d49a] animate-pulse"></span>
          Analysis Engine Online
        </b>
        <div className="flex items-center justify-between text-[10px] text-[#8190a4]">
          <span>Mode: Demo / Paper</span>
          <span className="font-mono text-[#55a7ff]">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
