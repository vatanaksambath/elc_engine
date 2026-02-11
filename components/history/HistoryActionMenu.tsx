import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Eye, FileDown, RefreshCw } from 'lucide-react';
import { HistoryItem } from '../../types';

interface HistoryActionMenuProps {
  run: HistoryItem;
  onView: (run: HistoryItem) => void;
}

export const HistoryActionMenu: React.FC<HistoryActionMenuProps> = ({ run, onView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setIsOpen(false);
  };

  const handleDownloadLogs = () => {
    // Simulate log content generation
    const content = [
        `Run ID: ${run.id}`,
        `Date: ${run.date}`,
        `Status: ${run.status}`,
        `Triggered By: ${run.triggeredBy}`,
        `Duration: ${run.duration}`,
        `Records Processed: ${run.records}`,
        '----------------------------------------',
        '[INFO] Pipeline execution initialized',
        `[INFO] Loading configuration for ${run.id}...`,
        '[INFO] Connecting to Snowflake_Prod_DW...',
        '[SUCCESS] Connection established (Latency: 24ms)',
        '[PROCESS] Validating input schema...',
        run.status === 'FAILED' 
            ? '[ERROR] Critical failure in Staging 2b transformation. Null pointer exception at row 4502.' 
            : '[SUCCESS] Validation complete. Starting batch processing...',
        run.status === 'FAILED'
            ? '[INFO] Rollback initiated.'
            : '[SUCCESS] Execution completed successfully.'
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${run.id}_logs.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="relative flex justify-center" ref={menuRef}>
      <button 
        onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
        className={`p-1.5 rounded-md transition-all duration-200 outline-none focus:ring-2 focus:ring-blue-500/20 ${
            isOpen 
            ? 'bg-slate-100 text-slate-900 dark:bg-slate-700 dark:text-slate-100 ring-2 ring-slate-100 dark:ring-slate-700' 
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Actions"
        aria-label="Actions"
        aria-expanded={isOpen}
      >
        <MoreVertical size={16} />
      </button>

      {isOpen && (
        <div className="absolute right-8 top-0 z-50 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in origin-top-right p-1">
            <button 
                onClick={(e) => handleAction(e, () => onView(run))}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors group"
            >
                <Eye size={14} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                View Details
            </button>

            <button 
                onClick={(e) => handleAction(e, handleDownloadLogs)}
                className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors group"
            >
                <FileDown size={14} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                Download Logs
            </button>

            {run.status === 'FAILED' && (
                <button 
                    onClick={(e) => handleAction(e, () => {})}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-md transition-colors group"
                >
                    <RefreshCw size={14} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                    Retry Run
                </button>
            )}
        </div>
      )}
    </div>
  );
};