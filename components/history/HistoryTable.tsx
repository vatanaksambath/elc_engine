import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, Search, ChevronUp, ChevronDown, ArrowUpDown, Loader2, PlayCircle } from 'lucide-react';
import { HistoryItem } from '../../types';
import { HistoryActionMenu } from './HistoryActionMenu';

interface HistoryTableProps {
  history: HistoryItem[];
  onRunClick: (item: HistoryItem) => void;
  onClearFilters: () => void;
}

type SortConfig = {
  key: keyof HistoryItem;
  direction: 'asc' | 'desc';
} | null;

const PAGE_SIZE = 15;

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onRunClick, onClearFilters }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [displayedCount, setDisplayedCount] = useState(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Reset display count when filters change (history prop changes)
  useEffect(() => {
    setDisplayedCount(PAGE_SIZE);
    if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo(0, 0);
    }
  }, [history]);

  const handleSort = (key: keyof HistoryItem) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedHistory = useMemo(() => {
    let sortableItems = [...history];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [history, sortConfig]);

  const visibleHistory = sortedHistory.slice(0, displayedCount);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more when scrolled to bottom
    if (scrollHeight - scrollTop <= clientHeight + 50 && !isLoadingMore && displayedCount < sortedHistory.length) {
      setIsLoadingMore(true);
      // Simulate slight network delay for better UX
      setTimeout(() => {
        setDisplayedCount(prev => Math.min(prev + PAGE_SIZE, sortedHistory.length));
        setIsLoadingMore(false);
      }, 400);
    }
  };

  const renderSortIcon = (key: keyof HistoryItem) => {
    if (sortConfig?.key !== key) {
        return <ArrowUpDown size={12} className="text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />;
    }
    return sortConfig.direction === 'asc' 
        ? <ChevronUp size={12} className="text-blue-600 dark:text-blue-400" /> 
        : <ChevronDown size={12} className="text-blue-600 dark:text-blue-400" />;
  };

  if (history.length === 0) {
     return (
        <div className="flex flex-col items-center justify-center flex-1 p-8 text-slate-500 dark:text-slate-400 h-full">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-full mb-4">
                <Search size={32} className="opacity-40" />
            </div>
            <p className="text-lg font-medium text-slate-900 dark:text-white">No results found</p>
            <p className="text-sm mt-1">Adjust your filters to see execution history.</p>
            <button 
                onClick={onClearFilters}
                className="mt-6 px-4 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg shadow-sm transition-all"
            >
                Clear all filters
            </button>
        </div>
     );
  }

  const headers: { key: keyof HistoryItem; label: string; align?: 'left' | 'right' | 'center' }[] = [
      { key: 'status', label: 'Status' },
      { key: 'id', label: 'Run ID' },
      { key: 'date', label: 'Date & Time' },
      { key: 'duration', label: 'Duration' },
      { key: 'triggeredBy', label: 'Initiated By' },
      { key: 'records', label: 'Records', align: 'right' },
  ];

  return (
    <div 
        className="flex-1 overflow-auto custom-scrollbar relative bg-white dark:bg-slate-800"
        ref={scrollContainerRef}
        onScroll={handleScroll}
    >
        <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400 border-separate border-spacing-0">
            <thead className="bg-slate-50/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 shadow-sm">
                <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 w-16 text-center">
                        #
                    </th>
                    {headers.map((header) => (
                        <th 
                            key={header.key}
                            onClick={() => handleSort(header.key)}
                            className={`px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 cursor-pointer group select-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${header.align === 'right' ? 'text-right' : header.align === 'center' ? 'text-center' : ''}`}
                        >
                            <div className={`flex items-center gap-2 ${header.align === 'right' ? 'justify-end' : header.align === 'center' ? 'justify-center' : ''}`}>
                                {header.label}
                                {renderSortIcon(header.key)}
                            </div>
                        </th>
                    ))}
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 text-center w-24">
                        Action
                    </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {visibleHistory.map((item, index) => (
                <tr 
                    key={item.id} 
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-700/30 transition-colors group"
                >
                    <td className="px-6 py-4 text-xs font-mono text-slate-400 dark:text-slate-600 text-center bg-transparent">
                        {index + 1}
                    </td>
                    <td className="px-6 py-4">
                        {item.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                            <CheckCircle size={12} strokeWidth={2.5} /> SUCCESS
                        </span>
                        ) : item.status === 'RUNNING' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                            <PlayCircle size={12} strokeWidth={2.5} /> RUNNING
                        </span>
                        ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-100 dark:border-red-800">
                            <XCircle size={12} strokeWidth={2.5} /> FAILED
                        </span>
                        )}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-900 dark:text-white text-xs group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.id}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.date}</td>
                    <td className="px-6 py-4 font-mono text-xs">{item.duration}</td>
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                {item.triggeredBy.charAt(0)}
                            </div>
                            <span className="text-slate-700 dark:text-slate-200">{item.triggeredBy}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-700 dark:text-slate-300">
                        {item.records.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                         <HistoryActionMenu run={item} onView={onRunClick} />
                    </td>
                </tr>
            ))}
            {isLoadingMore && (
                <tr>
                    <td colSpan={8} className="py-6">
                        <div className="flex justify-center items-center gap-2 text-slate-400 text-sm">
                            <Loader2 size={18} className="animate-spin text-blue-500" />
                            Loading more records...
                        </div>
                    </td>
                </tr>
            )}
            {/* Spacer for bottom scrolling */}
            <tr className="h-12 bg-transparent border-none"><td colSpan={8}></td></tr>
            </tbody>
        </table>
    </div>
  );
};