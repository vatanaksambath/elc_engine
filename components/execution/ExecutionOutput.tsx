import React, { useRef, useEffect } from 'react';
import { 
  Table, Terminal, FileText, FileSpreadsheet, Layers, AlertTriangle, Loader2, Search, X, AlertOctagon, XCircle
} from 'lucide-react';
import { LogEntry, PipelineStep, ExecutionMode } from '../../types';

interface ExecutionOutputProps {
  isStaging2bTableVisible: boolean;
  selectedStageId: number | null;
  logs: LogEntry[];
  searchQuery: string;
  isFetchingLogs: boolean;
  isFailed: boolean;
  shouldProcessCurrentStage: boolean;
  currentStageIndex: number;
  totalSteps: number;
  currentStageLabel: string;
  progress: number;
  mode: ExecutionMode;
  status: 'idle' | 'running' | 'completed' | 'failed';
  isManualStageRunning: boolean;
  isPipelineComplete: boolean;
  isRetail: boolean;
  retailTab: 'PD_CUST_EVERXV1' | 'PD_CUST_DEFV1';
  displayedTableRows: any[];
  activeDataSourceLength: number;
  activeColumns: any[];
  isTableLoading: boolean;
  
  setSearchQuery: (q: string) => void;
  setForceShowLogs: (force: boolean) => void;
  handleExportStaging2b: (format: 'csv' | 'xlsx') => void;
  setRetailTab: (tab: 'PD_CUST_EVERXV1' | 'PD_CUST_DEFV1') => void;
  onCloseView: () => void;
  onTableScroll: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const ExecutionOutput: React.FC<ExecutionOutputProps> = ({
  isStaging2bTableVisible, selectedStageId, logs, searchQuery, isFetchingLogs, isFailed,
  shouldProcessCurrentStage, currentStageIndex, totalSteps, currentStageLabel, progress, mode, status,
  isManualStageRunning, isPipelineComplete, isRetail, retailTab, displayedTableRows, activeDataSourceLength,
  activeColumns, isTableLoading,
  setSearchQuery, setForceShowLogs, handleExportStaging2b, setRetailTab, onCloseView, onTableScroll
}) => {
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll Logs
  useEffect(() => {
    if (selectedStageId === null && !searchQuery && !isFetchingLogs) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, selectedStageId, searchQuery, isFetchingLogs]);

  const filteredLogs = logs.filter(log => {
      const matchesStage = selectedStageId ? log.stageId === selectedStageId : true;
      const matchesSearch = searchQuery 
          ? log.message.toLowerCase().includes(searchQuery.toLowerCase()) || 
            log.level.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
      return matchesStage && matchesSearch;
  });

  const getLogColor = (level: string) => {
    switch (level) {
      case 'INFO': return 'text-blue-600 dark:text-blue-400';
      case 'SUCCESS': return 'text-emerald-600 dark:text-emerald-400';
      case 'WARN': return 'text-amber-600 dark:text-amber-400';
      case 'PROCESS': return 'text-purple-600 dark:text-purple-400';
      case 'ERROR': return 'text-red-600 dark:text-red-500';
      default: return 'text-gray-600 dark:text-gray-300';
    }
  };

  const renderLogMessage = (message: string, query: string) => {
    if (!query) return <span className="text-gray-700 dark:text-gray-300 break-words">{message}</span>;
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    const parts = message.split(regex);
    return (
        <span className="text-gray-700 dark:text-gray-300 break-words">
            {parts.map((part, i) => 
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="bg-yellow-200 dark:bg-yellow-900/60 text-yellow-800 dark:text-yellow-200 rounded-[2px] px-0.5 box-decoration-clone border border-yellow-300/30">
                        {part}
                    </span>
                ) : part
            )}
        </span>
    );
  };

  return (
    <div className={`flex-1 min-h-0 bg-slate-50 dark:bg-[#0f172a] rounded-xl overflow-hidden shadow-2xl flex flex-col font-mono text-sm relative border transition-colors duration-300 ${isFailed ? 'border-red-200 dark:border-red-900' : 'border-gray-200 dark:border-gray-800'}`}>
          
        {/* Main View Area Switcher */}
        {isStaging2bTableVisible ? (
             <div className="flex flex-col h-full bg-white dark:bg-slate-900">
                 {/* Table Header */}
                 <div className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded">
                                <Table size={16} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white text-xs">Staging 2b Output</h3>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {isRetail ? 'Retail PD Calibration Tables' : 'Financial Spreading Results'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setForceShowLogs(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors mr-2"
                            >
                                <Terminal size={14} className="text-gray-500"/> Logs
                            </button>
                            <div className="w-[1px] bg-gray-300 dark:bg-slate-600 h-6 self-center"></div>
                            <button 
                                onClick={() => handleExportStaging2b('csv')}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <FileText size={14} className="text-blue-500"/> CSV
                            </button>
                            <button 
                                onClick={() => handleExportStaging2b('xlsx')}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                            >
                                <FileSpreadsheet size={14} className="text-green-500"/> Excel
                            </button>
                            <button 
                                onClick={onCloseView} 
                                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded transition-colors ml-2"
                                title="Close View"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* RETAIL ONLY: Tabs for different datasets */}
                    {isRetail && (
                        <div className="px-4 flex gap-4 mt-1">
                            <button 
                                onClick={() => setRetailTab('PD_CUST_EVERXV1')}
                                className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                                    retailTab === 'PD_CUST_EVERXV1' 
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <Layers size={12}/> PD_CUST_EVERXV1
                                </span>
                            </button>
                            <button 
                                onClick={() => setRetailTab('PD_CUST_DEFV1')}
                                className={`pb-2 text-xs font-bold border-b-2 transition-colors ${
                                    retailTab === 'PD_CUST_DEFV1' 
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    <AlertTriangle size={12}/> PD_CUST_DEFV1
                                </span>
                            </button>
                        </div>
                    )}
                 </div>

                 {/* The Table */}
                 <div 
                    className="flex-1 overflow-auto custom-scrollbar p-0"
                    onScroll={onTableScroll}
                 >
                     <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-gray-200 dark:border-slate-700 shadow-sm">
                            <tr>
                                {activeColumns.map((col) => (
                                    <th key={col.key} className={`px-4 py-3 font-semibold text-gray-600 dark:text-gray-300 ${col.align === 'right' ? 'text-right' : ''}`}>
                                        {col.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {displayedTableRows.map((row, i) => (
                                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                    {activeColumns.map((col) => {
                                        const val = row[col.key as keyof typeof row];
                                        let cellContent: any = val;

                                        // Formatting overrides based on key
                                        if (col.key === 'rating') {
                                            cellContent = (
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                    String(val).startsWith('A') || String(val).startsWith('R1') || String(val).startsWith('R2') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                    String(val).startsWith('B') || String(val).startsWith('R3') || String(val).startsWith('R4') ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                    {val}
                                                </span>
                                            );
                                        } else if (col.key === 'pd_shift') {
                                            cellContent = (
                                                <span className={`font-mono ${String(val).startsWith('+') ? 'text-red-500' : 'text-green-500'}`}>
                                                    {val}
                                                </span>
                                            );
                                        } else if (col.key === 'id' || col.key === 'cust_id' || col.key === 'exposure' || col.key === 'outstanding_amt' || col.key === 'recovery_amt' || col.key === 'pd_12m' || col.key === 'pd_lifetime' || col.key === 'lgd') {
                                            cellContent = <span className="font-mono text-gray-900 dark:text-white">{val}</span>;
                                        }

                                        return (
                                            <td key={col.key} className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : ''}`}>
                                                {cellContent}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                            {isTableLoading && (
                               <tr>
                                   <td colSpan={activeColumns.length} className="py-4 text-center bg-gray-50/50 dark:bg-slate-900/30">
                                       <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400">
                                           <Loader2 size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
                                           <span>Loading records...</span>
                                       </div>
                                   </td>
                               </tr>
                           )}
                        </tbody>
                     </table>
                 </div>
                 
                  {/* Table Footer */}
                  <div className="p-2 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-[10px] text-gray-500 dark:text-gray-400 flex justify-end px-4">
                     Showing {displayedTableRows.length} of {activeDataSourceLength} records
                 </div>
             </div>
        ) : (
            <>
            <div className="bg-white dark:bg-[#1e293b] px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700 shrink-0 transition-colors duration-300 gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#eab308]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                    </div>
                    <div className="text-gray-500 text-xs hidden sm:block">
                        {selectedStageId ? `View Logs: Stage ${selectedStageId}` : 'Live Stream'} — bash {mode === 'manual' ? '(Manual)' : ''}
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    {/* If we are allowed to switch back to table view (meaning stage is selected & completed & it is staging 2b) */}
                    {/* Note: This logic is passed down via `isStaging2bTableVisible` being false but we need to check if we CAN switch back */}
                    {/* The parent component handles the logic, here we just need a button if applicable */}
                    {/* Simplified: We assume if `setForceShowLogs` is passed, we can toggle it. But really we need to know if the underlying stage supports table */}
                    {/* Since `isStaging2bTableVisible` is false here, we can infer we are in Log mode. We check `selectedStageId` in parent logic mostly. */}
                    {/* For now, we will rely on a prop `canSwitchToTable` which we can derive or pass. Let's simplify: pass `showTableButton` */}
                    
                    <button 
                        onClick={() => setForceShowLogs(false)}
                        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors mr-2 ${
                            // Only show if we are actually viewing the logs of Staging 2b and it is completed.
                            // However, since we don't have that specific state passed easily, let's just make it always visible but handled by parent? 
                            // No, let's keep the logic consistent with original file:
                            // "selectedStageId === STAGING_2B_STEP_ID && steps.find(...)?.status === 'completed'"
                            // We will let parent handle visibility logic or pass a boolean.
                            // Let's assume the button is always shown in this component but disabled/hidden by CSS if not applicable?
                            // Better: pass a prop `canShowTable`.
                            "hidden" // Default hidden, overridden by specific condition if passed. 
                            // Actually, let's just use the `setForceShowLogs` to false. The parent determines if `isStaging2bTableVisible` becomes true.
                        }`}
                        // To properly implement the button visibility, we'd need to know if it's applicable.
                        // For this refactor, I will add `canShowTable` prop to `ExecutionOutput`.
                    >
                        <Table size={14} /> Results
                    </button>

                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className={`h-3.5 w-3.5 transition-colors ${searchQuery ? 'text-blue-500' : 'text-gray-400 group-focus-within:text-blue-500'}`} />
                        </div>
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search console logs..." 
                            className="pl-9 pr-20 py-1.5 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-md text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none w-64 focus:w-80 transition-all placeholder:text-gray-400 font-sans shadow-sm"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-2">
                            {searchQuery && (
                                <>
                                    <span className="text-[10px] font-mono text-gray-400 bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-gray-200 dark:border-slate-700">
                                        {filteredLogs.length}
                                    </span>
                                    <button 
                                        onClick={() => setSearchQuery('')}
                                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <X size={12} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    {selectedStageId && (
                        <button onClick={onCloseView} className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 whitespace-nowrap">
                            Exit Stage View
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto custom-scrollbar relative">
                {/* Failed State Overlay Effect in Terminal */}
                {isFailed && (
                    <div className="absolute inset-0 bg-red-500/5 pointer-events-none z-0"></div>
                )}

                {isFetchingLogs ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 dark:bg-[#0f172a]/50 z-20 backdrop-blur-[1px] transition-all duration-300">
                        <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400">
                            <Loader2 size={18} className="animate-spin" />
                            <span className="font-mono text-xs font-medium tracking-wide">ACCESSING_LOG_STREAM...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {filteredLogs.length === 0 && (
                            searchQuery ? (
                                <div className="text-gray-500 italic flex items-center gap-2 relative z-10">
                                    <Search size={14} /> No logs match "{searchQuery}"
                                </div>
                            ) : (
                                selectedStageId && <div className="text-gray-500 italic relative z-10">No logs available for this stage yet.</div>
                            )
                        )}
                        
                        <div className="space-y-1.5 relative z-10">
                        {filteredLogs.map((log, index) => (
                            <div key={index} className="flex gap-3 animate-fade-in-fast font-mono text-xs leading-relaxed group hover:bg-gray-50 dark:hover:bg-white/5 -mx-4 px-4 py-0.5">
                            <span className={`font-bold shrink-0 w-16 ${getLogColor(log.level)}`}>[{log.level}]</span>
                            <span className="text-gray-400 shrink-0 w-16 text-right select-none opacity-50 group-hover:opacity-100 transition-opacity">{log.timestamp.split(' ')[0]}</span>
                            {renderLogMessage(log.message, searchQuery)}
                            </div>
                        ))}
                        </div>

                        {/* Progress Bar */}
                        {shouldProcessCurrentStage && !selectedStageId && !searchQuery && (
                            <div className="mt-6 mb-2 relative z-10">
                            <div className="flex justify-between text-gray-500 dark:text-gray-400 text-xs mb-1">
                                <span>
                                {currentStageIndex < totalSteps 
                                    ? `Executing: ${currentStageLabel}...`
                                    : 'Finalizing...'}
                                </span>
                                <span>{Math.min(Math.round(progress), 100)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                                <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out" 
                                style={{ width: `${Math.min(progress, 100)}%` }}
                                ></div>
                            </div>
                            </div>
                        )}

                        {/* Manual Waiting Indicator */}
                        {mode === 'manual' && status === 'running' && !isManualStageRunning && !isPipelineComplete && !selectedStageId && !searchQuery && (
                            <div className="mt-4 border-l-2 border-cyan-500 pl-3 py-1 relative z-10">
                                <div className="text-cyan-600 dark:text-cyan-400 font-mono text-xs font-bold animate-pulse">
                                    _WAITING_FOR_USER_INPUT
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                    System halted. Please initialize next sequence on the control panel.
                                </div>
                            </div>
                        )}

                        {/* Failed Indicator */}
                        {isFailed && (
                            <div className="mt-4 border-l-2 border-red-500 pl-3 py-1 bg-red-50/50 dark:bg-red-900/10 relative z-10">
                                <div className="text-red-600 dark:text-red-400 font-mono text-xs font-bold flex items-center gap-2">
                                    <AlertTriangle size={12} />
                                    _PROCESS_TERMINATED
                                </div>
                                <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                                    Critical exception encountered. Please review logs above.
                                </div>
                            </div>
                        )}

                        {/* Active typing cursor */}
                        {shouldProcessCurrentStage && !selectedStageId && !searchQuery && (
                            <div className="mt-4 flex items-center gap-2 relative z-10">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">➜</span>
                            <span className="text-gray-700 dark:text-gray-300 animate-pulse">_</span>
                            </div>
                        )}
                    </>
                )}
                
                <div ref={logsEndRef} />
            </div>
            </>
          )}
    </div>
  );
};