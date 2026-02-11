import React from 'react';
import { Database, Server, Clock } from 'lucide-react';

export const DashboardSystemHealth: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-6 flex flex-col">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">System Health</h3>
        
        <div className="space-y-6 flex-1">
            {/* Status Item 1 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400">
                        <Database size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Data Warehouse</p>
                        <p className="text-xs text-gray-500">Snowflake PROD</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Operational</span>
                </div>
            </div>

            {/* Status Item 2 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400">
                        <Server size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Model Engine</p>
                        <p className="text-xs text-gray-500">Python Worker Nodes</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Idle (Ready)</span>
                </div>
            </div>

            {/* Status Item 3 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400">
                        <Clock size={18} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">Scheduler</p>
                        <p className="text-xs text-gray-500">Next run: 02:00 AM</p>
                    </div>
                </div>
                    <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active</span>
                </div>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-700">
            <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">System Version</span>
                <span className="font-mono font-medium text-gray-700 dark:text-gray-300">v2.4.1-stable</span>
            </div>
        </div>
    </div>
  );
};