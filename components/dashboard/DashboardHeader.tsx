import React from 'react';
import { Activity } from 'lucide-react';
import { ViewType } from '../../types';

interface DashboardHeaderProps {
  onNavigate: (view: ViewType) => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Executive Overview</h1>
          <p className="text-gray-500 dark:text-gray-400">Real-time credit risk monitoring and system status.</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={() => onNavigate('history')}
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium shadow-sm"
            >
                View History Logs
            </button>
            <button 
                onClick={() => onNavigate('orchestration')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium shadow-sm flex items-center gap-2"
            >
                <Activity size={16} />
                New Run
            </button>
        </div>
    </div>
  );
};