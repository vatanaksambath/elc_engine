import React, { useState, useMemo } from 'react';
import { Database, TrendingUp, Users, Calendar, ArrowRight, Lock, Play, MousePointerClick, CheckCircle2, CheckSquare, Square, Wifi, WifiOff, Globe, Server, Activity, AlertTriangle } from 'lucide-react';
import { ExecutionMode, RunConfiguration } from '../types';

interface ConfigurationViewProps {
  onNext: (mode: ExecutionMode, config: RunConfiguration) => void;
  status: 'idle' | 'running' | 'completed' | 'failed';
  selectedMode?: ExecutionMode;
  currentConfig?: RunConfiguration;
}

export const ConfigurationView: React.FC<ConfigurationViewProps> = ({ onNext, status, selectedMode, currentConfig }) => {
  // Helper to parse scope string back to IDs
  const parseScopes = (scopeStr: string) => {
      const ids: string[] = [];
      if (!scopeStr) return [];
      const lowerScope = scopeStr.toLowerCase();
      
      if (lowerScope.includes('retail banking')) ids.push('retail');
      if (lowerScope.includes('sme / commercial')) ids.push('sme');
      if (lowerScope.includes('large corporate')) ids.push('corporate');
      
      return ids;
  };

  const [source, setSource] = useState(currentConfig?.sourceSystem || 'Snowflake_Prod_DW');
  const [snapshotDate, setSnapshotDate] = useState(currentConfig?.snapshotDate || '2024-03-31');
  // Default to what comes in config (likely 'base') or empty if undefined
  const [methodology, setMethodology] = useState<string>(currentConfig?.methodology || 'base');
  
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
      currentConfig ? parseScopes(currentConfig.scope) : []
  );
  
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(selectedMode || 'automated');
  
  const isReadOnly = status !== 'idle';

  // Logic to determine if source is online (Simulated)
  const isSourceOnline = useMemo(() => {
      return source !== 'Oracle_Legacy_DB';
  }, [source]);

  const scopeOptions = [
    { id: 'retail', label: 'Retail Banking', desc: 'Pooled approach' },
    { id: 'sme', label: 'SME / Commercial', desc: 'Individual assessment' },
    { id: 'corporate', label: 'Large Corporate', desc: 'Cash flow analysis' }
  ];

  const toggleScope = (id: string) => {
    if (isReadOnly) return;
    
    // Validation check (UI should prevent this, but safety check)
    const isRetailSelected = selectedScopes.includes('retail');
    const isOtherSelected = selectedScopes.some(s => s !== 'retail');
    
    // If trying to select Retail but others are selected -> Block
    if (id === 'retail' && isOtherSelected && !selectedScopes.includes('retail')) return;
    
    // If trying to select Other but Retail is selected -> Block
    if (id !== 'retail' && isRetailSelected && !selectedScopes.includes(id)) return;

    setSelectedScopes(prev => {
        if (prev.includes(id)) {
            return prev.filter(s => s !== id);
        } else {
            return [...prev, id];
        }
    });
  };

  const handleStart = () => {
    if (!isSourceOnline) return;

    // Join multiple scopes into a string string for the config
    const scopeString = selectedScopes.length > 0 
        ? selectedScopes.map(s => scopeOptions.find(o => o.id === s)?.label).join(', ') 
        : 'None';

    onNext(executionMode, {
        sourceSystem: source,
        snapshotDate,
        methodology,
        scope: scopeString
    });
  };

  // Validation: Check if configuration is complete
  const isConfigComplete = selectedScopes.length > 0 && !!methodology && isSourceOnline;

  return (
    <div className="flex flex-col h-full w-full animate-fade-in relative">
      <div className="mb-6 flex justify-between items-center shrink-0">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Pipeline Configuration</h2>
            <p className="text-gray-500 dark:text-gray-400">Setup data sources and parameters.</p>
        </div>
        {isReadOnly && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-lg text-sm font-medium border border-gray-200 dark:border-slate-700">
                <Lock size={14} />
                <span>Read Only</span>
            </div>
        )}
      </div>

      {/* Main Grid - Flexible Height */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4 flex-1 min-h-0 overflow-y-auto pb-4 custom-scrollbar pr-2">
         <style>{`
            .custom-scrollbar::-webkit-scrollbar { width: 6px; }
            .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #475569; }
            
            /* Native Date Picker Styling Hack: 
               Position the native indicator over our custom icon area and make it transparent.
               This ensures clicking the icon area triggers the native picker.
            */
            input[type="date"] {
               position: relative;
            }
            input[type="date"]::-webkit-calendar-picker-indicator {
                position: absolute;
                top: 0;
                right: 0;
                width: 2.5rem; 
                height: 100%;
                margin: 0;
                padding: 0;
                opacity: 0;
                cursor: pointer;
            }

            /* Ensure native picker uses correct color scheme */
            .dark input[type="date"] {
                color-scheme: dark;
            }
            input[type="date"] {
                color-scheme: light;
            }
        `}</style>
        
        {/* Card 1: Data Source - DIGITALIZED */}
        <div className={`relative flex flex-col bg-white dark:bg-slate-800 p-0 rounded-xl border transition-all overflow-hidden group/card ${isReadOnly ? 'border-gray-200 dark:border-slate-700 opacity-80' : 'border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-blue-400/50 dark:hover:border-blue-500/50'}`}>
          
          {/* Digital Header Bar */}
          <div className="bg-gray-50 dark:bg-slate-900/50 border-b border-gray-100 dark:border-slate-700 p-4 flex justify-between items-center">
             <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                    <Database size={18} />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm tracking-wide uppercase font-mono">Data_Source</h3>
             </div>
             <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${
                 isSourceOnline 
                 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                 : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/50'
             }`}>
                {isSourceOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                <span>{isSourceOnline ? 'ONLINE' : 'OFFLINE'}</span>
             </div>
          </div>
          
          <div className="p-6 space-y-6 flex-1 bg-gradient-to-b from-white to-gray-50/50 dark:from-slate-800 dark:to-slate-900/50">
            
            {/* Source Selection with Tech Details */}
            <div>
              <label className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  <span>System Endpoint</span>
                  <span className="font-mono text-[10px] opacity-70">REGION: US-EAST-1</span>
              </label>
              
              <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <Server size={16} className={`transition-colors ${isSourceOnline ? 'text-gray-400 group-focus-within:text-blue-500' : 'text-red-400'}`} />
                  </div>
                  <select 
                    value={source} 
                    onChange={(e) => setSource(e.target.value)}
                    disabled={isReadOnly}
                    className={`w-full pl-10 pr-10 rounded-lg shadow-sm focus:ring-2 border py-3 text-sm font-mono bg-white dark:bg-slate-900 dark:text-blue-100 disabled:bg-gray-50 disabled:dark:bg-slate-800 disabled:text-gray-500 transition-all cursor-pointer appearance-none ${
                        isSourceOnline 
                        ? 'border-gray-200 dark:border-slate-600 focus:ring-blue-500/20 focus:border-blue-500 hover:border-blue-300 dark:hover:border-slate-500'
                        : 'border-red-300 dark:border-red-800 focus:ring-red-500/20 focus:border-red-500 hover:border-red-400'
                    }`}
                  >
                    <option value="Snowflake_Prod_DW">Snowflake_Prod_DW</option>
                    <option value="Oracle_Legacy_DB">Oracle_Legacy_DB</option>
                    <option value="S3_DataLake">S3_DataLake_Raw</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <div className="flex flex-col gap-0.5">
                          <div className={`w-1 h-1 rounded-full ${isSourceOnline ? 'bg-gray-400' : 'bg-red-400'}`}></div>
                          <div className={`w-1 h-1 rounded-full ${isSourceOnline ? 'bg-gray-400' : 'bg-red-400'}`}></div>
                          <div className={`w-1 h-1 rounded-full ${isSourceOnline ? 'bg-gray-400' : 'bg-red-400'}`}></div>
                      </div>
                  </div>
              </div>

              {/* Connection Stats Micro-dashboard */}
              <div className="mt-2 grid grid-cols-2 gap-2">
                 <div className="bg-gray-100 dark:bg-slate-900/50 rounded border border-gray-200 dark:border-slate-700/50 p-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Latency</span>
                    <span className={`text-[10px] font-mono font-bold ${isSourceOnline ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                        {isSourceOnline ? '24ms' : 'TIMEOUT'}
                    </span>
                 </div>
                 <div className="bg-gray-100 dark:bg-slate-900/50 rounded border border-gray-200 dark:border-slate-700/50 p-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-gray-400 uppercase">Uptime</span>
                    <span className={`text-[10px] font-mono font-bold ${isSourceOnline ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500'}`}>
                        {isSourceOnline ? '99.99%' : '0.00%'}
                    </span>
                 </div>
              </div>
            </div>

            {/* Date Selection with Partition logic visualization */}
            <div>
              <label className="flex justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  <span>Target Partition</span>
              </label>
              
              <div className="relative group">
                <input 
                  type="date" 
                  value={snapshotDate}
                  onChange={(e) => setSnapshotDate(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full pl-3 pr-10 border-gray-200 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border py-3 text-sm font-mono bg-white dark:bg-slate-900 dark:text-blue-100 disabled:bg-gray-50 disabled:dark:bg-slate-800 disabled:text-gray-500 transition-all cursor-pointer hover:border-blue-300 dark:hover:border-slate-500" 
                />
                <div 
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none ${isReadOnly ? 'opacity-50' : ''}`}
                >
                    <Calendar className="text-gray-400 dark:text-slate-500" size={16} />
                </div>
              </div>
               
              {/* Generated Partition ID */}
              <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50/50 dark:bg-blue-900/10 rounded border border-blue-100 dark:border-blue-800/30">
                  <Globe size={12} className="text-blue-400" />
                  <span className="text-[10px] text-gray-500 dark:text-slate-400">Partition ID:</span>
                  <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-300 truncate">
                      {snapshotDate ? `PART_${snapshotDate.replace(/-/g, '')}_V1` : '---'}
                  </span>
              </div>
            </div>
          </div>

          {/* Decorative Bottom Bar */}
          <div className="h-1 w-full bg-gray-100 dark:bg-slate-700 flex">
               <div className={`w-1/3 h-full transition-colors duration-300 ${isSourceOnline ? 'bg-blue-500 dark:bg-blue-600' : 'bg-red-500'}`}></div>
               <div className="w-1/3 bg-transparent h-full"></div>
               <div className="w-1/3 bg-gray-300 dark:bg-slate-600 h-full"></div>
          </div>
        </div>
        
        {/* Card 2: Methodology */}
        <div className={`flex flex-col bg-white dark:bg-slate-800 p-6 rounded-xl border transition-shadow ${isReadOnly ? 'border-gray-200 dark:border-slate-700 opacity-80' : 'border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-center gap-3 mb-6 text-purple-600 dark:text-purple-400 shrink-0">
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Methodology</h3>
          </div>

          <div className="space-y-4 flex-1">
            <div 
              className={`p-4 rounded-lg border transition-all ${
                methodology === 'base' 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-gray-200 dark:border-slate-700'
              } ${!isReadOnly ? 'cursor-pointer hover:border-gray-300 dark:hover:border-slate-600' : ''}`} 
              onClick={() => !isReadOnly && setMethodology('base')}
            >
              <div className="flex items-start">
                <input 
                  type="radio" 
                  name="methodology" 
                  checked={methodology === 'base'}
                  onChange={() => setMethodology('base')}
                  disabled={isReadOnly}
                  className="mt-0.5 h-5 w-5 shrink-0 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer disabled:text-gray-400" 
                />
                <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">IFRS 9 Base Case</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">Standard forward-looking PD/LGD models</span>
                </div>
              </div>
            </div>

            <div 
              className={`p-4 rounded-lg border transition-all ${
                methodology === 'stress' 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-gray-200 dark:border-slate-700'
              } ${!isReadOnly ? 'cursor-pointer hover:border-gray-300 dark:hover:border-slate-600' : ''}`} 
              onClick={() => !isReadOnly && setMethodology('stress')}
            >
               <div className="flex items-start">
                <input 
                  type="radio" 
                  name="methodology" 
                  checked={methodology === 'stress'}
                  onChange={() => setMethodology('stress')}
                  disabled={isReadOnly}
                  className="mt-0.5 h-5 w-5 shrink-0 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 cursor-pointer disabled:text-gray-400" 
                />
                <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">Severe Stress Test</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">Macroeconomic shock scenario (-3% GDP)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Scope */}
        <div className={`flex flex-col bg-white dark:bg-slate-800 p-6 rounded-xl border transition-shadow ${isReadOnly ? 'border-gray-200 dark:border-slate-700 opacity-80' : 'border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md'}`}>
          <div className="flex items-center gap-3 mb-6 text-emerald-600 dark:text-emerald-400 shrink-0">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg">
                <Users size={24} />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Portfolio Scope</h3>
          </div>

          <div className="space-y-4 flex-1">
             <div className="space-y-3">
                {scopeOptions.map((item) => {
                    const isSelected = selectedScopes.includes(item.id);
                    
                    // Determine Disabled State based on Logic
                    let isOptionDisabled = isReadOnly;
                    if (!isReadOnly) {
                        const isRetailSelected = selectedScopes.includes('retail');
                        const isOtherSelected = selectedScopes.some(s => s !== 'retail');

                        if (item.id === 'retail') {
                             if (isOtherSelected) isOptionDisabled = true;
                        } else {
                             if (isRetailSelected) isOptionDisabled = true;
                        }
                    }

                    return (
                        <div 
                        key={item.id}
                        className={`p-4 rounded-lg border transition-all select-none ${
                            isOptionDisabled 
                             ? 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-slate-700'
                             : isSelected 
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 cursor-pointer' 
                                : 'border-gray-200 dark:border-slate-700 cursor-pointer hover:border-gray-300 dark:hover:border-slate-600'
                        }`} 
                        onClick={() => !isOptionDisabled && toggleScope(item.id)}
                        >
                        <div className="flex items-start">
                            <div className={`mt-0.5 mr-3 flex-shrink-0 transition-colors ${
                                isSelected 
                                ? 'text-emerald-600' 
                                : isOptionDisabled ? 'text-gray-200 dark:text-slate-700' : 'text-gray-300 dark:text-slate-600'
                            }`}>
                                {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                            </div>
                            <div>
                                <span className={`block text-sm font-medium ${isOptionDisabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                                    {item.label}
                                </span>
                                <span className="block text-xs text-gray-500 dark:text-gray-400">{item.desc}</span>
                            </div>
                        </div>
                        </div>
                    );
                })}
             </div>
          </div>
        </div>
      </div>

      {/* Footer Area with Embedded Execution Mode */}
      <div className={`mt-auto pt-6 border-t border-gray-200 dark:border-slate-800 shrink-0 ${isReadOnly ? 'hidden' : 'block'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Mode Selection - Horizontal */}
            <div className="flex items-center gap-4 bg-gray-50 dark:bg-slate-900 p-1.5 rounded-lg border border-gray-200 dark:border-slate-700">
                <button
                    onClick={() => setExecutionMode('automated')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        executionMode === 'automated' 
                        ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    <Play size={16} className={executionMode === 'automated' ? 'fill-blue-700 dark:fill-blue-300' : ''} />
                    Automated
                </button>
                <button
                    onClick={() => setExecutionMode('manual')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                        executionMode === 'manual' 
                        ? 'bg-white dark:bg-slate-800 text-blue-700 dark:text-blue-300 shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                >
                    <MousePointerClick size={16} />
                    Manual Step
                </button>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                 {/* Offline Warning */}
                 {!isSourceOnline && (
                     <div className="flex items-center gap-2 text-xs text-red-500 font-medium bg-red-50 dark:bg-red-900/10 px-3 py-2 rounded-lg border border-red-100 dark:border-red-900/30">
                        <AlertTriangle size={14} />
                        <span>Source Offline: Cannot Start</span>
                     </div>
                 )}

                {/* Run Button - Shown only when configuration is complete */}
                {isConfigComplete ? (
                    <button 
                        onClick={handleStart}
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold shadow-md transition-all active:scale-95 group bg-blue-600 hover:bg-blue-700 text-white animate-fade-in"
                    >
                        Start Pipeline
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                ) : (
                    <button 
                        disabled
                        className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 cursor-not-allowed opacity-70"
                    >
                        Start Pipeline
                        <ArrowRight size={18} />
                    </button>
                )}
            </div>
        </div>
        <p className="text-xs text-center md:text-left text-gray-400 dark:text-gray-500 mt-2 ml-1">
            {executionMode === 'automated' 
                ? 'Automated: Runs all stages consecutively.' 
                : 'Manual: Requires confirmation for each stage.'}
        </p>
      </div>
      
      {/* Read Only Status Indicator for Footer */}
      {isReadOnly && (
         <div className="mt-auto pt-6 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
             <div className="flex items-center gap-2">
                <span>Selected Mode:</span>
                <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                    {executionMode === 'automated' ? <Play size={14}/> : <MousePointerClick size={14}/>}
                    {executionMode === 'automated' ? 'Automated Sequence' : 'Manual Stage Control'}
                </span>
             </div>
             <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckCircle2 size={16} />
                <span>Configuration Locked</span>
             </div>
         </div>
      )}

    </div>
  );
};