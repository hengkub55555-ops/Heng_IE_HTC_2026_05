/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  StationData,
  IndirectLaborRole,
  ShiftConfig,
  MonthlyForecastItem,
  PlanVsActualRecord,
  LineData,
} from './types/manpower';
import {
  INITIAL_LINES,
  INITIAL_PLAN_VS_ACTUAL_RECORDS,
} from './data/initialData';
import {
  calculateLineSummary,
  calculatePlantSummary,
} from './utils/ieCalculations';
import { Header, ActiveTab } from './components/Header';
import { SummaryDashboardTab } from './components/SummaryDashboardTab';
import { MasterSheetTab } from './components/MasterSheetTab';
import { MonthlyForecastTab } from './components/MonthlyForecastTab';
import { PlanVsActualTab } from './components/PlanVsActualTab';
import { LineBalanceTab } from './components/LineBalanceTab';
import { IEGuideTab } from './components/IEGuideModal';
import { ExportModal } from './components/ExportModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [activeLineId, setActiveLineId] = useState<'line-a' | 'line-b'>('line-b');
  const [isExportOpen, setIsExportOpen] = useState(false);

  // All lines package (Line A and Line B)
  const [lines, setLines] = useState<Record<'line-a' | 'line-b', LineData>>(() => {
    const saved = localStorage.getItem('ie_multilines_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_LINES;
  });

  // Plan vs Actual Records (tagged with lineId)
  const [planVsActualRecords, setPlanVsActualRecords] = useState<PlanVsActualRecord[]>(() => {
    const saved = localStorage.getItem('ie_pva_records_v3');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_PLAN_VS_ACTUAL_RECORDS;
  });

  // Persist state to LocalStorage
  useEffect(() => {
    localStorage.setItem('ie_multilines_v3', JSON.stringify(lines));
  }, [lines]);

  useEffect(() => {
    localStorage.setItem('ie_pva_records_v3', JSON.stringify(planVsActualRecords));
  }, [planVsActualRecords]);

  // Current active line object
  const currentLine = lines[activeLineId];

  // Calculate summaries for both lines
  const lineASummary = useMemo(() => {
    return calculateLineSummary(
      lines['line-a'].stations,
      lines['line-a'].idlRoles,
      lines['line-a'].shiftConfig,
      'line-a',
      lines['line-a'].name
    );
  }, [lines]);

  const lineBSummary = useMemo(() => {
    return calculateLineSummary(
      lines['line-b'].stations,
      lines['line-b'].idlRoles,
      lines['line-b'].shiftConfig,
      'line-b',
      lines['line-b'].name
    );
  }, [lines]);

  // Plant-wide consolidated metrics
  const plantSummary = useMemo(() => {
    return calculatePlantSummary(lineASummary, lineBSummary);
  }, [lineASummary, lineBSummary]);

  // Active line summary
  const currentSummary = activeLineId === 'line-a' ? lineASummary : lineBSummary;

  // Active Line Setters for sub-components
  const setStations: React.Dispatch<React.SetStateAction<StationData[]>> = (valOrFn) => {
    setLines((prev) => {
      const currentStations = prev[activeLineId].stations;
      const nextStations = typeof valOrFn === 'function' ? valOrFn(currentStations) : valOrFn;
      return {
        ...prev,
        [activeLineId]: {
          ...prev[activeLineId],
          stations: nextStations,
        },
      };
    });
  };

  const setIdlRoles: React.Dispatch<React.SetStateAction<IndirectLaborRole[]>> = (valOrFn) => {
    setLines((prev) => {
      const currentIdl = prev[activeLineId].idlRoles;
      const nextIdl = typeof valOrFn === 'function' ? valOrFn(currentIdl) : valOrFn;
      return {
        ...prev,
        [activeLineId]: {
          ...prev[activeLineId],
          idlRoles: nextIdl,
        },
      };
    });
  };

  const setShiftConfig: React.Dispatch<React.SetStateAction<ShiftConfig>> = (valOrFn) => {
    setLines((prev) => {
      const currentConf = prev[activeLineId].shiftConfig;
      const nextConf = typeof valOrFn === 'function' ? valOrFn(currentConf) : valOrFn;
      return {
        ...prev,
        [activeLineId]: {
          ...prev[activeLineId],
          shiftConfig: nextConf,
        },
      };
    });
  };

  const setForecastData: React.Dispatch<React.SetStateAction<Partial<MonthlyForecastItem>[]>> = (
    valOrFn
  ) => {
    setLines((prev) => {
      const currentF = prev[activeLineId].forecastData;
      const nextF = typeof valOrFn === 'function' ? valOrFn(currentF) : valOrFn;
      return {
        ...prev,
        [activeLineId]: {
          ...prev[activeLineId],
          forecastData: nextF,
        },
      };
    });
  };

  const setLineName = (name: string) => {
    setLines((prev) => ({
      ...prev,
      [activeLineId]: {
        ...prev[activeLineId],
        name,
      },
    }));
  };

  // Explicit Save All trigger
  const handleSaveAll = () => {
    localStorage.setItem('ie_multilines_v3', JSON.stringify(lines));
    localStorage.setItem('ie_pva_records_v3', JSON.stringify(planVsActualRecords));
  };

  // Reset to default dataset
  const handleResetData = () => {
    if (
      window.confirm(
        'ต้องการรีเซ็ตข้อมูลทั้ง Line A และ Line B เป็นค่าเริ่มต้นจากมาตรฐาน IE หรือไม่?'
      )
    ) {
      setLines(INITIAL_LINES);
      setPlanVsActualRecords(INITIAL_PLAN_VS_ACTUAL_RECORDS);
      localStorage.removeItem('ie_multilines_v3');
      localStorage.removeItem('ie_pva_records_v3');
    }
  };

  // Switch line from Dashboard
  const handleSelectLineFromDashboard = (
    lineId: 'line-a' | 'line-b',
    targetTab: ActiveTab = 'master'
  ) => {
    setActiveLineId(lineId);
    setActiveTab(targetTab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeLineId={activeLineId}
        setActiveLineId={setActiveLineId}
        onOpenExport={() => setIsExportOpen(true)}
        onResetData={handleResetData}
        lineAName={lines['line-a'].name}
        lineBName={lines['line-b'].name}
        lineAUph={lineASummary.targetUph}
        lineBUph={lineBSummary.targetUph}
      />

      {/* Print-Only Header */}
      <div className="hidden print-only p-6 border-b border-slate-300 mb-6 bg-white text-slate-900">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              รายงานวิเคราะห์และวางแผนกำลังคน (IE Manpower Master & Capacity Report)
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              โรงงานผลิตเครื่องใช้ไฟฟ้า: {lines['line-a'].name} & {lines['line-b'].name}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
            พิมพ์วันที่: {new Date().toLocaleDateString('th-TH')}
          </div>
        </div>
      </div>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* 1. Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <SummaryDashboardTab
            lines={lines}
            setLines={setLines}
            plantSummary={plantSummary}
            planVsActualRecords={planVsActualRecords}
            setPlanVsActualRecords={setPlanVsActualRecords}
            onSelectLine={handleSelectLineFromDashboard}
            onSaveAll={handleSaveAll}
          />
        )}

        {/* 2. Master Manpower Tab */}
        {activeTab === 'master' && (
          <MasterSheetTab
            stations={currentLine.stations}
            setStations={setStations}
            idlRoles={currentLine.idlRoles}
            setIdlRoles={setIdlRoles}
            shiftConfig={currentLine.shiftConfig}
            setShiftConfig={setShiftConfig}
            summary={currentSummary}
            lineName={currentLine.name}
            setLineName={setLineName}
          />
        )}

        {/* 3. Monthly Forecast Tab */}
        {activeTab === 'forecast' && (
          <MonthlyForecastTab
            stations={currentLine.stations}
            idlRoles={currentLine.idlRoles}
            shiftConfig={currentLine.shiftConfig}
            forecastData={currentLine.forecastData}
            setForecastData={setForecastData}
            summary={currentSummary}
            lines={lines}
            lineASummary={lineASummary}
            lineBSummary={lineBSummary}
            activeLineId={activeLineId}
            setActiveLineId={setActiveLineId}
          />
        )}

        {/* 4. Plan vs Actual Tab */}
        {activeTab === 'plan_vs_actual' && (
          <PlanVsActualTab
            records={planVsActualRecords}
            setRecords={setPlanVsActualRecords}
            activeLineId={activeLineId}
            lines={lines}
          />
        )}

        {/* 5. Line Balancing Tab */}
        {activeTab === 'balancing' && (
          <LineBalanceTab
            stations={currentLine.stations}
            setStations={setStations}
            summary={currentSummary}
            shiftConfig={currentLine.shiftConfig}
          />
        )}

        {/* 6. IE Standards Guide */}
        {activeTab === 'guide' && <IEGuideTab />}
      </main>

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        lines={lines}
        activeLineId={activeLineId}
        plantSummary={plantSummary}
        planVsActualRecords={planVsActualRecords}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-4 lg:px-8 text-center text-xs text-slate-500 no-print mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>IE Manpower Master & Capacity Planner · Multi-Line Dashboard & IE Methodology</span>
          <div className="flex items-center gap-3">
            <span>Plant DL: {plantSummary.totalPlantDl} คน</span>
            <span aria-hidden="true">·</span>
            <span>Plant IDL: {plantSummary.totalPlantIdl} คน</span>
            <span aria-hidden="true">·</span>
            <span>Grand Total: {plantSummary.grandPlantTotalMp} คน</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
