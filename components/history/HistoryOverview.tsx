import React from 'react';
import { Calendar, Clock, FileText } from 'lucide-react';
import { HistoryItem } from '../../types';

interface HistoryOverviewProps {
  run: HistoryItem;
}

export const HistoryOverview: React.FC<HistoryOverviewProps> = ({ run }) => {
  return (
    <div className="animate-fade-in overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Summary Cards */}
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <Calendar size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Execution Date</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{run.date}</p>
            </div>
            <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <Clock size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Duration</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{run.duration}</p>
            </div>
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm p-6 rounded-2xl border border-white/50 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-3 text-slate-400 mb-2">
                    <FileText size={18} />
                    <span className="text-xs font-bold uppercase tracking-wider">Records</span>
                </div>
                <p className="text-xl font-bold text-slate-900 dark:text-white font-mono">{run.records.toLocaleString()}</p>
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <h3 className="font-bold text-slate-800 dark:text-slate-200">Execution Summary</h3>
            </div>
            <div className="p-6 text-sm text-slate-600 dark:text-slate-300 space-y-4">
                <p className="flex items-center gap-2"><span className="w-24 font-semibold text-slate-400">Run ID:</span> <span className="font-mono">{run.id}</span></p>
                <p className="flex items-center gap-2"><span className="w-24 font-semibold text-slate-400">User:</span> <span>{run.triggeredBy}</span></p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700/50">
                    <p className="leading-relaxed opacity-80">
                        {run.status === 'SUCCESS' 
                            ? "The pipeline executed successfully, processing all data stages including Data Collection, Cleansing, Staging transformations, and Model execution (LGD & EAD). All validation checks passed with 99.8% data quality score." 
                            : "The pipeline encountered a critical error during execution. The process was halted to prevent data corruption. Please review the execution logs for specific error codes and stack traces."}
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
};