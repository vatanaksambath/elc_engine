import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { HistoryItem } from '../../types';

interface HistoryDetailHeaderProps {
  run: HistoryItem;
  onBack: () => void;
  activeTab: 'overview' | 'configuration' | 'execution' | 'results';
  setActiveTab: (tab: any) => void;
}

export const HistoryDetailHeader: React.FC<HistoryDetailHeaderProps> = ({ run, onBack, activeTab, setActiveTab }) => {
  return (
    <div className="mb-6 shrink-0">
        <div className="flex items-center gap-4 mb-6">
            <button 
                onClick={onBack}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
                <ArrowLeft size={24} />
            </button>
            <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="font-mono text-xl opacity-50"></span>{run.id}
                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${
                    run.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                }`}>
                    {run.status}
                </span>
                </h2>
            </div>
        </div>

        <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-700">
            {['overview', 'configuration', 'execution', 'results'].map((tab) => {
                if (tab === 'results' && run.status !== 'SUCCESS') return null;
                const isActive = activeTab === tab;
                return (
                    <button 
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-3 text-sm font-semibold transition-all relative ${
                            isActive 
                            ? 'text-cyan-600 dark:text-cyan-400' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        <span className="capitalize">{tab}</span>
                        {isActive && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]"></div>}
                    </button>
                )
            })}
        </div>
    </div>
  );
};