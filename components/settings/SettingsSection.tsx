import React from 'react';

interface SettingsSectionProps {
    title: string;
    icon: any;
    children?: React.ReactNode;
    className?: string;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`bg-white dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700/60 overflow-hidden shadow-sm backdrop-blur-sm ${className}`}>
        <div className="px-5 py-3 border-b border-gray-100 dark:border-slate-700/60 bg-gray-50/50 dark:bg-slate-800/80 flex items-center gap-2">
            <Icon size={16} className="text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm tracking-wide">{title}</h3>
        </div>
        <div className="p-5 space-y-4">
            {children}
        </div>
    </div>
);