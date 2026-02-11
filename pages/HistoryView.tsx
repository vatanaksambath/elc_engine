import React, { useState, useMemo } from 'react';
import { HistoryItem, PipelineStep, LogEntry, RunConfiguration } from '../types';
import { HistoryHeader } from '../components/history/HistoryHeader';
import { HistoryTable } from '../components/history/HistoryTable';
import { HistoryMetrics } from '../components/history/HistoryMetrics';
import { HistoryDetailHeader } from '../components/history/HistoryDetailHeader';
import { HistoryOverview } from '../components/history/HistoryOverview';
import { HistoryConfiguration } from '../components/history/HistoryConfiguration';
import { HistoryExecutionViewer } from '../components/history/HistoryExecutionViewer';
import { ResultsView } from './ResultsView';
import { HISTORY_DATA, CORPORATE_STEPS, RETAIL_STEPS } from '../utils/mockHistoryData';

const generateMockHistoryData = (run: HistoryItem, isRetail: boolean): { steps: PipelineStep[], logs: LogEntry[] } => {
    const isSuccess = run.status === 'SUCCESS';
    const failStepIndex = isSuccess ? -1 : 2; 

    // Select templates based on scope
    const template = isRetail ? RETAIL_STEPS : CORPORATE_STEPS;

    const steps: PipelineStep[] = template.map((s, index) => {
        // Safe cast as we are hydrating partial steps
        const baseStep = s as PipelineStep;
        if (isSuccess) return { ...baseStep, status: 'completed' };
        if (index < failStepIndex) return { ...baseStep, status: 'completed' };
        if (index === failStepIndex) return { ...baseStep, status: 'failed' }; 
        return { ...baseStep, status: 'pending' };
    });

    const logs: LogEntry[] = [];
    steps.forEach((step, index) => {
        if (step.status === 'pending') return;
        logs.push({ stageId: step.id, timestamp: '14:30:01', level: 'INFO', message: `Starting ${step.label}...` });
        logs.push({ stageId: step.id, timestamp: '14:30:05', level: 'PROCESS', message: `Executing core logic for ${step.label}` });
        if (index === failStepIndex && !isSuccess) {
            logs.push({ stageId: step.id, timestamp: '14:30:10', level: 'WARN', message: `Timeout waiting for resource response.` });
            logs.push({ stageId: step.id, timestamp: '14:30:12', level: 'ERROR', message: `Pipeline halted due to critical error.` });
        } else {
             logs.push({ stageId: step.id, timestamp: '14:30:15', level: 'SUCCESS', message: `${step.label} completed successfully.` });
        }
    });
    return { steps, logs };
};

export const HistoryView: React.FC = () => {
  const [selectedRun, setSelectedRun] = useState<HistoryItem | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'configuration' | 'execution' | 'results'>('overview');
  const [historyDetails, setHistoryDetails] = useState<{steps: PipelineStep[], logs: LogEntry[]} | null>(null);
  const [historyConfig, setHistoryConfig] = useState<RunConfiguration | null>(null);
  
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleRunClick = (item: HistoryItem) => {
    setSelectedRun(item);
    
    // Determine scope based on record count (mock logic)
    const isRetail = item.records > 1000000;
    
    setHistoryDetails(generateMockHistoryData(item, isRetail));
    
    // Generate mock config based on run ID to be deterministic
    setHistoryConfig({
        sourceSystem: 'Snowflake_Prod_DW',
        snapshotDate: item.date.split(' ')[0], 
        methodology: item.id.includes('15') || item.id.includes('11') ? 'stress' : 'base',
        scope: isRetail ? 'Retail Banking' : 'SME / Commercial, Large Corporate'
    });

    setActiveTab('overview');
  };

  const filteredHistory = useMemo(() => {
    return HISTORY_DATA.filter(item => {
        const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
        let matchesDate = true;
        const itemTime = new Date(item.date).getTime();
        if (startDate) {
            const startTime = new Date(startDate).setHours(0, 0, 0, 0);
            if (itemTime < startTime) matchesDate = false;
        }
        if (endDate) {
            const endTime = new Date(endDate).setHours(23, 59, 59, 999);
            if (itemTime > endTime) matchesDate = false;
        }
        return matchesStatus && matchesDate;
    });
  }, [statusFilter, startDate, endDate]);

  const metrics = useMemo(() => {
    const total = filteredHistory.length;
    const successCount = filteredHistory.filter(i => i.status === 'SUCCESS').length;
    const failedCount = filteredHistory.filter(i => i.status === 'FAILED').length;
    const rate = total ? Math.round((successCount / total) * 100) : 0;
    
    const totalRecords = filteredHistory.reduce((acc, curr) => acc + curr.records, 0);
    
    // Duration calc
    let totalSecs = 0;
    let countWithDuration = 0;
    filteredHistory.forEach(h => {
        if(h.duration && h.duration !== '-') {
             const parts = h.duration.match(/(\d+)m (\d+)s/);
             if(parts) {
                 totalSecs += parseInt(parts[1]) * 60 + parseInt(parts[2]);
                 countWithDuration++;
             }
        }
    });
    const avgSec = countWithDuration ? totalSecs / countWithDuration : 0;
    const avgDuration = `${Math.floor(avgSec/60)}m ${Math.round(avgSec%60)}s`;
    
    return { total, successCount, failedCount, rate, totalRecords, avgDuration };
  }, [filteredHistory]);

  if (selectedRun && historyDetails && historyConfig) {
    return (
      <div className="h-full flex flex-col animate-fade-in w-full">
        <HistoryDetailHeader 
            run={selectedRun} 
            onBack={() => setSelectedRun(null)} 
            activeTab={activeTab} 
            setActiveTab={setActiveTab}
        />

        {/* Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            {activeTab === 'overview' && <HistoryOverview run={selectedRun} />}
            {activeTab === 'configuration' && <HistoryConfiguration config={historyConfig} runId={selectedRun.id} />}
            {activeTab === 'execution' && (
                <HistoryExecutionViewer 
                    steps={historyDetails.steps} 
                    logs={historyDetails.logs} 
                    status={selectedRun.status} 
                    config={historyConfig}
                />
            )}
            {activeTab === 'results' && (
                <div className="flex-1 min-h-0 overflow-hidden animate-fade-in">
                    <ResultsView />
                </div>
            )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col w-full animate-fade-in">
      <HistoryHeader 
         statusFilter={statusFilter}
         setStatusFilter={setStatusFilter}
         startDate={startDate}
         endDate={endDate}
         onDateChange={(s, e) => { setStartDate(s); setEndDate(e); }}
         onClearFilters={() => { setStatusFilter('ALL'); setStartDate(''); setEndDate(''); }}
      />
      
      <HistoryMetrics metrics={metrics} />

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex-1 flex flex-col">
         <HistoryTable 
            history={filteredHistory} 
            onRunClick={handleRunClick}
            onClearFilters={() => { setStatusFilter('ALL'); setStartDate(''); setEndDate(''); }}
         />
      </div>
    </div>
  );
};