import React from 'react';
import { MousePointerClick, CheckCircle2, Loader2, XCircle } from 'lucide-react';
import { PipelineStep, LogEntry, ExecutionMode } from '../../types';

interface ExecutionSidebarProps {
  steps: PipelineStep[];
  logs: LogEntry[];
  currentStageIndex: number;
  progress: number;
  selectedStageId: number | null;
  mode: ExecutionMode;
  onSelectStage: (id: number | null) => void;
  isStaging2bTableVisible: boolean;
}

const formatStageDuration = (ms: number) => {
    if (ms >= 60000) {
        const m = Math.floor(ms / 60000);
        const s = ((ms % 60000) / 1000).toFixed(0);
        return `${m}m ${s}s`;
    }
    return `${(ms / 1000).toFixed(1)}s`;
};

export const ExecutionSidebar: React.FC<ExecutionSidebarProps> = ({
  steps, logs, currentStageIndex, progress, selectedStageId, mode, onSelectStage, isStaging2bTableVisible
}) => {
  return (
    <div className="col-span-12 lg:col-span-3 overflow-y-auto custom-scrollbar pr-2 scroll-smooth">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pipeline Progress</h3>
            {mode === 'manual' && (
                <span className="text-[10px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MousePointerClick size={10} /> MANUAL
                </span>
            )}
        </div>
        
        <div className="relative space-y-4">
          <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-gray-100 dark:bg-slate-700 -z-10"></div>

          {steps.map((step) => (
            <div 
              key={step.id} 
              id={`step-item-${step.id}`}
              onClick={() => {
                if ((step.status !== 'pending' && step.status !== 'failed') || logs.some(l => l.stageId === step.id)) {
                   onSelectStage(step.id === selectedStageId ? null : step.id);
                }
              }}
              className={`relative flex items-center p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                step.status === 'processing' 
                  ? 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900 shadow-lg shadow-blue-50 dark:shadow-blue-900/20 z-10' 
                  : step.status === 'failed'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'
                    : selectedStageId === step.id
                        ? 'bg-blue-50 dark:bg-slate-800 border-blue-200 dark:border-blue-700'
                        : 'bg-white dark:bg-slate-800/50 border-transparent hover:bg-gray-50 dark:hover:bg-slate-800'
              } ${step.status === 'completed' ? 'animate-pop' : ''}`}
            >
              <div className="mr-4 flex-shrink-0">
                {step.status === 'completed' && (
                  <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 flex items-center justify-center">
                    <CheckCircle2 size={14} />
                  </div>
                )}
                {step.status === 'processing' && (
                  <div className="w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Loader2 size={14} className="animate-spin" />
                  </div>
                )}
                {step.status === 'failed' && (
                   <div className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <XCircle size={14} />
                  </div>
                )}
                {step.status === 'pending' && (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-slate-600"></div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                    <p className={`text-sm font-semibold ${step.status === 'pending' ? 'text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                    {step.label}
                    </p>
                    {step.status === 'completed' && (
                        <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">
                            {formatStageDuration(step.duration)}
                        </span>
                    )}
                </div>
                {step.status !== 'pending' && (
                   selectedStageId === step.id ? (
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Viewing {isStaging2bTableVisible ? 'Data' : 'Logs'}</p>
                   ) : (
                    <p className={`text-xs ${
                        step.status === 'processing' ? 'text-blue-500 dark:text-blue-400' : 
                        step.status === 'failed' ? 'text-red-500 dark:text-red-400 font-bold' : 
                        'text-green-500 dark:text-green-400'
                    }`}>
                        {step.status === 'completed' ? 'Completed' : step.status === 'failed' ? 'Failed' : 'Processing...'}
                    </p>
                   )
                )}
              </div>
              
              {step.status === 'processing' && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 dark:bg-slate-700/50 overflow-hidden rounded-b-xl">
                     <div 
                        className="h-full bg-blue-500 transition-all duration-150 ease-linear"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                     />
                </div>
              )}
            </div>
          ))}
        </div>
    </div>
  );
};