import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { LogEntry, PipelineStep, ExecutionMode, RunConfiguration } from '../types';
import { ExecutionSidebar } from '../components/execution/ExecutionSidebar';
import { ExecutionControl } from '../components/execution/ExecutionControl';
import { ExecutionOutput } from '../components/execution/ExecutionOutput';
import { ExecutionModals } from '../components/execution/ExecutionModals';
import { api } from '../services/api';
import { 
  FULL_CORPORATE_DATA, 
  FULL_RETAIL_EVER_DATA, 
  FULL_RETAIL_DEF_DATA 
} from '../utils/mockExecutionData';

interface ExecutionViewProps {
  steps: PipelineStep[];
  logs: LogEntry[];
  status: 'idle' | 'running' | 'completed' | 'failed';
  mode: ExecutionMode;
  runId: string;
  config: RunConfiguration;
  currentStageIndex: number;
  elapsedTime: number;
  onUpdateSteps: (steps: PipelineStep[]) => void;
  onUpdateLogs: (logs: LogEntry[] | ((prev: LogEntry[]) => LogEntry[])) => void;
  onUpdateStageIndex: (index: number | ((prev: number) => number)) => void;
  onUpdateElapsedTime: (time: number | ((prev: number) => number)) => void;
  onComplete: () => void;
  onCancel: () => void;
  onFail: () => void;
  onRetry: () => void;
}

const TABLE_PAGE_SIZE = 20;

export const ExecutionView: React.FC<ExecutionViewProps> = ({
  steps, logs, status, mode, runId, config, currentStageIndex, elapsedTime, 
  onUpdateSteps, onUpdateLogs, onUpdateStageIndex, onUpdateElapsedTime, onComplete, onCancel, onFail, onRetry
}) => {
  const [progress, setProgress] = useState(0);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFetchingLogs, setIsFetchingLogs] = useState(false);
  const [forceShowLogs, setForceShowLogs] = useState(false);
  
  // Table Pagination State
  const [displayedTableRows, setDisplayedTableRows] = useState<any[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [retailTab, setRetailTab] = useState<'PD_CUST_EVERXV1' | 'PD_CUST_DEFV1'>('PD_CUST_EVERXV1');
  
  // Controls
  const [isManualStageRunning, setIsManualStageRunning] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [isNewRunModalOpen, setIsNewRunModalOpen] = useState(false);

  // Refs for stable callbacks in stream
  const stepsRef = useRef(steps);
  const onUpdateStepsRef = useRef(onUpdateSteps);
  const onUpdateLogsRef = useRef(onUpdateLogs);
  const onUpdateStageIndexRef = useRef(onUpdateStageIndex);
  const onCompleteRef = useRef(onComplete);
  const abortControllerRef = useRef<AbortController | null>(null);
  const logQueueRef = useRef<LogEntry[]>([]);

  const isRetail = config.scope === 'Retail Banking';
  const STAGING_2B_STEP_ID = steps.find(s => s.label === 'Staging 2b')?.id || (isRetail ? 6 : 5);

  useEffect(() => {
    stepsRef.current = steps;
    onUpdateStepsRef.current = onUpdateSteps;
    onUpdateLogsRef.current = onUpdateLogs;
    onUpdateStageIndexRef.current = onUpdateStageIndex;
    onCompleteRef.current = onComplete;
  }, [steps, onUpdateSteps, onUpdateLogs, onUpdateStageIndex, onComplete]);

  // Global Pipeline Timer
  useEffect(() => {
    const isPipelineActive = currentStageIndex < steps.length;
    const isProcessing = status === 'running' && isPipelineActive && (mode === 'automated' || isManualStageRunning) && !isCancelModalOpen;

    if (!isProcessing) return;

    const timer = setInterval(() => onUpdateElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [status, mode, isManualStageRunning, currentStageIndex, steps.length, onUpdateElapsedTime, isCancelModalOpen]);

  // Smooth Log Playback Loop
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const processQueue = () => {
      if (logQueueRef.current.length > 0) {
        const nextLog = logQueueRef.current.shift();
        if (nextLog) {
          onUpdateLogsRef.current(prev => [...prev, nextLog]);
          setProgress(old => {
            const target = 95;
            return old < target ? old + Math.max(0.1, (target - old) * 0.05) : old;
          });
        }
      }
      const delay = logQueueRef.current.length > 20 ? 10 : 35;
      timeoutId = setTimeout(processQueue, delay);
    };
    processQueue();
    return () => clearTimeout(timeoutId);
  }, []);

  const handleSimulateError = () => {
    logQueueRef.current = [];
    onUpdateLogsRef.current(prev => [...prev, { 
      level: 'ERROR', 
      message: 'FATAL ERROR: Pipeline process terminated by user or system exception.', 
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
      stageId: stepsRef.current[currentStageIndex].id 
    }]);
    onUpdateStepsRef.current(stepsRef.current.map((s, idx) => idx === currentStageIndex ? { ...s, status: 'failed' } : s));
    if (abortControllerRef.current) abortControllerRef.current.abort();
    onFail();
  };

  const runStream = async () => {
    const currentSteps = stepsRef.current;
    if (currentStageIndex >= currentSteps.length) {
      setTimeout(() => onCompleteRef.current(), 1000);
      return;
    }

    const currentStage = currentSteps[currentStageIndex];
    try {
      setProgress(0);
      logQueueRef.current = [];
      const logsForDb: any[] = [];

      // 1. Update Database Status -> PROCESSING
      await api.updateStepStatus(runId, currentStage.id, 'processing');
      onUpdateStepsRef.current(currentSteps.map((s, idx) => idx === currentStageIndex ? { ...s, status: 'processing' } : s));

      abortControllerRef.current = new AbortController();
      
      // 2. Trigger Airflow DAG and Stream Output
      const response = await api.triggerDag(currentStage.dag_id || 'default_dag', abortControllerRef.current.signal);
      if (!response.body) throw new Error("ReadableStream not supported");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        if (value) {
          const lines = decoder.decode(value).split("\n").filter(l => l.trim() !== "");
          lines.forEach(line => {
            const level = line.toUpperCase().includes("ERROR") ? "ERROR" : line.toUpperCase().includes("SUCCESS") ? "SUCCESS" : "INFO";
            const entry = { stageId: currentStage.id, timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }), level: level as any, message: line };
            logQueueRef.current.push(entry);
            logsForDb.push({ level: entry.level, message: entry.message });
          });
        }
      }

      while (logQueueRef.current.length > 0) await new Promise(r => setTimeout(r, 100));

      // 3. Save logs and mark COMPLETE in Database
      if (logsForDb.length > 0) await api.saveLogs(runId, currentStage.id, logsForDb);
      await api.updateStepStatus(runId, currentStage.id, 'completed');

      setProgress(100);
      await new Promise(r => setTimeout(r, 500));
      
      onUpdateStepsRef.current(stepsRef.current.map((s, idx) => idx === currentStageIndex ? { ...s, status: 'completed' } : s));
      onUpdateStageIndexRef.current(prev => prev + 1);
      setIsManualStageRunning(false);

    } catch (error: any) {
      if (error.name !== 'AbortError') {
        await api.updateStepStatus(runId, currentStage.id, 'failed');
        handleSimulateError();
      }
    }
  };

  useEffect(() => {
    if (status === 'running' && (mode === 'automated' || isManualStageRunning) && !isCancelModalOpen) {
      runStream();
    }
  }, [currentStageIndex, isManualStageRunning, status]);

  const isPipelineComplete = currentStageIndex >= steps.length;
  const currentStageLabel = !isPipelineComplete ? steps[currentStageIndex].label : "Finished";

  return (
    <div className="w-full h-full grid grid-cols-12 gap-8 pb-2 animate-fade-in relative">
      <ExecutionSidebar 
        steps={steps} logs={logs} currentStageIndex={currentStageIndex} 
        progress={progress} selectedStageId={selectedStageId} mode={mode} onSelectStage={setSelectedStageId} 
      />

      <div className="col-span-12 lg:col-span-9 flex flex-col h-full overflow-hidden">
        <ExecutionControl 
          status={status} mode={mode} runId={runId} elapsedTime={elapsedTime} 
          isPipelineComplete={isPipelineComplete} isManualStageRunning={isManualStageRunning} 
          currentStageLabel={currentStageLabel} onSimulateError={handleSimulateError}
          onCancel={() => setIsCancelModalOpen(true)} onNewRun={() => setIsNewRunModalOpen(true)}
          onRetry={() => setIsRetryModalOpen(true)} onComplete={onComplete}
          onRunManualStage={() => setIsManualStageRunning(true)}
        />

        <ExecutionOutput 
          isStaging2bTableVisible={selectedStageId === STAGING_2B_STEP_ID && !forceShowLogs}
          selectedStageId={selectedStageId} logs={logs} searchQuery={searchQuery}
          isFetchingLogs={isFetchingLogs} isFailed={status === 'failed'}
          shouldProcessCurrentStage={status === 'running'} currentStageIndex={currentStageIndex}
          totalSteps={steps.length} currentStageLabel={currentStageLabel} progress={progress}
          mode={mode} status={status} isManualStageRunning={isManualStageRunning}
          isPipelineComplete={isPipelineComplete} isRetail={isRetail} retailTab={retailTab}
          displayedTableRows={displayedTableRows} activeDataSourceLength={isRetail ? 500 : 250}
          activeColumns={[]} isTableLoading={isTableLoading} setSearchQuery={setSearchQuery}
          setForceShowLogs={setForceShowLogs} handleExportStaging2b={() => {}} 
          setRetailTab={setRetailTab} onCloseView={() => setSelectedStageId(null)} onTableScroll={() => {}}
        />
      </div>

      <ExecutionModals 
        isCancelModalOpen={isCancelModalOpen} isRetryModalOpen={isRetryModalOpen} isNewRunModalOpen={isNewRunModalOpen}
        onCloseCancel={() => setIsCancelModalOpen(false)} onConfirmCancel={() => { setIsCancelModalOpen(false); onCancel(); }}
        onCloseRetry={() => setIsRetryModalOpen(false)}
        onConfirmRetry={async () => { 
          setIsRetryModalOpen(false); 
          await api.retryStep(runId, steps[currentStageIndex].id);
          onRetry(); 
        }}
        onCloseNewRun={() => setIsNewRunModalOpen(false)} onConfirmNewRun={() => { setIsNewRunModalOpen(false); onCancel(); }}
      />
    </div>
  );
};