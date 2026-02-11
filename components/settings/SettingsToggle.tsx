import React from 'react';

interface SettingsToggleProps {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description?: string;
    icon?: any;
}

export const SettingsToggle: React.FC<SettingsToggleProps> = ({ checked, onChange, label, description, icon: Icon }) => (
  <div 
    onClick={() => onChange(!checked)}
    className={`flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer group ${
      checked 
        ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800' 
        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
    }`}
  >
    <div className="flex gap-3">
        {Icon && (
            <div className={`mt-0.5 p-1.5 rounded-lg ${checked ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' : 'text-gray-400 bg-gray-100 dark:bg-slate-700'}`}>
                <Icon size={16} />
            </div>
        )}
        <div>
            <div className={`text-sm font-semibold transition-colors ${checked ? 'text-blue-900 dark:text-blue-100' : 'text-gray-700 dark:text-gray-300'}`}>
                {label}
            </div>
            {description && <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</div>}
        </div>
    </div>
    
    <div className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-blue-600' : 'bg-gray-300 dark:bg-slate-600'
    }`}>
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          checked ? 'translate-x-4.5' : 'translate-x-1'
        }`}
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </div>
  </div>
);