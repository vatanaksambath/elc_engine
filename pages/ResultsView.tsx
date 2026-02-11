import React, { useState, useEffect, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Download, Table, RotateCcw, Settings2, CheckSquare, X, Search, Lock, Loader2, ChevronDown, FileJson, FileSpreadsheet, FileText } from 'lucide-react';
import { LoanResult } from '../types';
import * as XLSX from 'xlsx';

interface ResultsViewProps {
  onRestart?: () => void;
}

// Templates for mock data generation (Partial templates to be enriched)
const SECTORS = ['Retail', 'Agriculture', 'Manufacturing', 'Services', 'Construction', 'Finance'];
const LOAN_CLASSES = ['Pass', 'Watchlist', 'Substandard', 'Doubtful', 'Loss'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY'];
const OFFICERS = ['David Kim', 'Alice Smith', 'Sarah Jenkins', 'James Wilson', 'Tom Brown'];
const FACILITIES = ['Term Loan', 'Overdraft', 'Mortgage', 'Credit Card', 'Letter of Credit'];

const getRandomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomFloat = (min: number, max: number) => Number((Math.random() * (max - min) + min).toFixed(2));

// Generate a large dataset for demonstration
const TOTAL_RECORDS = 5000;
const GENERATED_DATASET: LoanResult[] = Array.from({ length: TOTAL_RECORDS }, (_, i) => {
    const sector = SECTORS[i % SECTORS.length];
    const loanClass = LOAN_CLASSES[Math.floor(Math.random() * LOAN_CLASSES.length)];
    const currency = CURRENCIES[i % CURRENCIES.length];
    const limit = getRandomInt(10000, 5000000);
    const balance = getRandomFloat(0, limit);

    return {
        CID2: `C2-${10000 + i}`,
        CAT2: i % 3 === 0 ? 'Corporate' : i % 2 === 0 ? 'SME' : 'Retail',
        ActualReportDate: '2024-03-31',
        CID: `CID-${5000 + i}`,
        ACCNO: `ACC-${900000 + i}`,
        CATEGORY: i % 2 === 0 ? 'Commercial' : 'Personal',
        LOANCLASS: loanClass,
        SECTOR: sector,
        CREDITLIMIT: limit,
        CONTDATE: getRandomDate(new Date(2020, 0, 1), new Date(2023, 0, 1)),
        MATDATE: getRandomDate(new Date(2024, 0, 1), new Date(2030, 0, 1)),
        TERMINMONTH: getRandomInt(12, 120),
        LONGTERMYN: getRandomInt(0, 1) ? 'Y' : 'N',
        INTRATE: getRandomFloat(2.5, 15.0),
        OVRINTTHISMONTH: getRandomFloat(0, 500),
        PAIDINT: getRandomFloat(1000, 50000),
        PAIDPR: getRandomFloat(5000, 200000),
        RISKRATE: `RR-${getRandomInt(1, 10)}`,
        BALFWD: balance - getRandomFloat(0, 1000),
        BALANCE: balance,
        OVRDUEDAY: loanClass === 'Pass' ? 0 : getRandomInt(1, 180),
        OVRDUETERM: loanClass === 'Pass' ? 0 : getRandomInt(1, 6),
        ODDINT: getRandomFloat(0, 100),
        TBACCR: getRandomFloat(0, 50),
        REPAYTYPE: 'Principal+Interest',
        NBCINDUSTRY: `IND-${getRandomInt(100, 999)}`,
        ACCOUNTOFFICER: OFFICERS[i % OFFICERS.length],
        BUSSTYPE: 'Private',
        SUBAC: `SUB-${getRandomInt(1, 5)}`,
        SUBACTYPE: 'Normal',
        LOANFACILITY: FACILITIES[i % FACILITIES.length],
        CURRENCY: currency,
        REPAYMETHOD: 'Auto-Debit',
        INDUSTRYAC: `IAC-${getRandomInt(10, 99)}`
    };
});

interface ColumnConfig {
    key: keyof LoanResult; 
    label: string; 
    align?: 'left' | 'right' | 'center';
    isMandatory?: boolean;
    format?: 'currency' | 'date' | 'number' | 'text';
}

// Define Base Columns based on the request (First 10 are Mandatory)
const BASE_COLUMNS: ColumnConfig[] = [
    // LOCKED COLUMNS (First 10)
    { key: 'CID2', label: 'CID2', isMandatory: true },
    { key: 'CAT2', label: 'CAT2', isMandatory: true },
    { key: 'ActualReportDate', label: 'Actual Report Date', isMandatory: true, format: 'date' },
    { key: 'CID', label: 'CID', isMandatory: true },
    { key: 'ACCNO', label: 'Account No', isMandatory: true },
    { key: 'CATEGORY', label: 'Category', isMandatory: true },
    { key: 'LOANCLASS', label: 'Loan Class', isMandatory: true },
    { key: 'SECTOR', label: 'Sector', isMandatory: true },
    { key: 'CREDITLIMIT', label: 'Credit Limit', align: 'right', format: 'currency', isMandatory: true },
    { key: 'CONTDATE', label: 'Contract Date', isMandatory: true, format: 'date' },
    
    // OTHER COLUMNS (Optional)
    { key: 'MATDATE', label: 'Maturity Date', isMandatory: false, format: 'date' },
    { key: 'TERMINMONTH', label: 'Term (Months)', align: 'right', format: 'number', isMandatory: false },
    { key: 'LONGTERMYN', label: 'Long Term', align: 'center', isMandatory: false },
    { key: 'INTRATE', label: 'Int Rate %', align: 'right', format: 'number', isMandatory: false },
    { key: 'OVRINTTHISMONTH', label: 'Overdue Int (Mo)', align: 'right', format: 'currency', isMandatory: false },
    { key: 'PAIDINT', label: 'Paid Int', align: 'right', format: 'currency', isMandatory: false },
    { key: 'PAIDPR', label: 'Paid Principal', align: 'right', format: 'currency', isMandatory: false },
    { key: 'RISKRATE', label: 'Risk Rate', isMandatory: false },
    { key: 'BALFWD', label: 'Balance Fwd', align: 'right', format: 'currency', isMandatory: false },
    { key: 'BALANCE', label: 'Balance', align: 'right', format: 'currency', isMandatory: false },
    { key: 'OVRDUEDAY', label: 'Overdue Days', align: 'right', format: 'number', isMandatory: false },
    { key: 'OVRDUETERM', label: 'Overdue Term', align: 'right', format: 'number', isMandatory: false },
    { key: 'ODDINT', label: 'Odd Int', align: 'right', format: 'currency', isMandatory: false },
    { key: 'TBACCR', label: 'TB Accr', align: 'right', format: 'currency', isMandatory: false },
    { key: 'REPAYTYPE', label: 'Repay Type', isMandatory: false },
    { key: 'NBCINDUSTRY', label: 'NBC Industry', isMandatory: false },
    { key: 'ACCOUNTOFFICER', label: 'Account Officer', isMandatory: false },
    { key: 'BUSSTYPE', label: 'Business Type', isMandatory: false },
    { key: 'SUBAC', label: 'Sub AC', isMandatory: false },
    { key: 'SUBACTYPE', label: 'Sub AC Type', isMandatory: false },
    { key: 'LOANFACILITY', label: 'Loan Facility', isMandatory: false },
    { key: 'CURRENCY', label: 'Currency', isMandatory: false },
    { key: 'REPAYMETHOD', label: 'Repay Method', isMandatory: false },
    { key: 'INDUSTRYAC', label: 'Industry AC', isMandatory: false },
];

const ALL_COLUMNS_CONFIG = BASE_COLUMNS;
const PAGE_SIZE = 50; 

// Initial visible columns: Lock to the first 10 columns which are mandatory
const DEFAULT_VISIBLE = new Set(ALL_COLUMNS_CONFIG.slice(0, 10).map(col => col.key));

export const ResultsView: React.FC<ResultsViewProps> = ({ onRestart }) => {
  // Visible Columns State
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(DEFAULT_VISIBLE);
  
  // Lazy Loading State
  const [displayedRows, setDisplayedRows] = useState<LoanResult[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Modal & Search State
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [tempVisibleColumns, setTempVisibleColumns] = useState<Set<string>>(new Set());
  const [columnSearchQuery, setColumnSearchQuery] = useState('');

  // Export State
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  // Close export menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
            setIsExportMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initial Load
  useEffect(() => {
    loadMoreData();
  }, []);

  // Function to load next batch of data
  const loadMoreData = () => {
    if (isLoadingMore || displayedRows.length >= TOTAL_RECORDS) return;

    setIsLoadingMore(true);
    
    // Simulate network delay for realistic "lazy loading" feel
    setTimeout(() => {
        const nextIndex = displayedRows.length;
        const nextBatch = GENERATED_DATASET.slice(nextIndex, nextIndex + PAGE_SIZE);
        
        setDisplayedRows(prev => [...prev, ...nextBatch]);
        setIsLoadingMore(false);
    }, 600);
  };

  // Scroll Handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    // Load more when scrolled to bottom (within 100px threshold)
    if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMoreData();
    }
  };

  // Open Modal Handler
  const openModal = () => {
    setTempVisibleColumns(new Set(visibleColumns));
    setColumnSearchQuery('');
    setIsColumnModalOpen(true);
  };

  // Toggle Column inside Modal
  const toggleTempColumn = (key: string, isMandatory?: boolean) => {
    if (isMandatory) return; 

    const newSet = new Set(tempVisibleColumns);
    if (newSet.has(key)) {
        newSet.delete(key);
    } else {
        newSet.add(key);
    }
    setTempVisibleColumns(newSet);
  };

  // Select/Deselect All in Modal
  const handleSelectAll = (select: boolean) => {
    if (select) {
        setTempVisibleColumns(new Set(ALL_COLUMNS_CONFIG.map(c => c.key)));
    } else {
        const mandatoryKeys = ALL_COLUMNS_CONFIG.filter(c => c.isMandatory).map(c => c.key);
        setTempVisibleColumns(new Set(mandatoryKeys));
    }
  }

  // Apply Changes
  const applyColumnChanges = () => {
    if (tempVisibleColumns.size === 0) {
        alert("Please select at least one column.");
        return;
    }
    setVisibleColumns(tempVisibleColumns);
    setIsColumnModalOpen(false);
  };

  const handleExport = (format: 'csv' | 'json' | 'xlsx') => {
    const colsToExport = ALL_COLUMNS_CONFIG.filter(col => visibleColumns.has(col.key));
    const dataToExport = GENERATED_DATASET; // Export all data
    const timestamp = new Date().toISOString().slice(0,10);

    if (format === 'xlsx') {
        // Create Data with Labels
        const dataForSheet = dataToExport.map(row => {
            const rowObj: any = {};
            colsToExport.forEach(col => {
                rowObj[col.label] = row[col.key as keyof LoanResult];
            });
            return rowObj;
        });

        const worksheet = XLSX.utils.json_to_sheet(dataForSheet);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "ECL Results");
        XLSX.writeFile(workbook, `ecl_results_${timestamp}.xlsx`);
    } 
    else if (format === 'csv') {
        const headerRow = colsToExport.map(col => `"${col.label}"`).join(",");
        const dataRows = dataToExport.map(row => {
            return colsToExport.map(col => {
                let val = row[col.key as keyof LoanResult];
                return `"${String(val).replace(/"/g, '""')}"`;
            }).join(",");
        }).join("\n");
        const content = `${headerRow}\n${dataRows}`;
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        triggerDownload(blob, `ecl_results_${timestamp}.csv`);
    } 
    else if (format === 'json') {
        const jsonOutput = dataToExport.map(row => {
            const rowObj: any = {};
            colsToExport.forEach(col => {
                rowObj[col.label] = row[col.key as keyof LoanResult];
            });
            return rowObj;
        });
        const content = JSON.stringify(jsonOutput, null, 2);
        const blob = new Blob([content], { type: 'application/json;charset=utf-8;' });
        triggerDownload(blob, `ecl_results_${timestamp}.json`);
    }

    setIsExportMenuOpen(false);
  };

  const triggerDownload = (blob: Blob, filename: string) => {
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredColumns = useMemo(() => {
     return ALL_COLUMNS_CONFIG.filter(c => 
        c.label.toLowerCase().includes(columnSearchQuery.toLowerCase()) || 
        c.key.toLowerCase().includes(columnSearchQuery.toLowerCase())
      );
  }, [columnSearchQuery]);

  const formatValue = (value: any, config: ColumnConfig) => {
      if (value === undefined || value === null) return <span className="text-gray-300 dark:text-gray-600">--</span>;
      
      if (config.format === 'currency') {
          return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value as number);
      }
      if (config.format === 'number') {
          return new Intl.NumberFormat('en-US').format(value as number);
      }
      return value;
  };

  return (
    <div className="h-full space-y-8 animate-fade-in flex flex-col">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
        
        {/* Header Toolbar */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between bg-gray-50 dark:bg-slate-900 shrink-0 gap-4">
            <h3 className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Table size={18} className="text-gray-400"/> Detailed Loan Data
            </h3>
            
            <div className="flex flex-wrap gap-3">
              {onRestart && (
                  <button 
                    onClick={onRestart}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
                  >
                    <RotateCcw size={16} />
                    New Run
                  </button>
              )}

              <button 
                onClick={openModal}
                className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Settings2 size={16} />
                Columns ({visibleColumns.size})
              </button>
              
              {/* Dropdown Export Menu */}
              <div className="relative" ref={exportMenuRef}>
                <button 
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm active:scale-95 transform duration-150"
                >
                    <Download size={16} />
                    Export
                    <ChevronDown size={14} className={`transition-transform duration-200 ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isExportMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 animate-fade-in-up">
                        <div className="p-1">
                            <button onClick={() => handleExport('csv')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors">
                                <FileText size={16} className="text-emerald-600" />
                                <span>CSV (.csv)</span>
                            </button>
                            <button onClick={() => handleExport('xlsx')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors">
                                <FileSpreadsheet size={16} className="text-green-600" />
                                <span>Excel (.xlsx)</span>
                            </button>
                            <button onClick={() => handleExport('json')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-left transition-colors">
                                <FileJson size={16} className="text-amber-600" />
                                <span>JSON (.json)</span>
                            </button>
                        </div>
                    </div>
                )}
              </div>

            </div>
        </div>

        {/* Data Table */}
        <div 
            className="overflow-auto flex-1 bg-white dark:bg-slate-800 custom-scrollbar relative"
            onScroll={handleScroll}
        >
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 4px; }
                .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; }
            `}</style>
            <table className="w-full text-xs text-left text-gray-500 dark:text-gray-400 whitespace-nowrap border-collapse">
                <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-900">
                    <tr>
                         <th className="px-4 py-3 sticky left-0 top-0 z-30 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 border-r dark:border-slate-700 w-12 text-center shadow-sm">#</th>
                        {ALL_COLUMNS_CONFIG.map(col => (
                             visibleColumns.has(col.key) && (
                                <th key={col.key} className={`px-4 py-3 sticky top-0 z-20 bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}>
                                    {col.label}
                                </th>
                             )
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {displayedRows.map((row, index) => (
                        <tr key={index} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                             <td className="px-4 py-3 text-center sticky left-0 z-10 bg-white dark:bg-slate-800 border-r dark:border-slate-700 text-gray-300 font-mono text-[10px]">{index + 1}</td>
                            {ALL_COLUMNS_CONFIG.map(col => {
                                if (!visibleColumns.has(col.key)) return null;

                                const value = row[col.key as keyof LoanResult];
                                let cellContent: React.ReactNode = formatValue(value, col);

                                // Special Styling for specific columns
                                if (col.key === 'LOANCLASS') {
                                     cellContent = (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                            value === 'Pass' ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800' : 
                                            value === 'Watchlist' ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800' :
                                            'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800'
                                        }`}>
                                            {value}
                                        </span>
                                    );
                                } else if (col.key === 'LONGTERMYN') {
                                    cellContent = (
                                        <span className={`font-bold ${value === 'Y' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                            {value}
                                        </span>
                                    );
                                }

                                return (
                                    <td key={col.key} className={`px-4 py-3 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : ''}`}>
                                        {cellContent}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {isLoadingMore && (
                        <tr>
                            <td colSpan={visibleColumns.size + 1} className="py-8 text-center bg-gray-50/50 dark:bg-slate-900/30">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="animate-spin text-blue-600 dark:text-blue-400" size={24} />
                                    <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Loading records...</span>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 text-xs text-center text-gray-500 dark:text-gray-400 shrink-0 flex justify-between items-center px-6">
            <span>Showing {displayedRows.length.toLocaleString()} of {TOTAL_RECORDS.toLocaleString()} records</span>
            <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div 
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${(displayedRows.length / TOTAL_RECORDS) * 100}%` }}
                    />
                </div>
                <span>{Math.round((displayedRows.length / TOTAL_RECORDS) * 100)}%</span>
            </div>
        </div>
      </div>

      {/* Column Manager Modal */}
      {isColumnModalOpen && createPortal(
       <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-4xl flex flex-col border border-gray-200 dark:border-slate-700 animate-fade-in-up h-[85vh]">
             
             {/* Modal Header */}
             <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-700 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Customize Columns</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Select columns to display. Mandatory columns are locked.</p>
                </div>
                <button onClick={() => setIsColumnModalOpen(false)} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                    <X size={20} />
                </button>
             </div>
             
             {/* Modal Controls (Search & Select All) */}
             <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 flex flex-col md:flex-row gap-4 items-center justify-between shrink-0">
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input 
                        type="text" 
                        placeholder={`Search ${ALL_COLUMNS_CONFIG.length} columns...`}
                        value={columnSearchQuery}
                        onChange={(e) => setColumnSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div className="flex gap-4 text-sm w-full md:w-auto justify-end">
                    <button onClick={() => handleSelectAll(true)} className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium hover:underline">Select All</button>
                    <span className="text-gray-300 dark:text-slate-600">|</span>
                    <button onClick={() => handleSelectAll(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium hover:underline">Deselect All</button>
                </div>
             </div>

             {/* Modal Body (Scrollable List) */}
             <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-gray-50/50 dark:bg-slate-900/20">
                {filteredColumns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {filteredColumns.map(col => {
                            const isSelected = tempVisibleColumns.has(col.key);
                            const isMandatory = col.isMandatory || false;
                            
                            return (
                                <div 
                                    key={col.key} 
                                    onClick={() => toggleTempColumn(col.key, isMandatory)}
                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all select-none ${
                                        isMandatory 
                                            ? 'bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-600 cursor-not-allowed opacity-80'
                                            : isSelected 
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50 cursor-pointer' 
                                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 cursor-pointer'
                                    }`}
                                >
                                    <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                                        isMandatory
                                            ? 'bg-gray-300 dark:bg-slate-600 border-gray-400 dark:border-slate-500 text-gray-600 dark:text-gray-300'
                                            : isSelected
                                                ? 'bg-blue-600 border-blue-600 text-white'
                                                : 'bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-500'
                                    }`}>
                                        {isMandatory ? <Lock size={12} /> : (isSelected && <CheckSquare size={14} />)}
                                    </div>
                                    <span className={`text-sm font-medium truncate ${
                                        isMandatory 
                                            ? 'text-gray-500 dark:text-gray-400' 
                                            : isSelected
                                                ? 'text-blue-700 dark:text-blue-300' 
                                                : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                        {col.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-500 dark:text-gray-400">
                        <Search size={32} className="mb-2 opacity-50" />
                        <p>No columns found matching "{columnSearchQuery}"</p>
                    </div>
                )}
             </div>

             {/* Modal Footer */}
             <div className="p-6 border-t border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50 rounded-b-xl shrink-0">
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                    <span className="font-bold text-gray-900 dark:text-white">{tempVisibleColumns.size}</span> columns selected
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-400">{ALL_COLUMNS_CONFIG.filter(c => c.isMandatory).length} Mandatory</span>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsColumnModalOpen(false)} className="px-5 py-2.5 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={applyColumnChanges} className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95">
                        Apply Configuration
                    </button>
                </div>
             </div>
          </div>
       </div>,
       document.body
      )}
    </div>
  );
};