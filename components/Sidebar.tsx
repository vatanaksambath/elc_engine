import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Play, History, Settings, ChevronsLeft, ChevronsRight, Zap } from 'lucide-react';
import { ViewType } from '../types';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

interface NavItemProps {
  view: ViewType;
  icon: any;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ view, icon: Icon, label, isActive, isCollapsed, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center relative group py-3 transition-all duration-200 mb-1 ${
         isCollapsed ? 'justify-center px-0' : 'px-4'
      }`}
      title={isCollapsed ? label : ""}
    >
      {/* Active Background Indicator */}
      <div className={`absolute inset-0 rounded-lg mx-2 transition-all duration-300 pointer-events-none ${
          isActive 
          ? 'bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 shadow-sm dark:shadow-[0_0_12px_rgba(37,99,235,0.1)]' 
          : 'bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-slate-800/50'
      }`} />

      {/* Active Left Line Marker (Digital feel) */}
      {isActive && !isCollapsed && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.8)] pointer-events-none" />
      )}

      <Icon 
          size={20} 
          className={`relative z-10 transition-all duration-300 ${
              isActive 
              ? 'text-blue-600 dark:text-blue-400 drop-shadow-sm dark:drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]' 
              : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300'
          }`} 
      />
      
      <span className={`relative z-10 ml-3 text-sm font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
        isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
      } ${isActive ? 'text-blue-700 dark:text-white tracking-wide' : 'text-gray-600 dark:text-slate-400 group-hover:text-gray-900 dark:group-hover:text-slate-200'}`}>
        {label}
      </span>
    </button>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange, isCollapsed, toggleCollapse }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
  };
  
  return (
    <div 
      className={`fixed left-0 top-0 h-full bg-white dark:bg-[#0B1120] border-r border-gray-200 dark:border-slate-800 flex flex-col z-20 transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
       <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #475569; }
      `}</style>

      {/* Digital Grid Background Effect - Dark Mode Only */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none hidden dark:block" 
           style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      {/* Logo Area */}
      <div className={`h-20 flex items-center relative shrink-0 ${isCollapsed ? 'justify-center' : 'px-6'}`}>
        <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-0 dark:opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-2 rounded-xl text-blue-600 dark:text-blue-500 group-hover:text-blue-500 group-hover:border-blue-400 dark:group-hover:border-blue-500/50 transition-colors shadow-sm">
                <Zap size={20} fill="currentColor" className="opacity-90" />
            </div>
        </div>
        
        <div className={`ml-3 overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight leading-none">ECL<span className="text-blue-600 dark:text-blue-500">.ENGINE</span></h1>
            <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono tracking-wider mt-0.5">V.2.4.1 BETA</p>
        </div>

        {/* Enhanced Digital Toggle Button */}
        <button 
          onClick={toggleCollapse}
          className="absolute -right-3 top-8 z-50 group outline-none"
        >
          <div className={`
             flex items-center justify-center w-6 h-6 rounded border shadow-sm transition-all duration-300 ease-out backdrop-blur-md
             ${isCollapsed 
               ? 'bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)] hover:bg-blue-500' 
               : 'bg-white dark:bg-slate-900/90 border-gray-200 dark:border-slate-700 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md'
             }
          `}>
             {isCollapsed ? (
               <ChevronsRight size={14} strokeWidth={2.5} className="group-hover:translate-x-0.5 transition-transform" />
             ) : (
               <ChevronsLeft size={14} strokeWidth={2.5} className="group-hover:-translate-x-0.5 transition-transform" />
             )}
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 space-y-1 px-2 relative z-10 overflow-y-auto custom-scrollbar">
        <div className={`px-4 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          Management
        </div>
        
        <NavItem 
          view="dashboard" 
          icon={LayoutDashboard} 
          label="Dashboard" 
          isActive={currentView === 'dashboard'} 
          isCollapsed={isCollapsed} 
          onClick={() => onViewChange('dashboard')} 
        />
        <NavItem 
          view="orchestration" 
          icon={Play} 
          label="Orchestration" 
          isActive={currentView === 'orchestration'} 
          isCollapsed={isCollapsed} 
          onClick={() => onViewChange('orchestration')} 
        />
        <NavItem 
          view="history" 
          icon={History} 
          label="History" 
          isActive={currentView === 'history'} 
          isCollapsed={isCollapsed} 
          onClick={() => onViewChange('history')} 
        />

        <div className={`px-4 mt-8 mb-2 text-[10px] font-bold text-gray-400 dark:text-slate-600 uppercase tracking-widest transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
          Configuration
        </div>

        <NavItem 
          view="settings" 
          icon={Settings} 
          label="System Settings" 
          isActive={currentView === 'settings'} 
          isCollapsed={isCollapsed} 
          onClick={() => onViewChange('settings')} 
        />
      </nav>

      {/* Footer System Time */}
      <div className={`shrink-0 p-4 border-t border-gray-200 dark:border-slate-800 transition-all duration-300 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
         <div className="font-mono text-xs text-gray-400 dark:text-slate-500 font-medium text-center tracking-tight">
            {formatDate(currentTime)} • {formatTime(currentTime)}
         </div>
      </div>
    </div>
  );
};