import { RunConfiguration } from '../types';

const BASE_URL = 'http://localhost:5000/api/v1';
// IMPORTANT: Replace this with your actual method of getting the token (e.g., localStorage.getItem('token'))
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODk5OCIsInVzZXJfbmFtZSI6IlNhbWJhdGggVmF0YW5hayIsImdlbmRlciI6Ik1hbGUiLCJicmFuY2giOiIxIiwiYXBwX2xpc3QiOiJEVy0wMXxFQy0wMXxGQS0wMXxMQy0wMXxOTC0wMXxUQy0wMSIsInRlYW1fbWVtYmVyIjoiODk5OCwiLCJkZXBhcnRtZW50IjoiNTkiLCJkaXZpc2lvbiI6IjExIiwiaWF0IjoxNzcwODA0NTkzLCJleHAiOjE3NzA4MDgxOTN9.N3oBiClcZ99u2UWSt3uGQWSZbnGxlFYZH88I_YeFHoo'; 

const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${TOKEN}`
};

export const api = {
    startRun: async (config: RunConfiguration, mode: string) => {
        const payload = {
            source_system: config.sourceSystem,
            snapshot_date: config.snapshotDate,
            methodology: config.methodology,
            scope: config.scope.split(', ').filter(Boolean),
            execution_mode: mode
        };
        const res = await fetch(`${BASE_URL}/runs/start`, { method: 'POST', headers, body: JSON.stringify(payload) });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.message || 'Failed to start run');
        }
        return res.json();
    },

    getExecutionDetails: async (runId: string) => {
        const res = await fetch(`${BASE_URL}/runs/${runId}/execution`, { headers });
        if (!res.ok) throw new Error("Failed to fetch execution details");
        return res.json();
    },

    updateStepStatus: async (runId: string, stepId: number, status: string) => {
        const res = await fetch(`${BASE_URL}/runs/${runId}/steps/${stepId}`, { 
            method: 'PUT', headers, body: JSON.stringify({ status }) 
        });
        if (!res.ok) throw new Error("Failed to update step status");
        return res.json();
    },

    triggerDag: async (dagId: string, signal?: AbortSignal) => {
        const res = await fetch(`${BASE_URL}/dags/run/${dagId}`, { method: 'POST', headers, signal });
        if (!res.ok) throw new Error("Failed to trigger DAG");
        return res;
    },

    saveLogs: async (runId: string, stepId: number, logs: any[]) => {
        const res = await fetch(`${BASE_URL}/runs/${runId}/steps/${stepId}/logs`, { 
            method: 'POST', headers, body: JSON.stringify({ logs }) 
        });
        if (!res.ok) throw new Error("Failed to save logs");
        return res.json();
    },

    retryStep: async (runId: string, stepId: number) => {
        const res = await fetch(`${BASE_URL}/runs/${runId}/steps/${stepId}/retry`, { method: 'POST', headers });
        if (!res.ok) throw new Error("Failed to retry step");
        return res.json();
    },

    completePipeline: async (runId: string, status: string, totalRecords: number, summary: string) => {
        const res = await fetch(`${BASE_URL}/runs/${runId}/complete`, { 
            method: 'PUT', headers, body: JSON.stringify({ status, total_records: totalRecords, summary }) 
        });
        if (!res.ok) throw new Error("Failed to complete pipeline");
        return res.json();
    }
};