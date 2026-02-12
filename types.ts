
export type Step = 1 | 2 | 3;
export type ViewType = 'dashboard' | 'orchestration' | 'history' | 'settings';
export type ExecutionMode = 'automated' | 'manual';

export interface PipelineStep {
  id: number;
  label: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  duration: number;
}

export interface LogEntry {
  stageId?: number;
  timestamp: string;
  level: 'INFO' | 'PROCESS' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
}

export interface RunConfiguration {
  sourceSystem: string;
  snapshotDate: string;
  methodology: string;
  scope: string;
}

export interface LoanResult {
  CID2: string;
  CAT2: string;
  ActualReportDate: string;
  CID: string;
  ACCNO: string;
  CATEGORY: string;
  LOANCLASS: string;
  SECTOR: string;
  CREDITLIMIT: number;
  CONTDATE: string;
  MATDATE: string;
  TERMINMONTH: number;
  LONGTERMYN: string;
  INTRATE: number;
  OVRINTTHISMONTH: number;
  PAIDINT: number;
  PAIDPR: number;
  RISKRATE: string;
  BALFWD: number;
  BALANCE: number;
  OVRDUEDAY: number;
  OVRDUETERM: number;
  ODDINT: number;
  TBACCR: number;
  REPAYTYPE: string;
  NBCINDUSTRY: string;
  ACCOUNTOFFICER: string;
  BUSSTYPE: string;
  SUBAC: string;
  SUBACTYPE: string;
  LOANFACILITY: string;
  CURRENCY: string;
  REPAYMETHOD: string;
  INDUSTRYAC: string;
}

export interface HistoryItem {
  id: string;
  date: string;
  duration: string;
  status: 'SUCCESS' | 'FAILED' | 'RUNNING';
  triggeredBy: string;
  records: number;
}