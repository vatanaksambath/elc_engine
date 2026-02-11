import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ConfigurationView } from './pages/ConfigurationView';
import { ExecutionView } from './pages/ExecutionView';
import { ResultsView } from './pages/ResultsView';
import { HistoryView } from './pages/HistoryView';
import { DashboardView } from './pages/DashboardView';
import { SettingsView } from './pages/SettingsView';
import { Step, ViewType, PipelineStep, LogEntry, ExecutionMode, RunConfiguration } from './types';
import { api } from './services/api';

// Define Standard Steps (Corporate/SME/Default) - UPDATED STRUCTURE
const STANDARD_STEPS: PipelineStep[] = [
  { id: 1, label: 'Data Collection', status: 'pending', duration: 2500 },
  { id: 2, label: 'Data Cleansing', status: 'pending', duration: 2000 },
  { id: 3, label: 'Staging 1', status: 'pending', duration: 1500 },
  { id: 4, label: 'Staging 2a', status: 'pending', duration: 1500 },
  { id: 5, label: 'Staging 2b', status: 'pending', duration: 2500 }, // Special Stage with Table
  { id: 6, label: 'Staging 3', status: 'pending', duration: 1500 },
  { id: 7, label: 'Staging 4', status: 'pending', duration: 1500 },
  { id: 8, label: 'Staging 5', status: 'pending', duration: 1500 },
  { id: 9, label: 'LGD Modeling', status: 'pending', duration: 3500 },
  { id: 10, label: 'EAD Modeling', status: 'pending', duration: 3000 },
];

// Define Retail Specific Steps
const RETAIL_STEPS: PipelineStep[] = [
  { id: 1, label: 'Data Collection', status: 'pending', duration: 2500 },
  { id: 2, label: 'Data Cleansing', status: 'pending', duration: 2000 },
  { id: 3, label: 'Staging 1', status: 'pending', duration: 1500 },
  { id: 4, label: 'Staging 2a', status: 'pending', duration: 1500 },
  { id: 5, label: 'Staging 2a2', status: 'pending', duration: 1500 },
  { id: 6, label: 'Staging 2b', status: 'pending', duration: 1500 },
  { id: 7, label: 'Staging 2b2', status: 'pending', duration: 1500 },
  { id: 8, label: 'Staging 3', status: 'pending', duration: 1500 },
  { id: 9, label: 'Staging 4', status: 'pending', duration: 1500 },
  { id: 10, label: 'Staging 5', status: 'pending', duration: 1500 },
  { id: 11, label: 'LGD Step 1', status: 'pending', duration: 2500 },
  { id: 12, label: 'LGD Step 2', status: 'pending', duration: 2500 },
];

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<Step>(1);
  
  // UI Controls
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- LIFTED EXECUTION STATE ---
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(STANDARD_STEPS);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [executionStageIndex, setExecutionStageIndex] = useState(0);
  const [executionElapsedTime, setExecutionElapsedTime] = useState(0);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('automated');
  const [currentRunId, setCurrentRunId] = useState<string>('');
  
  // Default config
  const [runConfig, setRunConfig] = useState<RunConfiguration>({
    sourceSystem: 'Snowflake_Prod_DW',
    snapshotDate: '2024-03-31',
    methodology: 'base',
    scope: 'Retail Banking'
  });

  // Effect to toggle dark class on html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const generateRunId = () => {
    const now = new Date();
    const YYYY = now.getFullYear();
    const MM = String(now.getMonth() + 1).padStart(2, '0');
    const DD = String(now.getDate()).padStart(2, '0');
    const HH = String(now.getHours()).padStart(2, '0');
    const Min = String(now.getMinutes()).padStart(2, '0');
    const SS = String(now.getSeconds()).padStart(2, '0');
    return `RUN-${YYYY}${MM}${DD}-${HH}${Min}${SS}`;
  };

  // const handleStartExecution = (mode: ExecutionMode, config: RunConfiguration) => {
  //   // Reset state for new run
  //   setExecutionLogs([]);
  //   setExecutionStatus('running');
  //   setExecutionStageIndex(0);
  //   setExecutionElapsedTime(0);
  //   setExecutionMode(mode);
  //   setRunConfig(config);
  //   setCurrentRunId(generateRunId()); // Generate unique ID
    
  //   // Select Steps based on Scope
  //   // If "Retail Banking" is the ONLY selected scope, use Retail Steps.
  //   // If Corporate or SME are included (or mixed), default to Standard Steps.
  //   const isRetailOnly = config.scope === 'Retail Banking';
  //   const selectedSteps = isRetailOnly ? RETAIL_STEPS : STANDARD_STEPS;

  //   setPipelineSteps(selectedSteps.map(s => ({...s, status: 'pending'})));

  //   // Navigate
  //   setCurrentStep(2);
  //   setMaxReachedStep(2);
  // };

const handleStartExecution = async (mode: ExecutionMode, config: RunConfiguration) => {
  try {
    setExecutionLogs([]);
    setExecutionStatus('running');
    
    // 1. Start the run in the backend
    const startResponse = await api.startRun(config, mode);
    const realRunId = startResponse.data.run_exe_id;
    setCurrentRunId(realRunId);

    // 2. FETCH THE REAL STAGES FROM THE DATABASE
    const detailsResponse = await api.getExecutionDetails(realRunId);
    const dbSteps = detailsResponse.data.steps.map((s: any) => ({
      id: s.step_id,
      label: s.step_name,
      status: s.status, // Should be 'pending'
      duration: 0,
      dag_id: s.dag_id
    }));

    // 3. Set the real steps to state instead of mock templates
    setPipelineSteps(dbSteps); 

    setCurrentStep(2);
    setMaxReachedStep(2);
  } catch (error) {
    console.error("Failed to start:", error);
    setExecutionStatus('idle');
  }
};

  const handleExecutionComplete = async () => {
    try {
        await api.completePipeline(
            currentRunId, 
            'SUCCESS', 
            1238354, // Replace with dynamic calculation if available
            'The pipeline executed successfully.'
        );
        setExecutionStatus('completed');
        setCurrentStep(3);
        setMaxReachedStep(3);
    } catch (error) {
        console.error("Failed to complete pipeline in DB", error);
    }
  };

  const handleExecutionFailed = () => {
    setExecutionStatus('failed');
    // Note: Step 2 remains active view
  };

  const handleRetryExecution = () => {
    // Resume execution from the current (failed) stage
    setExecutionStatus('running');
    
    // 1. Clean up logs ONLY for the failed stage to provide a clean slate for the retry
    // We keep the logs for the previously completed stages for context.
    const currentStageId = pipelineSteps[executionStageIndex]?.id;
    if (currentStageId) {
        setExecutionLogs(prev => prev.filter(log => log.stageId !== currentStageId));
    }

    // 2. Reset step statuses:
    // - Steps BEFORE the failure point remain 'completed'
    // - The failed step is reset to 'pending' (so ExecutionView picks it up)
    // - Any subsequent steps are ensured to be 'pending'
    setPipelineSteps(prevSteps => prevSteps.map((step, idx) => {
        if (idx < executionStageIndex) {
            return step; // Keep completed
        }
        return { ...step, status: 'pending' }; // Reset current & future
    }));
    
    // Note: We do NOT reset executionStageIndex or currentRunId. 
    // We do NOT reset elapsedTime (optional choice, keeps running total).
    
    // Ensure we are viewing the Execution View
    setCurrentStep(2);
  };

  const handleResetToConfiguration = () => {
    setPipelineSteps(STANDARD_STEPS.map(s => ({...s, status: 'pending'})));
    setExecutionLogs([]);
    setExecutionStatus('idle');
    setExecutionStageIndex(0);
    setExecutionElapsedTime(0);
    setCurrentRunId('');
    
    setCurrentStep(1);
    setMaxReachedStep(1);
  };

  const handleStepClick = (stepId: Step) => {
    if (stepId <= maxReachedStep) {
      setCurrentStep(stepId);
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={(view) => {
            setCurrentView(view);
            if(view === 'orchestration') setCurrentStep(1); 
        }} />;
      case 'settings':
        return <SettingsView />;
      case 'history':
        return <HistoryView />;
      case 'orchestration':
        switch (currentStep) {
          case 1:
            return (
              <ConfigurationView 
                onNext={handleStartExecution} 
                status={executionStatus === 'failed' ? 'idle' : executionStatus} // Unlock if failed and returned
                selectedMode={executionMode}
                currentConfig={runConfig}
              />
            );
          case 2:
            return (
              <ExecutionView 
                steps={pipelineSteps}
                logs={executionLogs}
                status={executionStatus}
                mode={executionMode}
                runId={currentRunId}
                config={runConfig}
                currentStageIndex={executionStageIndex}
                elapsedTime={executionElapsedTime}
                onUpdateSteps={setPipelineSteps}
                onUpdateLogs={setExecutionLogs}
                onUpdateStageIndex={setExecutionStageIndex}
                onUpdateElapsedTime={setExecutionElapsedTime}
                onComplete={handleExecutionComplete}
                onCancel={handleResetToConfiguration}
                onFail={handleExecutionFailed}
                onRetry={handleRetryExecution}
              />
            );
          case 3:
            return <ResultsView onRestart={handleResetToConfiguration} />;
          default:
            return (
              <ConfigurationView 
                onNext={handleStartExecution} 
                status={executionStatus} 
                selectedMode={executionMode}
                currentConfig={runConfig}
              />
            );
        }
      default:
        return <DashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className={`h-screen font-sans overflow-hidden flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      <Header 
        currentStep={currentStep} 
        maxReachedStep={maxReachedStep}
        onStepClick={handleStepClick}
        currentView={currentView}
        isSidebarCollapsed={isSidebarCollapsed}
        isDarkMode={isDarkMode}
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <main 
        className={`pt-20 h-screen overflow-hidden transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <div className="h-full p-6 overflow-hidden flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;