import React from 'react';
import { Sliders, Save } from 'lucide-react';

export const SettingsHeader: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders className="text-blue-600 dark:text-blue-400" />
                System Configuration
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage local risk model parameters and notification channels.</p>
        </div>
        <div className="flex gap-3">
             <button className="px-5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-medium transition-colors text-sm">
                Discard
            </button>
            <button className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-transform active:scale-95 text-sm">
                <Save size={16} />
                Save Changes
            </button>
        </div>
      </div>
  );
};