import React, { useEffect, useState, useRef } from 'react';
import { LogEntry, PipelineStep, ExecutionMode, RunConfiguration } from '../types';
import { ExecutionSidebar } from '../components/execution/ExecutionSidebar';
import { ExecutionControl } from '../components/execution/ExecutionControl';
import { ExecutionOutput } from '../components/execution/ExecutionOutput';
import { ExecutionModals } from '../components/execution/ExecutionModals';
import { api } from '../services/api';

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

export const ExecutionView: React.FC<ExecutionViewProps> = ({
  steps, logs, status, mode, runId, config, currentStageIndex, elapsedTime, 
  onUpdateSteps, onUpdateLogs, onUpdateStageIndex, onUpdateElapsedTime, onComplete, onCancel, onFail, onRetry
}) => {
  const [progress, setProgress] = useState(0);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [isManualStageRunning, setIsManualStageRunning] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);

  // Refs for stable tracking
  const isCurrentStageRunning = useRef<number | null>(null); 
  const abortControllerRef = useRef<AbortController | null>(null);
  const logQueueRef = useRef<LogEntry[]>([]);

  // Smooth Log Playback
  useEffect(() => {
    const processQueue = () => {
      if (logQueueRef.current.length > 0) {
        const nextLog = logQueueRef.current.shift();
        if (nextLog) {
          onUpdateLogs(prev => [...prev, nextLog]);
          setProgress(old => old < 95 ? old + (95 - old) * 0.05 : old);
        }
      }
      setTimeout(processQueue, logQueueRef.current.length > 10 ? 10 : 40);
    };
    processQueue();
  }, []);

  // Execution Logic
  useEffect(() => {
    const shouldRun = status === 'running' && (mode === 'automated' || isManualStageRunning) && !isCancelModalOpen;
    
    // Guard against double execution
    if (!shouldRun || currentStageIndex >= steps.length || isCurrentStageRunning.current === currentStageIndex) {
      if (currentStageIndex >= steps.length && status === 'running') onComplete();
      return;
    }

    const runStream = async () => {
      const currentStage = steps[currentStageIndex];
      isCurrentStageRunning.current = currentStageIndex;

      try {
        setProgress(0);
        logQueueRef.current = [];
        const logsForDb: any[] = [];

        // 1. DB Status Update
        await api.updateStepStatus(runId, currentStage.id, 'processing');
        onUpdateSteps(steps.map((s, i) => i === currentStageIndex ? { ...s, status: 'processing' } : s));

        // 2. Trigger Airflow
        abortControllerRef.current = new AbortController();
        const response = await api.triggerDag(currentStage.dag_id || 'default_dag', abortControllerRef.current.signal);
        
        if (!response.body) throw new Error("Stream body missing");
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const lines = decoder.decode(value).split("\n").filter(l => l.trim() !== "");
            lines.forEach(line => {
              const entry = { stageId: currentStage.id, timestamp: new Date().toLocaleTimeString(), level: 'INFO' as any, message: line };
              logQueueRef.current.push(entry);
              logsForDb.push({ level: 'INFO', message: line });
            });
          }
        }

        // Wait for UI logs to catch up
        while (logQueueRef.current.length > 0) await new Promise(r => setTimeout(r, 100));

        // 3. Save Logs & Mark Complete
        if (logsForDb.length > 0) await api.saveLogs(runId, currentStage.id, logsForDb);
        await api.updateStepStatus(runId, currentStage.id, 'completed');

        setProgress(100);
        onUpdateSteps(steps.map((s, i) => i === currentStageIndex ? { ...s, status: 'completed' } : s));
        
        setTimeout(() => {
          onUpdateStageIndex(prev => prev + 1);
          setIsManualStageRunning(false);
          isCurrentStageRunning.current = null;
        }, 800);

      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error(error);
          await api.updateStepStatus(runId, currentStage.id, 'failed');
          onUpdateSteps(steps.map((s, i) => i === currentStageIndex ? { ...s, status: 'failed' } : s));
          onFail();
        }
      }
    };

    runStream();

    return () => abortControllerRef.current?.abort();
  }, [status, currentStageIndex, isManualStageRunning, isCancelModalOpen]);

  return (
    <div className="w-full h-full grid grid-cols-12 gap-8 relative">
      <ExecutionSidebar steps={steps} logs={logs} currentStageIndex={currentStageIndex} progress={progress} selectedStageId={selectedStageId} onSelectStage={setSelectedStageId} />
      <div className="col-span-12 lg:col-span-9 flex flex-col h-full overflow-hidden">
        <ExecutionControl status={status} mode={mode} runId={runId} elapsedTime={elapsedTime} isPipelineComplete={currentStageIndex >= steps.length} isManualStageRunning={isManualStageRunning} currentStageLabel={steps[currentStageIndex]?.label || "Complete"} onCancel={() => setIsCancelModalOpen(true)} onRetry={() => setIsRetryModalOpen(true)} onRunManualStage={() => setIsManualStageRunning(true)} onNewRun={onCancel} />
        <ExecutionOutput isStaging2bTableVisible={false} logs={logs} currentStageIndex={currentStageIndex} totalSteps={steps.length} progress={progress} mode={mode} status={status} isManualStageRunning={isManualStageRunning} isPipelineComplete={currentStageIndex >= steps.length} onCloseView={() => setSelectedStageId(null)} />
      </div>
      <ExecutionModals isCancelModalOpen={isCancelModalOpen} isRetryModalOpen={isRetryModalOpen} onCloseCancel={() => setIsCancelModalOpen(false)} onConfirmCancel={() => { setIsCancelModalOpen(false); onCancel(); }} onCloseRetry={() => setIsRetryModalOpen(false)} onConfirmRetry={async () => { setIsRetryModalOpen(false); await api.retryStep(runId, steps[currentStageIndex].id); onRetry(); }} />
    </div>
  );
};