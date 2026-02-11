import React, { useState } from 'react';
import { Database, Mail, MessageSquare, Terminal, Bell } from 'lucide-react';
import { SettingsHeader } from '../components/settings/SettingsHeader';
import { SettingsSection } from '../components/settings/SettingsSection';
import { SettingsToggle } from '../components/settings/SettingsToggle';
import { SettingsSelect } from '../components/settings/SettingsSelect';

export const SettingsView: React.FC = () => {
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [slackNotifs, setSlackNotifs] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  return (
    <div className="w-full h-full overflow-y-auto animate-fade-in custom-scrollbar pr-2 pb-10">
      <SettingsHeader />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Model Parameters */}
        <SettingsSection title="Risk Model Parameters" icon={Database} className="h-full">
            <div className="grid grid-cols-1 gap-6">
                <SettingsSelect 
                    label="PD Calibration Method" 
                    value="Through-the-Cycle (TTC)" 
                    options={['Through-the-Cycle (TTC)', 'Point-in-Time (PIT)', 'Hybrid Approach']} 
                />
                <SettingsSelect 
                    label="LGD Downturn Logic" 
                    value="Regulatory Formula (Basel III)" 
                    options={['Regulatory Formula (Basel III)', 'Internal Historical Avg', 'Stress Test Scenario A']} 
                />
            </div>
            
            <div className="pt-4 border-t border-gray-100 dark:border-slate-700/50 mt-4">
                <SettingsToggle 
                    checked={debugMode} 
                    onChange={setDebugMode} 
                    label="Enable Verbose Logging" 
                    description="Logs detailed intermediate calculation steps to the console. Not recommended for production runs due to performance impact."
                    icon={Terminal}
                />
            </div>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection title="Alerts & Notifications" icon={Bell} className="h-full">
            <div className="grid grid-cols-1 gap-4">
                <SettingsToggle 
                    checked={emailNotifs} 
                    onChange={setEmailNotifs} 
                    label="Email Summaries" 
                    description="Send execution reports to configured distribution list."
                    icon={Mail}
                />
                <SettingsToggle 
                    checked={slackNotifs} 
                    onChange={setSlackNotifs} 
                    label="Slack Integration" 
                    description="Post real-time status updates to #risk-ops channel."
                    icon={MessageSquare}
                />
            </div>
        </SettingsSection>

      </div>
    </div>
  );
};