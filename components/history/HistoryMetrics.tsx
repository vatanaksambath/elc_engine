import React from 'react';
import { Database, Clock, Activity, BarChart3 } from 'lucide-react';

interface HistoryMetricsProps {
  metrics: {
    total: number;
    successCount: number;
    failedCount: number;
    rate: number;
    totalRecords: number;
    avgDuration: string;
  };
}

export const HistoryMetrics: React.FC<HistoryMetricsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 animate-fade-in">
        
        {/* Total Runs Card - Enhanced with Detailed Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between group hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-0.5">Total Executions</p>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">{metrics.total}</h3>
                </div>
                <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                    <Database size={16} />
                </div>
            </div>
            
            <div className="space-y-2">
                 {/* Success Bar */}
                 <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> SUCCESS
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono">{metrics.successCount}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${metrics.total > 0 ? (metrics.successCount / metrics.total) * 100 : 0}%` }}></div>
                    </div>
                 </div>

                 {/* Failed Bar */}
                 <div className="space-y-0.5">
                    <div className="flex justify-between text-[10px] font-bold">
                        <span className="text-red-600 dark:text-red-400 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> FAILED
                        </span>
                        <span className="text-slate-700 dark:text-slate-300 font-mono">{metrics.failedCount}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                         <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${metrics.total > 0 ? (metrics.failedCount / metrics.total) * 100 : 0}%` }}></div>
                    </div>
                 </div>
            </div>
        </div>

        {/* Success Rate Card - Enhanced */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between group hover:border-emerald-300 dark:hover:border-emerald-700 transition-all duration-300">
            <div>
                <div className="flex justify-between items-start mb-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Success Rate</p>
                     <div className={`p-1.5 rounded-md ${metrics.rate >= 95 ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        <Activity size={14} />
                     </div>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono">{metrics.rate}%</h3>
                    <span className="text-[10px] text-slate-400">Target: 99.0%</span>
                </div>
            </div>
            
            <div className="mt-3">
                 <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${metrics.rate >= 95 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${metrics.rate}%` }}></div>
                 </div>
            </div>
        </div>

        {/* Avg Duration - Enhanced */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between group hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300">
            <div>
                <div className="flex justify-between items-start mb-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Avg. Duration</p>
                     <div className="p-1.5 rounded-md bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                        <Clock size={14} />
                     </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{metrics.avgDuration}</h3>
            </div>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                 <span className="font-mono font-bold text-slate-700 dark:text-slate-300">~12m</span> typical runtime
            </div>
        </div>
        
        {/* Total Records - Enhanced */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between group hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300">
            <div>
                <div className="flex justify-between items-start mb-1">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Records</p>
                     <div className="p-1.5 rounded-md bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                        <BarChart3 size={14} />
                     </div>
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-1">{(metrics.totalRecords / 1000000).toFixed(1)}M</h3>
            </div>
             <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                 <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                 <span>Processed Rows</span>
            </div>
        </div>
      </div>
  );
};