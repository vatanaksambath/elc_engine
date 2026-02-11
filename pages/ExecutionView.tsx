import React, { useEffect, useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { LogEntry, PipelineStep, ExecutionMode, RunConfiguration } from '../types';
import { ExecutionSidebar } from '../components/execution/ExecutionSidebar';
import { ExecutionControl } from '../components/execution/ExecutionControl';
import { ExecutionOutput } from '../components/execution/ExecutionOutput';
import { ExecutionModals } from '../components/execution/ExecutionModals';
import { 
  getStageLogs, 
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
  
  // Table Lazy Loading State
  const [displayedTableRows, setDisplayedTableRows] = useState<any[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [retailTab, setRetailTab] = useState<'PD_CUST_EVERXV1' | 'PD_CUST_DEFV1'>('PD_CUST_EVERXV1');
  
  // For manual mode
  const [isManualStageRunning, setIsManualStageRunning] = useState(false);
  
  // Modals
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState(false);
  const [isNewRunModalOpen, setIsNewRunModalOpen] = useState(false);

  // Refs
  const stepsRef = useRef(steps);
  const onUpdateStepsRef = useRef(onUpdateSteps);
  const onUpdateLogsRef = useRef(onUpdateLogs);
  const onUpdateStageIndexRef = useRef(onUpdateStageIndex);
  const onCompleteRef = useRef(onComplete);
  const configRef = useRef(config);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Log Queue for smooth playback
  const logQueueRef = useRef<LogEntry[]>([]);

  const isRetail = config.scope === 'Retail Banking';
  // Staging 2b is Step ID 5 in Corporate, Step ID 6 in Retail
  const STAGING_2B_STEP_ID = isRetail ? 6 : 5;

  useEffect(() => {
    stepsRef.current = steps;
    onUpdateStepsRef.current = onUpdateSteps;
    onUpdateLogsRef.current = onUpdateLogs;
    onUpdateStageIndexRef.current = onUpdateStageIndex;
    onCompleteRef.current = onComplete;
    configRef.current = config;
  }, [steps, onUpdateSteps, onUpdateLogs, onUpdateStageIndex, onComplete, config]);

  // Simulated fetching delay when selecting a stage
  useEffect(() => {
    if (selectedStageId !== null) {
        setIsFetchingLogs(true);
        const timer = setTimeout(() => setIsFetchingLogs(false), 500);
        return () => clearTimeout(timer);
    } else {
        setIsFetchingLogs(false);
    }
  }, [selectedStageId]);

  // Reset forceShowLogs when changing stages
  useEffect(() => {
    setForceShowLogs(false);
  }, [selectedStageId]);

  // Global Timer
  useEffect(() => {
    const isPipelineActive = currentStageIndex < steps.length;
    // Timer runs if status is running AND modal is closed
    const isProcessing = status === 'running' && isPipelineActive && (mode === 'automated' || isManualStageRunning) && !isCancelModalOpen;

    if (!isProcessing) return;

    const timer = setInterval(() => onUpdateElapsedTime(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [status, mode, isManualStageRunning, currentStageIndex, steps.length, onUpdateElapsedTime, isCancelModalOpen]);

  // LOG PROCESSING LOOP
  // This effect consumes the queue one by one to create a smooth animation
  useEffect(() => {
      let timeoutId: ReturnType<typeof setTimeout>;

      const processQueue = () => {
          if (logQueueRef.current.length > 0) {
              const nextLog = logQueueRef.current.shift();
              if (nextLog) {
                  onUpdateLogsRef.current(prev => [...prev, nextLog]);
                  
                  // Progress is now tied to visual display, ensuring perfect alignment
                  setProgress(old => {
                    const target = 95;
                    const remaining = target - old;
                    if (remaining <= 0) return old;
                    // Move a small fraction of the remaining distance per log line
                    return old + Math.max(0.1, remaining * 0.05);
                });
              }
          }

          // Dynamic speed adjustment based on backlog
          // If queue is huge, speed up. If small, slow down for "hacker terminal" feel.
          const queueLength = logQueueRef.current.length;
          let delay = 30; // Default smooth typing speed
          
          if (queueLength > 50) delay = 5;       // Panic catchup
          else if (queueLength > 20) delay = 15; // Fast catchup
          else if (queueLength > 5) delay = 25;  // Normal
          else delay = 40;                       // Slow / readable

          timeoutId = setTimeout(processQueue, delay);
      };

      processQueue();

      return () => clearTimeout(timeoutId);
  }, []);

  // Handle Manual Trigger
  const handleRunManualStage = () => {
    setIsManualStageRunning(true);
  };

  // Simulate Error Logic (For Demo)
  const handleSimulateError = () => {
     // Clear queue first
     logQueueRef.current = [];
     
     // 1. Add Error Log
     onUpdateLogsRef.current(prev => [...prev, { 
        level: 'ERROR', 
        message: 'FATAL ERROR: Memory allocation failed during vectorization. Process terminated.', 
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        stageId: stepsRef.current[currentStageIndex].id 
     }]);

     // 2. Mark current step as failed
     onUpdateStepsRef.current(stepsRef.current.map((step, idx) => 
        idx === currentStageIndex ? { ...step, status: 'failed' } : step
     ));

     if (abortControllerRef.current) {
        abortControllerRef.current.abort();
     }

     // 3. Trigger Global Fail State
     onFail();
  };

  // Determine current dataset and columns based on config and active tab
  const getActiveDataSource = () => {
    if (isRetail) {
        return retailTab === 'PD_CUST_EVERXV1' ? FULL_RETAIL_EVER_DATA : FULL_RETAIL_DEF_DATA;
    }
    return FULL_CORPORATE_DATA;
  };

  const getActiveColumns = () => {
      if (!isRetail) {
          return [
            { key: 'id', label: 'ID' },
            { key: 'entity', label: 'Entity Name' },
            { key: 'sector', label: 'Sector' },
            { key: 'rating', label: 'Rating' },
            { key: 'staging', label: 'Staging' },
            { key: 'pd_shift', label: 'PD Shift', align: 'right' },
            { key: 'exposure', label: 'Exposure', align: 'right' }
          ];
      }
      if (retailTab === 'PD_CUST_EVERXV1') {
          return [
            { key: 'cust_id', label: 'Customer ID' },
            { key: 'account_no', label: 'Account No' },
            { key: 'rating', label: 'Internal Rating' },
            { key: 'pd_12m', label: '12m PD', align: 'right' },
            { key: 'pd_lifetime', label: 'Lifetime PD', align: 'right' },
            { key: 'stage', label: 'Stage' },
            { key: 'segment', label: 'Segment' }
          ];
      } else {
          return [
            { key: 'cust_id', label: 'Customer ID' },
            { key: 'account_no', label: 'Account No' },
            { key: 'default_date', label: 'Default Date' },
            { key: 'outstanding_amt', label: 'Outstanding Amt', align: 'right' },
            { key: 'recovery_amt', label: 'Recovery Amt', align: 'right' },
            { key: 'lgd', label: 'LGD', align: 'right' },
            { key: 'write_off', label: 'Write-off Status' }
          ];
      }
  };

  // Export Logic for Staging 2b
  const handleExportStaging2b = (format: 'csv' | 'xlsx') => {
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const prefix = isRetail ? `retail_staging_2b_${retailTab}` : 'corporate_staging_2b';
      const filename = `${prefix}_${timestamp}`;
      const data = getActiveDataSource();
      const columns = getActiveColumns();

      if (format === 'xlsx') {
          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, "Staging 2b");
          XLSX.writeFile(workbook, `${filename}.xlsx`);
      } else {
          // CSV
          const headerLabels = columns.map(c => c.label);
          const keys = columns.map(c => c.key);
          
          const csvRows = [
              headerLabels.join(','),
              ...data.map(row => keys.map(key => {
                  let val = row[key as keyof typeof row];
                  if (typeof val === 'string') {
                      val = val.replace(/"/g, '""');
                      if (val.includes(',') || val.includes('"')) {
                          val = `"${val}"`;
                      }
                  }
                  return val;
              }).join(','))
          ];
          
          const csvContent = csvRows.join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const link = document.createElement("a");
          if (link.download !== undefined) {
              const url = URL.createObjectURL(blob);
              link.setAttribute("href", url);
              link.setAttribute("download", `${filename}.csv`);
              link.style.visibility = 'hidden';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
          }
      }
  };

  // Logic: Process Stage
  const shouldProcessCurrentStage = status === 'running' && (mode === 'automated' || isManualStageRunning) && !isCancelModalOpen;

  useEffect(() => {
    if (!shouldProcessCurrentStage) return;

    const currentSteps = stepsRef.current;
    
    // Check complete
    if (currentStageIndex >= currentSteps.length) {
      if (mode === 'automated') {
          const timeout = setTimeout(() => {
            onCompleteRef.current();
          }, 1500);
          return () => clearTimeout(timeout);
      } else {
          setIsManualStageRunning(false);
          return;
      }
    }

    const currentStage = currentSteps[currentStageIndex];
    // Start Step
    onUpdateStepsRef.current(currentSteps.map((step, idx) => 
      idx === currentStageIndex ? { ...step, status: 'processing' } : step
    ));

    // Abort controller for this stage's fetch
    abortControllerRef.current = new AbortController();

    // Streaming Logic
    const runStream = async () => {
        try {
            // Reset progress at start of stage
            setProgress(0);
            // Ensure queue is clean
            logQueueRef.current = [];
            
            // Connection Pulse: slowly increment to 15% to show activity during connection (before logs arrive)
            const connectionInterval = setInterval(() => {
                setProgress(old => old < 15 ? old + 1 : old);
            }, 200);

            // For testing: Use the same DAG ID for all stages as requested
            const dagId = "random_stage_and_message_dag"; 
            const response = await fetch(`http://localhost:5000/run-dag/${dagId}`, {
                signal: abortControllerRef.current?.signal,
            });

            // Stop the "connecting" animation once response is received
            clearInterval(connectionInterval);

            if (!response.body) {
                throw new Error("ReadableStream not supported");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let done = false;

            while (!done) {
                const { value, done: streamDone } = await reader.read();
                done = streamDone;
                
                if (value) {
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split("\n").filter((line) => line.trim() !== "");
                    
                    const newLogEntries: LogEntry[] = lines.map(line => {
                         // Parse line for metadata
                         const upperLine = line.toUpperCase();
                         let level: LogEntry['level'] = 'INFO';
                         
                         if (upperLine.includes("ERROR") || upperLine.includes("FAIL") || upperLine.includes("CRITICAL") || upperLine.includes("EXCEPTION")) {
                             level = 'ERROR';
                         } else if (upperLine.includes("WARN") || upperLine.includes("WARNING")) {
                             level = 'WARN';
                         } else if (upperLine.includes("SUCCESS") || upperLine.includes("COMPLETED")) {
                             level = 'SUCCESS';
                         } else if (upperLine.includes("PROCESS") || upperLine.includes("STARTING") || upperLine.includes("EXECUTING") || upperLine.includes("INIT")) {
                             level = 'PROCESS';
                         }

                         // Extract timestamp if exists [YYYY-MM-DD...]
                         const match = line.match(/^\[(.*?)\]\s+(.*)$/);
                         let message = line;
                         // Default timestamp if not in log
                         let timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

                         if (match) {
                             // Use match[1] if it looks like a time/date, otherwise keep current time
                             // match[2] is the clean message
                             message = match[2];
                         }

                         return {
                             stageId: currentStage.id,
                             timestamp,
                             level,
                             message
                         };
                    });

                    // PUSH TO QUEUE (Do not update state directly)
                    logQueueRef.current.push(...newLogEntries);
                }
            }

            // VISUAL SYNC: Wait for the log queue to drain before marking as complete
            // This ensures the user sees all logs before the green checkmark appears
            while (logQueueRef.current.length > 0) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Stream Complete
            setProgress(100);

            // Small delay to show completion before moving on
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Mark Stage Complete
            onUpdateStepsRef.current(stepsRef.current.map((step, idx) => 
                idx === currentStageIndex ? { ...step, status: 'completed' } : step
            ));
            
            setProgress(0); 
            onUpdateStageIndexRef.current(prev => prev + 1);
            
            if (mode === 'manual') {
                setIsManualStageRunning(false);
            }

        } catch (error: any) {
            if (error.name === 'AbortError') {
                logQueueRef.current = []; // Clear buffer on abort
            } else {
                console.error("Pipeline Stream Error:", error);
                // Handle Error -> maybe add error log
                onUpdateLogsRef.current(prev => [...prev, {
                    stageId: currentStage.id,
                    timestamp: new Date().toLocaleTimeString(),
                    level: 'ERROR',
                    message: `Stream connection failed: ${error.message}`
                }]);
                // Fail logic could go here if we want strict failure
                handleSimulateError();
            }
        }
    };

    runStream();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [shouldProcessCurrentStage, currentStageIndex, mode]); 

  // --- Lazy Loading Logic for Table ---
  const isStaging2bTableVisible = selectedStageId === STAGING_2B_STEP_ID && steps.find(s => s.id === STAGING_2B_STEP_ID)?.status === 'completed' && !forceShowLogs;

  // Reset displayed rows when visibility or tab changes
  useEffect(() => {
      if (isStaging2bTableVisible) {
          setDisplayedTableRows([]);
          // Initial load
          const source = getActiveDataSource();
          const initialBatch = source.slice(0, TABLE_PAGE_SIZE);
          setDisplayedTableRows(initialBatch);
      }
  }, [isStaging2bTableVisible, retailTab]);

  const loadMoreTableData = () => {
      const source = getActiveDataSource();
      if (isTableLoading || displayedTableRows.length >= source.length) return;
      setIsTableLoading(true);
      setTimeout(() => {
          const currentLen = displayedTableRows.length;
          const nextBatch = source.slice(currentLen, currentLen + TABLE_PAGE_SIZE);
          setDisplayedTableRows(prev => [...prev, ...nextBatch]);
          setIsTableLoading(false);
      }, 600);
  };

  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
      const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
      if (scrollHeight - scrollTop <= clientHeight + 50) {
          loadMoreTableData();
      }
  };

  const isPipelineComplete = currentStageIndex >= steps.length;
  const currentStageLabel = !isPipelineComplete ? steps[currentStageIndex].label : "Finished";

  return (
    <div className="w-full h-full grid grid-cols-12 gap-8 pb-2 animate-fade-in relative">
      <ExecutionSidebar 
        steps={steps}
        logs={logs}
        currentStageIndex={currentStageIndex}
        progress={progress}
        selectedStageId={selectedStageId}
        mode={mode}
        onSelectStage={setSelectedStageId}
        isStaging2bTableVisible={isStaging2bTableVisible}
      />

      {/* RIGHT COLUMN: Execution Dashboard */}
      <div className="col-span-12 lg:col-span-9 flex flex-col h-full overflow-hidden">
        
        <ExecutionControl 
          status={status}
          mode={mode}
          runId={runId}
          elapsedTime={elapsedTime}
          isPipelineComplete={isPipelineComplete}
          isManualStageRunning={isManualStageRunning}
          currentStageLabel={currentStageLabel}
          onSimulateError={handleSimulateError}
          onCancel={() => setIsCancelModalOpen(true)}
          onNewRun={() => setIsNewRunModalOpen(true)}
          onRetry={() => setIsRetryModalOpen(true)}
          onComplete={onComplete}
          onRunManualStage={handleRunManualStage}
        />

        {/* Terminal Window OR Data Table */}
        <ExecutionOutput 
          isStaging2bTableVisible={isStaging2bTableVisible}
          selectedStageId={selectedStageId}
          logs={logs}
          searchQuery={searchQuery}
          isFetchingLogs={isFetchingLogs}
          isFailed={status === 'failed'}
          shouldProcessCurrentStage={shouldProcessCurrentStage}
          currentStageIndex={currentStageIndex}
          totalSteps={steps.length}
          currentStageLabel={currentStageLabel}
          progress={progress}
          mode={mode}
          status={status}
          isManualStageRunning={isManualStageRunning}
          isPipelineComplete={isPipelineComplete}
          isRetail={isRetail}
          retailTab={retailTab}
          displayedTableRows={displayedTableRows}
          activeDataSourceLength={getActiveDataSource().length}
          activeColumns={getActiveColumns()}
          isTableLoading={isTableLoading}
          setSearchQuery={setSearchQuery}
          setForceShowLogs={setForceShowLogs}
          handleExportStaging2b={handleExportStaging2b}
          setRetailTab={setRetailTab}
          onCloseView={() => setSelectedStageId(null)}
          onTableScroll={handleTableScroll}
        />
      </div>

      <ExecutionModals 
        isCancelModalOpen={isCancelModalOpen}
        isRetryModalOpen={isRetryModalOpen}
        isNewRunModalOpen={isNewRunModalOpen}
        onCloseCancel={() => setIsCancelModalOpen(false)}
        onConfirmCancel={() => { setIsCancelModalOpen(false); onCancel(); }}
        onCloseRetry={() => setIsRetryModalOpen(false)}
        onConfirmRetry={() => { setIsRetryModalOpen(false); onRetry(); }}
        onCloseNewRun={() => setIsNewRunModalOpen(false)}
        onConfirmNewRun={() => { setIsNewRunModalOpen(false); onCancel(); }}
      />
    </div>
  );
};