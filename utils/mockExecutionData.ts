import { RunConfiguration } from '../types';

// --- DATA GENERATORS ---

// 1. Corporate/SME Staging 2b Data
export const generateCorporateStagingData = () => {
    const sectors = ['Technology', 'Transport', 'Industrial', 'Energy', 'Retail', 'Marine', 'Finance', 'Construction'];
    const ratings = ['AAA', 'AA', 'A+', 'A', 'A-', 'BBB+', 'BBB', 'BBB-', 'BB+', 'BB', 'B', 'CCC'];
    const entities = ['TechCorp', 'Global Logistics', 'Alpha Mfg', 'Green Energy', 'Summit Retail', 'Blue Ocean', 'Apex Fin', 'Urban Construct', 'Delta Systems', 'Omega Shipping'];
    
    return Array.from({ length: 500 }, (_, i) => {
        const sector = sectors[i % sectors.length];
        const rating = ratings[i % ratings.length];
        const entityBase = entities[i % entities.length];
        const isPositive = i % 3 !== 0; 
        
        return {
            id: `REC-${String(i + 1).padStart(3, '0')}`,
            entity: `${entityBase} ${String.fromCharCode(65 + (i % 26))}`, 
            sector: sector,
            rating: rating,
            staging: rating.startsWith('C') || rating.startsWith('B-') ? 'Stage 3' : rating.startsWith('BB') ? 'Stage 2' : 'Stage 1',
            pd_shift: `${isPositive ? '+' : '-'}${(Math.random() * 3).toFixed(2)}%`,
            exposure: '$' + (Math.floor(Math.random() * 20000000) + 500000).toLocaleString()
        };
    });
};

// 2. Retail Staging 2b - PD_CUST_EVERXV1 (Current/Historical PDs)
export const generateRetailEverData = () => {
    return Array.from({ length: 800 }, (_, i) => ({
        cust_id: `CUST-${String(i + 1).padStart(6, '0')}`,
        account_no: `ACC-${String(900000 + i)}`,
        rating: `R${Math.floor(Math.random() * 10) + 1}`,
        pd_12m: (Math.random() * 0.05).toFixed(4),
        pd_lifetime: (Math.random() * 0.15).toFixed(4),
        stage: i % 15 === 0 ? 'Stage 3' : i % 5 === 0 ? 'Stage 2' : 'Stage 1',
        segment: ['Credit Card', 'Personal Loan', 'Auto Loan'][i % 3]
    }));
};

// 3. Retail Staging 2b - PD_CUST_DEFV1 (Default Data)
export const generateRetailDefData = () => {
    return Array.from({ length: 300 }, (_, i) => ({
        cust_id: `CUST-${String(i + 1).padStart(6, '0')}`,
        account_no: `ACC-${String(800000 + i)}`,
        default_date: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
        outstanding_amt: '$' + (Math.floor(Math.random() * 15000) + 500).toLocaleString(),
        recovery_amt: '$' + (Math.floor(Math.random() * 5000)).toLocaleString(),
        lgd: (Math.random() * 100).toFixed(2) + '%',
        write_off: i % 2 === 0 ? 'Full' : 'Partial'
    }));
};

// Pre-generate data to avoid regeneration on renders
export const FULL_CORPORATE_DATA = generateCorporateStagingData();
export const FULL_RETAIL_EVER_DATA = generateRetailEverData();
export const FULL_RETAIL_DEF_DATA = generateRetailDefData();

// Dynamic Log templates generator
export const getStageLogs = (stageIndex: number, config: RunConfiguration) => {
    const isRetail = config.scope === 'Retail Banking';

    if (isRetail) {
        const retailTemplates: Record<number, { level: string; message: string }[]> = {
            0: [ // Data Collection
                { level: 'INFO', message: `Initiating connection to ${config.sourceSystem}...` },
                { level: 'SUCCESS', message: 'Connection established. Latency: 42ms.' },
                { level: 'INFO', message: `Querying Retail partition: ${config.snapshotDate}...` },
                { level: 'PROCESS', message: 'Fetching 845,033 retail records...' },
            ],
            1: [ // Data Cleansing
                { level: 'INFO', message: 'Standardizing column headers to snake_case...' },
                { level: 'PROCESS', message: 'Validating retail data types...' },
                { level: 'WARN', message: 'Found 12 records with missing DOB, flagged for review.' },
            ],
            2: [ // Staging 1
                { level: 'INFO', message: 'Initializing Staging 1: Raw Ingestion...' },
                { level: 'PROCESS', message: 'Loading bulk data into STG_1_RETAIL_RAW...' },
                { level: 'SUCCESS', message: 'Raw ingestion complete.' },
            ],
            3: [ // Staging 2a
                { level: 'INFO', message: 'Staging 2a: Splitting Retail Sub-segments (Group A)...' },
                { level: 'PROCESS', message: 'Filtering Mortgage and HELOC accounts...' },
                { level: 'SUCCESS', message: 'Group A segmentation complete.' },
            ],
            4: [ // Staging 2a2
                { level: 'INFO', message: 'Staging 2a2: Refining Group A Parameters...' },
                { level: 'PROCESS', message: 'Calculating LTV ratios for Mortgages...' },
                { level: 'PROCESS', message: 'Validating appraisal dates...' },
            ],
            5: [ // Staging 2b
                { level: 'INFO', message: 'Staging 2b: Splitting Retail Sub-segments (Group B)...' },
                { level: 'PROCESS', message: 'Filtering Credit Cards and Unsecured Loans...' },
                { level: 'PROCESS', message: 'Generating PD_CUST_EVERXV1 and PD_CUST_DEFV1 tables...' },
                { level: 'SUCCESS', message: 'Group B segmentation complete. Tables ready.' },
            ],
            6: [ // Staging 2b2
                { level: 'INFO', message: 'Staging 2b2: Refining Group B Parameters...' },
                { level: 'PROCESS', message: 'Analyzing utilization rates...' },
                { level: 'PROCESS', message: 'Checking revolving limits...' },
            ],
            7: [ // Staging 3
                { level: 'INFO', message: 'Staging 3: Historical Payments Aggregation...' },
                { level: 'PROCESS', message: 'Aggregating last 24m repayment history...' },
                { level: 'SUCCESS', message: 'Payment vectors built.' },
            ],
            8: [ // Staging 4
                { level: 'INFO', message: 'Staging 4: Collateral Mapping...' },
                { level: 'PROCESS', message: 'Updating property index values...' },
                { level: 'SUCCESS', message: 'Collateral updated.' },
            ],
            9: [ // Staging 5
                { level: 'INFO', message: 'Staging 5: Model Input Vector Construction...' },
                { level: 'PROCESS', message: 'Merging all sub-segments...' },
                { level: 'SUCCESS', message: 'Feature vectors ready.' },
            ],
            10: [ // LGD Step 1
                { level: 'INFO', message: 'LGD Step 1: Probability of Cure (Cure Rate)...' },
                { level: 'PROCESS', message: 'Running logistic regression on cured defaults...' },
                { level: 'SUCCESS', message: 'Cure rates calculated.' },
            ],
            11: [ // LGD Step 2
                { level: 'INFO', message: 'LGD Step 2: Loss Severity Estimation...' },
                { level: 'PROCESS', message: 'Calculating downturn LGD...' },
                { level: 'PROCESS', message: 'Applying floor values...' },
                { level: 'SUCCESS', message: 'Retail LGD Model execution complete.' },
            ],
        };
        return retailTemplates[stageIndex] || [];
    }

    // Standard Templates (Corporate/SME)
    const templates: Record<number, { level: string; message: string }[]> = {
        0: [ // Data Collection
            { level: 'INFO', message: `Initiating connection to ${config.sourceSystem}...` },
            { level: 'SUCCESS', message: 'Connection established. Latency: 42ms.' },
            { level: 'INFO', message: `Querying partition: ${config.snapshotDate}...` },
            { level: 'PROCESS', message: 'Fetching 1,245,033 records...' },
        ],
        1: [ // Data Cleansing
            { level: 'INFO', message: 'Standardizing column headers to snake_case...' },
            { level: 'WARN', message: 'Found 3 deprecated columns, dropping...' },
            { level: 'PROCESS', message: 'Validating data types...' },
        ],
        2: [ // Staging 1
            { level: 'INFO', message: 'Initializing Staging 1: Raw Ingestion...' },
            { level: 'PROCESS', message: 'Loading bulk data into STG_1_RAW...' },
            { level: 'SUCCESS', message: 'Raw ingestion complete. 1.2M rows loaded.' },
        ],
        3: [ // Staging 2a
            { level: 'INFO', message: 'Starting Staging 2a: Counterparty Enrichment...' },
            { level: 'PROCESS', message: 'Joining with CRM Customer Master...' },
            { level: 'PROCESS', message: 'Retrieving external ratings (S&P, Moody\'s)...' },
            { level: 'SUCCESS', message: 'Counterparty data enriched.' },
        ],
        4: [ // Staging 2b (The Table One)
            { level: 'INFO', message: 'Executing Staging 2b: Financial Statement Spreading...' },
            { level: 'PROCESS', message: 'Calculating key financial ratios (EBITDA, Leverage)...' },
            { level: 'WARN', message: 'Restated financials found for 15 entities.' },
            { level: 'SUCCESS', message: 'Financial spreading complete. Generating intermediate view...' },
        ],
        5: [ // Staging 3
            { level: 'INFO', message: 'Running Staging 3: Facility Level Aggregation...' },
            { level: 'PROCESS', message: 'Aggregating limit utilization across hierarchy...' },
            { level: 'PROCESS', message: 'Linking collateral to facility tranches...' },
        ],
        6: [ // Staging 4
            { level: 'INFO', message: 'Executing Staging 4: Macroeconomic Overlay...' },
            { level: 'PROCESS', message: 'Applying scenario weights (Base: 40%, Upside: 30%, Downside: 30%)...' },
            { level: 'SUCCESS', message: 'MEV scalars calculated.' },
        ],
        7: [ // Staging 5
            { level: 'INFO', message: 'Finalizing Staging 5: Model Input Vector...' },
            { level: 'PROCESS', message: 'One-hot encoding sector variables...' },
            { level: 'PROCESS', message: 'Scaling numerical features (StandardScaler)...' },
            { level: 'SUCCESS', message: 'Feature vector ready for modeling.' },
        ],
        8: [ // LGD Modeling
            { level: 'INFO', message: `Initializing LGD Model (Unsecured/Secured) for ${config.scope}...` },
            { level: 'PROCESS', message: 'Training Gradient Boosting Regressor...' },
            { level: 'PROCESS', message: 'Calibrating LGD for downturn scenarios...' },
            { level: 'SUCCESS', message: 'LGD parameters finalized.' },
        ],
        9: [ // EAD Modeling
            { level: 'INFO', message: `Calculating CCF and EAD...` },
            { level: 'PROCESS', message: 'Applying off-balance sheet conversion factors...' },
            { level: 'SUCCESS', message: 'EAD calculation converged.' },
            { level: 'INFO', message: 'Pipeline Finalization: Writing results to PROD...' },
        ]
    };
    return templates[stageIndex] || [];
};