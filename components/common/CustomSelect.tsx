import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
    value: number | string;
    options: { value: number | string; label: string }[];
    onChange: (value: any) => void;
    placeholder?: string;
    icon?: any;
    className?: string;
    variant?: 'default' | 'minimal';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ value, options, onChange, placeholder, icon: Icon, className, variant = 'default' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && listRef.current) {
            const selectedElement = document.getElementById(`select-option-${value}`);
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'center' });
            }
        }
    }, [isOpen, value]);

    const selectedOption = options.find(o => o.value === value);
    const label = selectedOption?.label || value;

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`flex items-center justify-between w-full transition-all duration-200 outline-none ${
                    variant === 'minimal'
                    ? 'gap-1 font-bold text-xs text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'h-10 px-3 gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono shadow-sm hover:border-cyan-500/30 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20'
                }`}
            >
                <div className="flex items-center gap-2 truncate">
                    {Icon && <Icon size={14} className="text-slate-400 shrink-0" />}
                    <span className={`${!selectedOption && placeholder ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                        {selectedOption ? label : placeholder || 'Select...'}
                    </span>
                </div>
                <ChevronDown size={12} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'} shrink-0`} />
            </button>

            {isOpen && (
                <div className={`absolute top-full left-0 mt-1 z-[60] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden animate-fade-in-up ${variant === 'minimal' ? 'min-w-[100px]' : 'w-full min-w-[160px]'}`}>
                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                id={`select-option-${option.value}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors rounded-md mb-0.5 ${
                                    option.value === value 
                                        ? 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 font-bold' 
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};