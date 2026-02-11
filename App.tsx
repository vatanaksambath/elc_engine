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
import { FULL_CORPORATE_DATA, FULL_RETAIL_EVER_DATA, FULL_RETAIL_DEF_DATA } from './utils/mockExecutionData';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [maxReachedStep, setMaxReachedStep] = useState<Step>(1);
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Execution State
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([]);
  const [executionLogs, setExecutionLogs] = useState<LogEntry[]>([]);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [executionStageIndex, setExecutionStageIndex] = useState(0);
  const [executionElapsedTime, setExecutionElapsedTime] = useState(0);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('automated');
  const [currentRunId, setCurrentRunId] = useState<string>('');
  
  const [runConfig, setRunConfig] = useState<RunConfiguration>({
    sourceSystem: 'Snowflake_Prod_DW',
    snapshotDate: '2024-03-31',
    methodology: 'base',
    scope: 'Retail Banking'
  });

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const handleStartExecution = async (mode: ExecutionMode, config: RunConfiguration) => {
    try {
      setExecutionLogs([]);
      setExecutionStatus('running');
      setExecutionStageIndex(0); // Reset to start
      setExecutionElapsedTime(0);
      setExecutionMode(mode);
      setRunConfig(config);
      
      // 1. Initialize Run in DB
      const startResponse = await api.startRun(config, mode);
      const realRunId = startResponse.data.run_exe_id;
      setCurrentRunId(realRunId);

      // 2. Fetch Dynamic Steps from DB
      const detailsResponse = await api.getExecutionDetails(realRunId);
      const dbSteps = detailsResponse.data.steps.map((s: any) => ({
        id: s.step_id,
        label: s.step_name,
        status: s.status,
        duration: 0,
        dag_id: s.dag_id
      }));

      setPipelineSteps(dbSteps);
      setCurrentStep(2);
      setMaxReachedStep(2);
    } catch (error: any) {
      alert(`Start Error: ${error.message}`);
      setExecutionStatus('idle');
    }
  };

  const handleExecutionComplete = async () => {
    try {
        // Dynamic Calculation
        const totalRecords = runConfig.scope === 'Retail Banking' 
            ? (FULL_RETAIL_EVER_DATA.length + FULL_RETAIL_DEF_DATA.length) 
            : FULL_CORPORATE_DATA.length;

        await api.completePipeline(
            currentRunId, 
            'SUCCESS', 
            totalRecords, 
            `Successfully processed ${totalRecords.toLocaleString()} records.`
        );
        
        setExecutionStatus('completed');
        setCurrentStep(3);
        setMaxReachedStep(3);
    } catch (error) {
        console.error("Completion Error:", error);
    }
  };

  const handleResetToConfiguration = () => {
    setExecutionStatus('idle');
    setCurrentStep(1);
    setMaxReachedStep(1);
    setCurrentRunId('');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardView onNavigate={setCurrentView} />;
      case 'settings': return <SettingsView />;
      case 'history': return <HistoryView />;
      case 'orchestration':
        switch (currentStep) {
          case 1: return <ConfigurationView onNext={handleStartExecution} status={executionStatus} selectedMode={executionMode} currentConfig={runConfig} />;
          case 2: return (
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
              onFail={() => setExecutionStatus('failed')}
              onRetry={() => setExecutionStatus('running')}
            />
          );
          case 3: return <ResultsView onRestart={handleResetToConfiguration} />;
          default: return null;
        }
      default: return null;
    }
  };

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} isCollapsed={isSidebarCollapsed} toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <Header currentStep={currentStep} maxReachedStep={maxReachedStep} onStepClick={setCurrentStep} currentView={currentView} isSidebarCollapsed={isSidebarCollapsed} isDarkMode={isDarkMode} toggleTheme={() => setIsDarkMode(!isDarkMode)} />
      <main className={`pt-20 h-screen overflow-hidden transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <div className="h-full p-6 flex flex-col">{renderContent()}</div>
      </main>
    </div>
  );
}

export default App;