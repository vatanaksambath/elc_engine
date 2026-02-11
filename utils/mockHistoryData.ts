import { HistoryItem, PipelineStep } from '../types';

const generateHistoryData = (count: number): HistoryItem[] => {
  const users = ['System Scheduler', 'Risk_Admin_01', 'Risk_Admin_02', 'Data_Engineer_03', 'Model_Validator_01'];
  // Removed 'RUNNING' as history should only show completed/failed runs
  const statuses: ('SUCCESS' | 'FAILED')[] = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED', 'SUCCESS', 'SUCCESS', 'FAILED'];
  
  const data: HistoryItem[] = [];
  const now = new Date();

  // Generate records going backwards in time
  for (let i = 0; i < count; i++) {
    // Random time interval between runs (avg 12 hours)
    const timeOffset = i * (1000 * 60 * 60 * 12) + (Math.random() * 1000 * 60 * 60 * 4);
    const date = new Date(now.getTime() - timeOffset);
    
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    
    // Create realistic looking ID
    const id = `RUN-${yyyy}${mm}${dd}-${hh}${min}${ss}`;
    
    // Determine status
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Generate duration
    const durationMin = Math.floor(Math.random() * 50) + 10; // 10 to 60 mins
    const durationSec = Math.floor(Math.random() * 60);
    const duration = `${durationMin}m ${String(durationSec).padStart(2, '0')}s`;
    
    const triggeredBy = users[Math.floor(Math.random() * users.length)];
    
    // Records count (0 if failed early, otherwise large number)
    const records = status === 'FAILED' && Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 1500000) + 50000;

    data.push({
      id,
      date: `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`,
      duration,
      status,
      triggeredBy,
      records
    });
  }
  return data;
};

export const HISTORY_DATA: HistoryItem[] = generateHistoryData(50);

export const CORPORATE_STEPS: Partial<PipelineStep>[] = [
  { id: 1, label: 'Data Collection', duration: 2500 },
  { id: 2, label: 'Data Cleansing', duration: 2000 },
  { id: 3, label: 'Staging 1', duration: 1500 },
  { id: 4, label: 'Staging 2a', duration: 1500 },
  { id: 5, label: 'Staging 2b', duration: 2500 },
  { id: 6, label: 'Staging 3', duration: 1500 },
  { id: 7, label: 'Staging 4', duration: 1500 },
  { id: 8, label: 'Staging 5', duration: 1500 },
  { id: 9, label: 'LGD Modeling', duration: 3500 },
  { id: 10, label: 'EAD Modeling', duration: 3000 },
];

export const RETAIL_STEPS: Partial<PipelineStep>[] = [
  { id: 1, label: 'Data Collection', duration: 2500 },
  { id: 2, label: 'Data Cleansing', duration: 2000 },
  { id: 3, label: 'Staging 1', duration: 1500 },
  { id: 4, label: 'Staging 2a', duration: 1500 },
  { id: 5, label: 'Staging 2a2', duration: 1500 },
  { id: 6, label: 'Staging 2b', duration: 1500 },
  { id: 7, label: 'Staging 2b2', duration: 1500 },
  { id: 8, label: 'Staging 3', duration: 1500 },
  { id: 9, label: 'Staging 4', duration: 1500 },
  { id: 10, label: 'Staging 5', duration: 1500 },
  { id: 11, label: 'LGD Step 1', duration: 2500 },
  { id: 12, label: 'LGD Step 2', duration: 2500 },
];

export const TREND_DATA = [
  { month: 'JAN', exposure: 65, ecl: 22 },
  { month: 'FEB', exposure: 59, ecl: 20 },
  { month: 'MAR', exposure: 80, ecl: 28 },
  { month: 'APR', exposure: 81, ecl: 25 },
  { month: 'MAY', exposure: 56, ecl: 18 },
  { month: 'JUN', exposure: 55, ecl: 15 },
  { month: 'JUL', exposure: 40, ecl: 12 },
  { month: 'AUG', exposure: 70, ecl: 22 },
  { month: 'SEP', exposure: 72, ecl: 24 },
  { month: 'OCT', exposure: 78, ecl: 26 },
  { month: 'NOV', exposure: 85, ecl: 30 },
  { month: 'DEC', exposure: 92, ecl: 35 },
];