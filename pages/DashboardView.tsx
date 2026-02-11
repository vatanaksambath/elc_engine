import React from 'react';
import { ViewType } from '../types';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { DashboardKPIGrid } from '../components/dashboard/DashboardKPIGrid';
import { DashboardExposureChart } from '../components/dashboard/DashboardExposureChart';
import { DashboardSystemHealth } from '../components/dashboard/DashboardSystemHealth';

interface DashboardViewProps {
  onNavigate: (view: ViewType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  return (
    <div className="w-full h-full overflow-y-auto animate-fade-in space-y-8 pr-2 custom-scrollbar">
      <DashboardHeader onNavigate={onNavigate} />
      <DashboardKPIGrid />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <DashboardExposureChart />
        <DashboardSystemHealth />
      </div>
      <div className="pb-8"></div>
    </div>
  );
};