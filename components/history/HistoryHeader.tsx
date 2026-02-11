import React from 'react';
import { Filter, X } from 'lucide-react';
import { CustomSelect } from '../common/CustomSelect';
import { DateRangePicker } from '../common/DateRangePicker';

interface HistoryHeaderProps {
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  startDate: string;
  endDate: string;
  onDateChange: (start: string, end: string) => void;
  onClearFilters: () => void;
}

export const HistoryHeader: React.FC<HistoryHeaderProps> = ({
  statusFilter, setStatusFilter, startDate, endDate, onDateChange, onClearFilters
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Run History</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Audit log of all past credit risk orchestration runs.</p>
        </div>
        
        <div className="flex items-center gap-3">
             <div className="w-40">
                <CustomSelect 
                    value={statusFilter} 
                    onChange={setStatusFilter} 
                    options={[
                        { value: 'ALL', label: 'ALL STATUS' },
                        { value: 'SUCCESS', label: 'SUCCESS' },
                        { value: 'FAILED', label: 'FAILED' }
                    ]}
                    icon={Filter}
                />
            </div>

            <DateRangePicker 
                startDate={startDate} 
                endDate={endDate} 
                onChange={onDateChange} 
            />

            {(statusFilter !== 'ALL' || startDate || endDate) && (
                <button 
                    onClick={onClearFilters}
                    className="p-2.5 text-slate-500 hover:text-red-500 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-900/20 border border-slate-200 dark:border-slate-800 rounded-lg transition-colors shadow-sm"
                    title="Clear Filters"
                >
                    <X size={16} />
                </button>
            )}
        </div>
      </div>
  );
};