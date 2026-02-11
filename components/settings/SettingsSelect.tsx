import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SettingsSelectProps {
    label: string;
    value: string;
    options: string[];
}

export const SettingsSelect: React.FC<SettingsSelectProps> = ({ label, value, options }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</label>
        <div className="relative">
            <select 
                className="w-full appearance-none bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-200 text-sm rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 pr-8 transition-colors font-medium"
                defaultValue={value}
            >
                {options.map(opt => <option key={opt}>{opt}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
    </div>
);