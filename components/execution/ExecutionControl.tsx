import React from 'react';
import { 
  Bug, XCircle, RefreshCcw, PlayCircle, X, Loader2, Fingerprint, Clock, AlertOctagon, Terminal, ChevronRight, Server, CheckCircle2, ArrowRight
} from 'lucide-react';
import { ExecutionMode } from '../../types';

interface ExecutionControlProps {
  status: 'idle' | 'running' | 'completed' | 'failed';
  mode: ExecutionMode;
  runId: string;
  elapsedTime: number;
  isPipelineComplete: boolean;
  isManualStageRunning: boolean;
  currentStageLabel: string;
  onSimulateError: () => void;
  onCancel: () => void;
  onNewRun: () => void;
  onRetry: () => void;
  onComplete: () => void;
  onRunManualStage: () => void;
}

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

export const ExecutionControl: React.FC<ExecutionControlProps> = ({
  status, mode, runId, elapsedTime, isPipelineComplete, isManualStageRunning, currentStageLabel,
  onSimulateError, onCancel, onNewRun, onRetry, onComplete, onRunManualStage
}) => {
  const isFailed = status === 'failed';

  return (
    <>
        {/* Header Text & Controls */}
        <div className="mb-4 shrink-0 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline Execution</h1>
            <p className="text-gray-500 dark:text-gray-400">Real-time supervision of credit risk model training sequence.</p>
          </div>
          <div className="flex gap-3 items-center">
              {status === 'running' && !isPipelineComplete && (mode === 'automated' || isManualStageRunning) && (
                  <>
                    <button 
                        onClick={onSimulateError}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:border-red-200 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-medium transition-all shadow-sm group"
                        title="Debug: Force a failure"
                    >
                        <Bug size={14} />
                        Simulate Error
                    </button>
                    <button 
                        onClick={onCancel}
                        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-red-300 dark:hover:border-red-800 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-sm font-medium transition-all shadow-sm group"
                    >
                        <XCircle size={16} className="group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                        Cancel Run
                    </button>
                  </>
              )}
              
              {/* Discrete Abort for Manual Wait State */}
              {status === 'running' && !isPipelineComplete && mode === 'manual' && !isManualStageRunning && (
                   <button 
                        onClick={onCancel}
                        className="group relative flex items-center gap-3 px-4 py-2 rounded-md bg-white/50 dark:bg-slate-800/50 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-[10px] font-mono font-bold tracking-widest uppercase transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-300 dark:hover:border-red-700 hover:shadow-[0_0_15px_rgba(239,68,68,0.15)] active:scale-95 backdrop-blur-sm"
                    >
                        <div className="flex items-center justify-center w-4 h-4 rounded-sm border border-red-300 dark:border-red-800 bg-red-100 dark:bg-red-900/50 group-hover:bg-red-500 group-hover:border-red-500 transition-colors duration-300">
                             <X size={10} className="text-red-500 dark:text-red-400 group-hover:text-white transition-colors" strokeWidth={3} />
                        </div>
                        <span className="relative z-10">ABORT_SEQUENCE</span>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-red-300 dark:border-red-800 opacity-50 group-hover:w-full group-hover:h-full transition-all duration-500 ease-out rounded-br-md pointer-events-none"></div>
                    </button>
              )}

              {isFailed && (
                  <>
                    <button 
                        onClick={onNewRun}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                        <RefreshCcw size={16} className="rotate-180" />
                        New Run
                    </button>
                    <button 
                        onClick={onRetry}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                    >
                        <RefreshCcw size={16} />
                        Retry Run
                    </button>
                  </>
              )}
              
              {status === 'completed' && mode !== 'manual' && (
                 <button onClick={onComplete} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
                    View Results <PlayCircle size={16}/>
                 </button>
              )}
          </div>
        </div>

        {/* Widgets Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 shrink-0">
          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-gray-400 dark:text-gray-300">
              <Fingerprint size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Run ID</p>
              <p className="text-base lg:text-lg font-bold text-gray-900 dark:text-white font-mono">{runId || 'Initializing...'}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-500 dark:text-blue-400">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-400 dark:text-blue-300 uppercase">Time Elapsed</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{formatTime(elapsedTime)}</p>
            </div>
          </div>

          {/* Conditional 3rd Widget */}
          {isFailed ? (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800 shadow-sm flex items-center gap-4 w-full">
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-xl text-red-600 dark:text-red-400">
                    <AlertOctagon size={24} />
                </div>
                <div>
                    <p className="text-xs font-semibold text-red-600 dark:text-red-400 uppercase">Status</p>
                    <p className="text-lg font-bold text-red-700 dark:text-red-300">Execution Failed</p>
                </div>
              </div>
          ) : mode === 'manual' && !isPipelineComplete ? (
               <div className="relative overflow-hidden bg-white dark:bg-slate-950 rounded-xl shadow-lg shadow-blue-900/5 dark:shadow-blue-900/20 border border-gray-200 dark:border-slate-800 w-full group flex flex-col justify-between transition-colors duration-300">
                <div className="bg-gray-50 dark:bg-slate-900/50 px-4 py-1.5 flex justify-between items-center border-b border-gray-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                         {!isManualStageRunning && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.6)]"></div>}
                         <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 tracking-widest uppercase">
                            {isManualStageRunning ? '>> EXECUTING SEQUENCE' : '>> AWAITING COMMAND'}
                         </span>
                    </div>
                    <Terminal size={12} className="text-gray-400 dark:text-slate-600" />
                </div>
                <div className="p-4 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                        <div className="text-[10px] text-gray-500 dark:text-slate-500 font-mono uppercase mb-0.5">Current Stage</div>
                        <div className="text-gray-900 dark:text-white font-mono font-bold text-lg truncate tracking-tight">{currentStageLabel}</div>
                    </div>
                    {isManualStageRunning ? (
                        <div className="px-4 py-2 bg-gray-100 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700 text-gray-500 dark:text-slate-400 font-mono text-xs flex items-center gap-2">
                           <Loader2 size={14} className="animate-spin text-cyan-600 dark:text-cyan-500" />
                           PROCESSING...
                        </div>
                    ) : (
                        <button 
                            onClick={onRunManualStage}
                            className="group relative px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold font-mono tracking-wide rounded transition-all hover:shadow-[0_0_15px_rgba(8,145,178,0.3)] active:scale-95 flex items-center gap-2 overflow-hidden"
                        >
                            <span className="relative z-10">INITIALIZE</span>
                            <ChevronRight size={14} className="relative z-10 group-hover:translate-x-0.5 transition-transform" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shine" />
                        </button>
                    )}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gray-100 dark:bg-slate-800">
                     <div className={`h-full bg-cyan-500 transition-all duration-1000 ${isManualStageRunning ? 'w-full' : 'w-1/3'}`}></div>
                </div>
            </div>
          ) : mode === 'manual' && isPipelineComplete ? (
               <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-200 dark:border-green-800/50 shadow-sm flex items-center gap-4 w-full">
                <div className="p-3 rounded-xl bg-green-600 text-white">
                    <CheckCircle2 size={24} />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-green-700 dark:text-green-300 uppercase mb-1">Pipeline Complete</p>
                    <button 
                        onClick={onComplete}
                        className="w-full text-left font-bold text-green-800 dark:text-green-200 hover:text-green-600 dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                        View Final Results <ArrowRight size={16} />
                    </button>
                </div>
              </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4 w-full">
                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-gray-400 dark:text-gray-300">
                <Server size={24} />
                </div>
                <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Resource Usage</p>
                    <span className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400 text-[10px] px-1.5 py-0.5 rounded font-bold">Healthy</span>
                </div>
                <div className="flex items-end gap-2">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">84%</p>
                </div>
                <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-1.5 mt-1">
                    <div className="bg-blue-600 dark:bg-blue-500 h-1.5 rounded-full transition-all duration-500" style={{ width: '84%' }}></div>
                </div>
                </div>
            </div>
          )}
        </div>
    </>
  );
};