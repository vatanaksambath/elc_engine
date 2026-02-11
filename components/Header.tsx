import React from 'react';
import { Step, ViewType } from '../types';
import { Check, ChevronRight, History, Sun, Moon, User, LayoutDashboard, Settings } from 'lucide-react';

interface HeaderProps {
  currentStep: Step;
  maxReachedStep: Step;
  onStepClick: (step: Step) => void;
  currentView: ViewType;
  isSidebarCollapsed: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentStep, 
  maxReachedStep, 
  onStepClick, 
  currentView, 
  isSidebarCollapsed,
  isDarkMode,
  toggleTheme 
}) => {
  const steps: { id: Step; label: string }[] = [
    { id: 1, label: 'Setup' },
    { id: 2, label: 'Processing' },
    { id: 3, label: 'Results' },
  ];

  const getBreadcrumbs = () => {
    switch(currentView) {
        case 'dashboard': return { section: 'ECL', title: 'Dashboard', icon: <LayoutDashboard size={20} /> };
        case 'settings': return { section: 'ECL', title: 'Configuration', icon: <Settings size={20} /> };
        case 'history': return { section: 'ECL', title: 'Run History', icon: <History size={20} /> };
        default: return { section: 'ECL', title: 'Pipeline Execution', icon: null };
    }
  }

  const { section, title } = getBreadcrumbs();

  return (
    <header 
      className={`fixed top-0 right-0 h-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm z-10 px-6 lg:px-10 flex items-center justify-between transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      
      {/* Breadcrumb / Title area */}
      <div className="flex items-center font-medium text-slate-500 dark:text-slate-400">
        <span className="text-lg">{section}</span>
        <ChevronRight size={20} className="mx-2 text-slate-400" />
        <span className="text-slate-900 dark:text-white font-bold text-lg">
          {title}
        </span>
      </div>

      {/* Central Progress Stepper - Only visible in Orchestration View */}
      {currentView === 'orchestration' ? (
        <div className="flex items-center">
          {steps.map((step, index) => {
            const isFinalStep = step.id === 3;
            const isPast = maxReachedStep > step.id;
            const isCompleted = isPast || (isFinalStep && maxReachedStep === 3);
            
            const isActive = currentStep === step.id;
            const isClickable = step.id <= maxReachedStep;

            return (
              <div 
                key={step.id} 
                className={`flex items-center ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                {/* Step Line - WIDENED for better full screen look (w-12 to w-32 on xl) */}
                {index > 0 && (
                  <div 
                    className={`w-12 lg:w-24 xl:w-40 h-1 mx-2 lg:mx-4 transition-all duration-500 rounded-full ${
                       maxReachedStep >= step.id ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'
                    }`}
                  />
                )}
                
                {/* Step Bubble + Label */}
                <div className="flex items-center gap-2 lg:gap-3 group">
                  <div 
                    className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-sm lg:text-base font-bold border-2 transition-all duration-300 shadow-sm
                      ${isCompleted 
                          ? 'border-blue-600 bg-blue-600 text-white' 
                          : isActive 
                              ? 'border-blue-600 bg-white dark:bg-slate-800 text-blue-600 ring-4 ring-blue-50 dark:ring-blue-900/30' 
                              : 'border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-slate-800 group-hover:border-gray-300 dark:group-hover:border-slate-600'
                      }
                    `}
                  >
                    {isCompleted ? <Check size={16} strokeWidth={3} /> : step.id}
                  </div>
                  <span className={`text-sm font-bold transition-colors duration-300 hidden md:inline-block ${
                    isActive ? 'text-blue-900 dark:text-blue-400' : isCompleted ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-600'
                  }`}>
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
         <div /> 
      )}

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-800 dark:text-white leading-tight">Risk_Admin_01</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">System Admin</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-gray-200 dark:border-slate-700">
             <User size={18} className="text-slate-600 dark:text-slate-300" />
          </div>
        </div>
      </div>
    </header>
  );
};