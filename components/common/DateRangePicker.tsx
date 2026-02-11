import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface DateRangePickerProps {
    startDate: string;
    endDate: string;
    onChange: (start: string, end: string) => void;
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN", 
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

const YEARS = Array.from({ length: 11 }, (_, i) => 2020 + i);

export const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [leftViewDate, setLeftViewDate] = useState(new Date());
    const [rightViewDate, setRightViewDate] = useState(new Date());
    const [hoverDate, setHoverDate] = useState<Date | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            const start = startDate ? new Date(startDate) : new Date();
            let end = endDate ? new Date(endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 1);
            
            const lDate = new Date(start.getFullYear(), start.getMonth(), 1);
            let rDate = new Date(end.getFullYear(), end.getMonth(), 1);

            if (lDate.getTime() >= rDate.getTime()) {
                rDate = new Date(lDate.getFullYear(), lDate.getMonth() + 1, 1);
            }

            setLeftViewDate(lDate);
            setRightViewDate(rDate);
        }
    }, [isOpen]); 

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const parseDate = (str: string) => str ? new Date(str) : null;
    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const sDate = parseDate(startDate);
    const eDate = parseDate(endDate);

    const handleDateClick = (date: Date) => {
        date.setHours(0,0,0,0);
        const dateStr = formatDate(date);

        if (!startDate || (startDate && endDate)) {
            onChange(dateStr, '');
        } else {
            if (date < sDate!) {
                onChange(dateStr, startDate);
                setIsOpen(false);
            } else {
                onChange(startDate, dateStr);
                setIsOpen(false);
            }
        }
    };

    const updatePaneDate = (pane: 'left' | 'right', newDate: Date) => {
        if (pane === 'left') {
            setLeftViewDate(newDate);
            if (newDate >= rightViewDate) {
                 const autoRight = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 1);
                 setRightViewDate(autoRight);
            }
        } else {
            setRightViewDate(newDate);
            if (newDate <= leftViewDate) {
                 const autoLeft = new Date(newDate.getFullYear(), newDate.getMonth() - 1, 1);
                 setLeftViewDate(autoLeft);
            }
        }
    };

    const changeMonth = (pane: 'left' | 'right', offset: number) => {
        const base = pane === 'left' ? leftViewDate : rightViewDate;
        const newDate = new Date(base.getFullYear(), base.getMonth() + offset, 1);
        updatePaneDate(pane, newDate);
    };

    const handleMonthSelect = (pane: 'left' | 'right', newMonth: number) => {
        const base = pane === 'left' ? leftViewDate : rightViewDate;
        const newDate = new Date(base.getFullYear(), newMonth, 1);
        updatePaneDate(pane, newDate);
    };

    const handleYearSelect = (pane: 'left' | 'right', newYear: number) => {
        const base = pane === 'left' ? leftViewDate : rightViewDate;
        const newDate = new Date(newYear, base.getMonth(), 1);
        updatePaneDate(pane, newDate);
    };

    const renderCalendar = (pane: 'left' | 'right') => {
        const viewDate = pane === 'left' ? leftViewDate : rightViewDate;
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        const days = [];
        for (let i = 0; i < firstDayOfMonth; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

        const monthOptions = MONTHS.map((m, i) => ({ value: i, label: m }));
        const yearOptions = YEARS.map((y) => ({ value: y, label: y.toString() }));

        return (
            <div className="w-64 p-3">
                <div className="flex justify-between items-center mb-4 px-1 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-1">
                    <button onClick={() => changeMonth(pane, -1)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors shadow-sm">
                        <ChevronLeft size={12} />
                    </button>
                    
                    <div className="flex items-center justify-center gap-1 flex-1">
                        <CustomSelect 
                            value={month} 
                            options={monthOptions} 
                            onChange={(val) => handleMonthSelect(pane, val)} 
                            variant="minimal"
                        />
                        <CustomSelect 
                            value={year} 
                            options={yearOptions} 
                            onChange={(val) => handleYearSelect(pane, val)} 
                            variant="minimal"
                        />
                    </div>

                    <button onClick={() => changeMonth(pane, 1)} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md text-slate-500 transition-colors shadow-sm">
                        <ChevronRight size={12} />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                        <div key={d} className="text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide font-mono">
                            {d}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1 gap-x-0">
                    {days.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} />;
                        
                        const dateStr = formatDate(day);
                        const isSelectedStart = startDate === dateStr;
                        const isSelectedEnd = endDate === dateStr;
                        const isWithinRange = sDate && eDate && day > sDate && day < eDate;
                        const isHoverRange = !endDate && sDate && hoverDate && day > sDate && day <= hoverDate;

                        let bgClass = "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300";
                        let roundedClass = "rounded"; 

                        if (isSelectedStart || isSelectedEnd) {
                            bgClass = "bg-cyan-600 dark:bg-cyan-500 text-white shadow-md shadow-cyan-500/20 font-bold border border-cyan-600";
                        } else if (isWithinRange) {
                            bgClass = "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300";
                            roundedClass = "rounded-none"; 
                        } else if (isHoverRange) {
                             bgClass = "bg-cyan-50/50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 border border-dashed border-cyan-300 dark:border-cyan-700";
                        }

                        if (isWithinRange || isHoverRange) {
                            if (day.getDate() === 1 || day.getDay() === 0) roundedClass += " rounded-l";
                            if (day.getDay() === 6) roundedClass += " rounded-r";
                        }
                        
                        if(isSelectedStart && endDate) roundedClass = "rounded-l rounded-r-none";
                        if(isSelectedEnd && startDate) roundedClass = "rounded-r rounded-l-none";
                        if(isSelectedStart && isSelectedEnd) roundedClass = "rounded";

                        return (
                            <button
                                key={dateStr}
                                onClick={() => handleDateClick(day)}
                                onMouseEnter={() => setHoverDate(day)}
                                className={`w-8 h-8 flex items-center justify-center text-xs font-mono transition-all duration-150 ${bgClass} ${roundedClass} mx-auto`}
                            >
                                {day.getDate()}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const quickSelect = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - days);
        onChange(formatDate(start), formatDate(end));
    };

    return (
        <div className="relative" ref={containerRef}>
            <div 
                className={`flex items-center gap-3 bg-white dark:bg-slate-900 border transition-all duration-200 rounded-lg px-3 h-10 cursor-pointer min-w-[240px] group shadow-sm ${
                    isOpen ? 'border-cyan-500 ring-1 ring-cyan-500/20' : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/30'
                }`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Calendar size={14} className={`${isOpen || startDate ? 'text-cyan-500' : 'text-slate-400'} transition-colors`} />
                <span className={`text-xs font-mono flex-1 ${startDate ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-400'}`}>
                    {startDate ? `${startDate} ${endDate ? ` -> ${endDate}` : ''}` : 'SELECT DATE RANGE'}
                </span>
                <ChevronRight size={12} className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 z-50 flex flex-col md:flex-row overflow-hidden animate-fade-in-up">
                    <div className="w-32 bg-slate-50 dark:bg-slate-950 p-2 border-r border-slate-200 dark:border-slate-800 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-2 mb-1">Quick Select</span>
                        {[
                            { label: 'Today', days: 0 },
                            { label: 'Last 7 Days', days: 7 },
                            { label: 'Last 30 Days', days: 30 },
                            { label: 'Last 90 Days', days: 90 },
                        ].map(opt => (
                            <button 
                                key={opt.label}
                                onClick={() => { quickSelect(opt.days); setIsOpen(false); }}
                                className="text-left px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-cyan-600 dark:hover:text-cyan-400 rounded-lg transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-sm"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex flex-col">
                        <div className="flex flex-col md:flex-row p-2">
                            {renderCalendar('left')}
                            <div className="w-[1px] bg-slate-100 dark:bg-slate-800 mx-1 hidden md:block my-3"></div>
                            {renderCalendar('right')}
                        </div>
                        <div className="border-t border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
                            <span className="text-[10px] text-slate-400 font-mono">
                                {startDate && endDate ? `${startDate} to ${endDate}` : 'Select a range'}
                            </span>
                            <div className="flex gap-2">
                                <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={() => setIsOpen(false)} className="px-3 py-1.5 text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white rounded-md shadow-sm transition-colors">
                                    Apply
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};