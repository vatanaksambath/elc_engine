import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface ExecutionModalsProps {
  isCancelModalOpen: boolean;
  isRetryModalOpen: boolean;
  isNewRunModalOpen: boolean;
  onCloseCancel: () => void;
  onConfirmCancel: () => void;
  onCloseRetry: () => void;
  onConfirmRetry: () => void;
  onCloseNewRun: () => void;
  onConfirmNewRun: () => void;
}

export const ExecutionModals: React.FC<ExecutionModalsProps> = ({
  isCancelModalOpen, isRetryModalOpen, isNewRunModalOpen,
  onCloseCancel, onConfirmCancel, onCloseRetry, onConfirmRetry, onCloseNewRun, onConfirmNewRun
}) => {
  return (
    <>
      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 p-6 transform transition-all scale-100 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mb-4">
                    <AlertTriangle size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Abort Pipeline Execution?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    Are you sure you want to cancel the current run? All progress will be lost and the system will reset to configuration mode.
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={onCloseCancel}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        No, Resume
                    </button>
                    <button 
                        onClick={onConfirmCancel}
                        className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                    >
                        Yes, Cancel Run
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Retry Confirmation Modal */}
      {isRetryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <RefreshCcw size={24} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Retry Execution?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    This will restart the pipeline with the <strong>same configuration parameters</strong>. A new run ID will be generated.
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={onCloseRetry}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirmRetry}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                    >
                        Confirm Retry
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* New Run Confirmation Modal */}
      {isNewRunModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4">
             <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-slate-700 p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-500 rounded-full flex items-center justify-center mb-4">
                    <RefreshCcw size={24} strokeWidth={2.5} className="rotate-180"/>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start New Run?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    This will discard the current failed state and return you to the <strong>Configuration</strong> screen to change parameters.
                </p>
                <div className="flex gap-3 w-full">
                    <button 
                        onClick={onCloseNewRun}
                        className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirmNewRun}
                        className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
                    >
                        Start New Run
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};