import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export const DashboardKPIGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-blue-300 dark:hover:border-blue-800 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Exposure</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$4.25 B</h3>
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp size={16} className="text-green-500 mr-1" />
            <span className="text-green-600 font-medium">+2.4%</span>
            <span className="text-gray-400 ml-2">vs last month</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-purple-300 dark:hover:border-purple-800 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total ECL Allowance</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">$142.8 M</h3>
            </div>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <ShieldCheck size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingDown size={16} className="text-green-500 mr-1" />
            <span className="text-green-600 font-medium">-0.5%</span>
            <span className="text-gray-400 ml-2">lower risk</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-amber-300 dark:hover:border-amber-800 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">NPL Ratio</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">3.42%</h3>
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp size={16} className="text-red-500 mr-1" />
            <span className="text-red-600 font-medium">+0.1%</span>
            <span className="text-gray-400 ml-2">vs last quarter</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-emerald-300 dark:hover:border-emerald-800 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Model Accuracy</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">94.8%</h3>
            </div>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <Activity size={20} />
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-emerald-600 font-medium">Stable</span>
            <span className="text-gray-400 ml-2">backtest passing</span>
          </div>
        </div>
    </div>
  );
};