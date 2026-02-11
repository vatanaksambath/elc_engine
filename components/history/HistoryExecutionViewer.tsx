import React, { useState } from 'react';
import { ExecutionSidebar } from '../execution/ExecutionSidebar';
import { ExecutionOutput } from '../execution/ExecutionOutput';
import { PipelineStep, LogEntry, RunConfiguration } from '../../types';
import { FULL_CORPORATE_DATA, FULL_RETAIL_EVER_DATA, FULL_RETAIL_DEF_DATA } from '../../utils/mockExecutionData';

interface HistoryExecutionViewerProps {
  steps: PipelineStep[];
  logs: LogEntry[];
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  config: RunConfiguration;
}

export const HistoryExecutionViewer: React.FC<HistoryExecutionViewerProps> = ({ steps, logs, status, config }) => {
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [retailTab, setRetailTab] = useState<'PD_CUST_EVERXV1' | 'PD_CUST_DEFV1'>('PD_CUST_EVERXV1');
  const [forceShowLogs, setForceShowLogs] = useState(false);
  
  // Table Data logic
  const isRetail = config.scope === 'Retail Banking';
  const STAGING_2B_STEP_ID = isRetail ? 6 : 5;
  const isStaging2bTableVisible = selectedStageId === STAGING_2B_STEP_ID && steps.find(s => s.id === STAGING_2B_STEP_ID)?.status === 'completed' && !forceShowLogs;

  const getActiveDataSource = () => {
    if (isRetail) {
        return retailTab === 'PD_CUST_EVERXV1' ? FULL_RETAIL_EVER_DATA : FULL_RETAIL_DEF_DATA;
    }
    return FULL_CORPORATE_DATA;
  };

  const getActiveColumns = () => {
     // ... Reuse column logic or pass it down? For simplicity, duplicating column config here as it is static for history view.
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

  // Mock export handler
  const handleExportStaging2b = () => { alert('Export feature triggered'); };

  return (
    <div className="w-full h-full grid grid-cols-12 gap-6 animate-fade-in min-h-0">
        <ExecutionSidebar 
            steps={steps}
            logs={logs}
            currentStageIndex={steps.length} // Completed
            progress={0}
            selectedStageId={selectedStageId}
            mode="automated"
            onSelectStage={setSelectedStageId}
            isStaging2bTableVisible={isStaging2bTableVisible}
        />
        
        <div className="col-span-12 lg:col-span-9 flex flex-col h-full overflow-hidden">
             <ExecutionOutput 
                isStaging2bTableVisible={isStaging2bTableVisible}
                selectedStageId={selectedStageId}
                logs={logs}
                searchQuery={searchQuery}
                isFetchingLogs={false}
                isFailed={status === 'FAILED'}
                shouldProcessCurrentStage={false}
                currentStageIndex={steps.length}
                totalSteps={steps.length}
                currentStageLabel="Completed"
                progress={0}
                mode="automated"
                status={status === 'SUCCESS' ? 'completed' : 'failed'}
                isManualStageRunning={false}
                isPipelineComplete={true}
                isRetail={isRetail}
                retailTab={retailTab}
                displayedTableRows={getActiveDataSource().slice(0, 50)} // Simple slice for history
                activeDataSourceLength={getActiveDataSource().length}
                activeColumns={getActiveColumns() as any}
                isTableLoading={false}
                setSearchQuery={setSearchQuery}
                setForceShowLogs={setForceShowLogs}
                handleExportStaging2b={handleExportStaging2b}
                setRetailTab={setRetailTab}
                onCloseView={() => setSelectedStageId(null)}
                onTableScroll={() => {}}
             />
        </div>
    </div>
  );
};