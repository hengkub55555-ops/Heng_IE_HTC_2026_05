import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  TrendingUp,
  GitCompare,
  SlidersHorizontal,
  BookOpen,
  Download,
  Printer,
  RotateCcw,
  Layers,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'master' | 'forecast' | 'plan_vs_actual' | 'balancing' | 'guide';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeLineId: 'line-a' | 'line-b';
  setActiveLineId: (lineId: 'line-a' | 'line-b') => void;
  onOpenExport: () => void;
  onResetData: () => void;
  lineAName: string;
  lineBName: string;
  lineAUph?: number;
  lineBUph?: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activeLineId,
  setActiveLineId,
  onOpenExport,
  onResetData,
  lineAName,
  lineBName,
  lineAUph,
  lineBUph,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard สรุป',
      icon: <LayoutDashboard className="w-4 h-4 mr-1.5 inline" />,
    },
    {
      id: 'master',
      label: 'Master Manpower',
      icon: <FileSpreadsheet className="w-4 h-4 mr-1.5 inline" />,
    },
    {
      id: 'forecast',
      label: 'Monthly Forecast',
      icon: <TrendingUp className="w-4 h-4 mr-1.5 inline" />,
    },
    {
      id: 'plan_vs_actual',
      label: 'Plan vs Actual',
      icon: <GitCompare className="w-4 h-4 mr-1.5 inline" />,
    },
    {
      id: 'balancing',
      label: 'Line Balancing',
      icon: <SlidersHorizontal className="w-4 h-4 mr-1.5 inline" />,
    },
    {
      id: 'guide',
      label: 'IE Guide',
      icon: <BookOpen className="w-4 h-4 mr-1.5 inline" />,
    },
  ];

  const currentLineLabel = activeLineId === 'line-a' ? lineAName : lineBName;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3 no-print">
      <div className="max-w-7xl mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">
        {/* Zone 1: Single text element wordmark + Line Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm">
              IE
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block">
                IE Manpower Master & Capacity Planner
              </span>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{activeTab === 'dashboard' ? 'โรงงานรวม (Line A + Line B)' : currentLineLabel}</span>
                <span aria-hidden="true">·</span>
                <span>IE Industrial Engineering</span>
              </div>
            </div>
          </div>

          {/* Line Switcher (Visible in all tabs) */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-lg ml-2">
            <button
              onClick={() => setActiveLineId('line-a')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeLineId === 'line-a'
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>Line A</span>
              {lineAUph !== undefined && (
                <span className={`text-[10px] font-mono px-1 rounded ${activeLineId === 'line-a' ? 'bg-cyan-950/40 text-slate-950 font-bold' : 'bg-slate-800 text-cyan-300'}`}>
                  {lineAUph} UPH
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveLineId('line-b')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                activeLineId === 'line-b'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Line B</span>
              {lineBUph !== undefined && (
                <span className={`text-[10px] font-mono px-1 rounded ${activeLineId === 'line-b' ? 'bg-amber-950/40 text-slate-950 font-bold' : 'bg-slate-800 text-amber-300'}`}>
                  {lineBUph} UPH
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links / Segmented Control */}
        <nav className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2 self-end xl:self-auto">
          <button
            onClick={onResetData}
            title="รีเซ็ตเป็นข้อมูลมาตรฐาน (Reset to Default)"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/70 border border-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handlePrint}
            title="พิมพ์รายงาน (Print / Save PDF)"
            className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Print Report</span>
          </button>
          <button
            onClick={onOpenExport}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>
    </header>
  );
};
