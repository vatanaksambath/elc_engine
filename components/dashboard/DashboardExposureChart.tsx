import React from 'react';
import { TREND_DATA } from '../../utils/mockHistoryData';

export const DashboardExposureChart: React.FC = () => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exposure vs ECL Trend</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-blue-500 dark:bg-blue-600 rounded-[2px]"></div>
                    <span className="text-gray-500 dark:text-gray-400">Gross Exposure</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-purple-500 dark:bg-purple-600 rounded-[2px]"></div>
                    <span className="text-gray-500 dark:text-gray-400">ECL Allowance</span>
                </div>
            </div>
        </div>
        
        <div className="h-64 flex items-end justify-between gap-2 md:gap-4 px-2">
            {TREND_DATA.map((data, i) => (
                <div key={i} className="flex-1 h-full flex items-end justify-center gap-1.5 group relative cursor-crosshair">
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-900 dark:bg-black text-white text-[10px] py-1.5 px-2.5 rounded-lg shadow-xl z-20 whitespace-nowrap border border-slate-700 animate-fade-in-up">
                        <div className="font-bold mb-0.5 border-b border-gray-700 pb-0.5">{data.month}</div>
                        <div className="flex justify-between gap-3 text-blue-300"><span>Exp:</span> <span className="font-mono">${data.exposure}M</span></div>
                        <div className="flex justify-between gap-3 text-purple-300"><span>ECL:</span> <span className="font-mono">${data.ecl}M</span></div>
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-900 dark:bg-black border-r border-b border-slate-700"></div>
                        </div>

                        {/* Exposure Bar */}
                        <div 
                        className="w-1.5 md:w-4 bg-blue-500 dark:bg-blue-600 rounded-t-sm transition-all duration-300 group-hover:bg-blue-400 group-hover:shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                        style={{ height: `${data.exposure}%` }}
                        />
                        
                        {/* ECL Bar */}
                        <div 
                        className="w-1.5 md:w-4 bg-purple-500 dark:bg-purple-600 rounded-t-sm transition-all duration-300 group-hover:bg-purple-400 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.3)]" 
                        style={{ height: `${data.ecl}%` }}
                        />
                </div>
            ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">
            {TREND_DATA.map(d => <span key={d.month}>{d.month}</span>)}
        </div>
    </div>
  );
};