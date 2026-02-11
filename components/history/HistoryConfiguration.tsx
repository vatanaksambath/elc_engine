import React from 'react';
import { Database, TrendingUp, Users, Settings, Lock, Server, Globe, Calendar, CheckCircle2 } from 'lucide-react';
import { RunConfiguration } from '../../types';

interface HistoryConfigurationProps {
  config: RunConfiguration;
  runId: string;
}

export const HistoryConfiguration: React.FC<HistoryConfigurationProps> = ({ config, runId }) => {
  return (
    <div className="animate-fade-in overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Data Source Card */}
            <div className="relative flex flex-col bg-white dark:bg-slate-800 p-0 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group/card">
            
            <div className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 p-4 flex justify-between items-center">
                <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                        <Database size={18} />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm tracking-wide uppercase font-mono">Data_Source</h3>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-gray-100 dark:bg-slate-800 rounded text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700">
                    <Lock size={10} />
                    <span>ARCHIVED</span>
                </div>
            </div>
            
            <div className="p-6 space-y-6 flex-1 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/50">
                <div>
                    <label className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                        <span>System Endpoint</span>
                        <span className="font-mono text-[10px] opacity-70">REGION: US-EAST-1</span>
                    </label>
                    
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                            <Server size={16} className="text-gray-400" />
                        </div>
                        <div className="w-full pl-10 pr-10 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm py-3 text-sm font-mono bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-300">
                            {config.sourceSystem}
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <div className="flex flex-col gap-0.5">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                        <div className="bg-gray-100 dark:bg-slate-900/50 rounded border border-gray-200 dark:border-slate-700/50 p-1.5 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-gray-400 uppercase">Historical Latency</span>
                            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">24ms</span>
                        </div>
                        <div className="bg-gray-100 dark:bg-slate-900/50 rounded border border-gray-200 dark:border-slate-700/50 p-1.5 flex items-center justify-between">
                            <span className="text-[9px] font-bold text-gray-400 uppercase">Uptime</span>
                            <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400 font-bold">99.99%</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                        <span>Target Partition</span>
                    </label>
                    
                    <div className="relative group">
                        <div className="w-full pl-3 pr-10 border border-gray-200 dark:border-slate-600 rounded-lg shadow-sm py-3 text-sm font-mono bg-gray-50 dark:bg-slate-900 text-gray-600 dark:text-slate-300">
                            {config.snapshotDate}
                        </div>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none opacity-50">
                            <Calendar className="text-gray-400 dark:text-slate-500" size={16} />
                        </div>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800/30">
                        <Globe size={12} className="text-blue-400" />
                        <span className="text-[10px] text-gray-500 dark:text-slate-400">Partition ID:</span>
                        <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 truncate">
                            {config.snapshotDate ? `PART_${config.snapshotDate.replace(/-/g, '')}_V1` : '---'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="h-1 w-full bg-gray-100 dark:bg-slate-700 flex">
                <div className="w-1/3 bg-blue-500 dark:bg-blue-600 h-full"></div>
                <div className="w-1/3 bg-transparent h-full"></div>
                <div className="w-1/3 bg-gray-300 dark:bg-slate-600 h-full"></div>
            </div>
        </div>

        {/* Methodology Card */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-purple-600 dark:text-purple-400">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                    <TrendingUp size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Methodology</h3>
            </div>
            <div className="space-y-4">
                <div className={`p-4 rounded-lg border transition-all ${
                    config.methodology === 'base' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-slate-100 dark:border-slate-700 opacity-60'
                }`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${config.methodology === 'base' ? 'border-purple-600 bg-purple-600' : 'border-slate-300 dark:border-slate-600'}`}>
                            {config.methodology === 'base' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-slate-900 dark:text-white">IFRS 9 Base Case</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Standard forward-looking PD/LGD models</span>
                        </div>
                    </div>
                </div>
                    <div className={`p-4 rounded-lg border transition-all ${
                    config.methodology === 'stress' 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-slate-100 dark:border-slate-700 opacity-60'
                }`}>
                    <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${config.methodology === 'stress' ? 'border-purple-600 bg-purple-600' : 'border-slate-300 dark:border-slate-600'}`}>
                            {config.methodology === 'stress' && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                        </div>
                        <div>
                            <span className="block text-sm font-medium text-slate-900 dark:text-white">Severe Stress Test</span>
                            <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">Macroeconomic shock scenario (-3% GDP)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

            {/* Portfolio Scope Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-3 mb-6 text-emerald-600 dark:text-emerald-400">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                    <Users size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">Portfolio Scope</h3>
            </div>
            <div className="space-y-3">
                {['Retail Banking', 'SME / Commercial', 'Large Corporate'].map((scope) => {
                    const isSelected = config.scope.includes(scope);
                    return (
                        <div 
                            key={scope}
                            className={`p-6 rounded-lg border transition-all flex items-center gap-3 ${
                                isSelected 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                                : 'border-slate-100 dark:border-slate-700 opacity-50'
                            }`} 
                        >
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                                {isSelected && <CheckCircle2 size={14} />}
                            </div>
                            <span className={`text-sm font-medium ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                {scope}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>

        </div>

        <div className="mt-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Settings size={16} />
            <span className="text-sm">Configuration Snapshot ID: <span className="font-mono text-slate-700 dark:text-slate-300">CFG-{runId.split('-')[1]}</span></span>
        </div>
        <div className="text-xs text-slate-400">
            Read-only view of historical configuration
        </div>
        </div>
    </div>
  );
};