/**
 * Simulation Service
 * 
 * Provides API calls for electromagnetic field simulations.
 */

import { apiClient } from '@/lib/api-client';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface SimulationParams {
    [key: string]: unknown;
}

export interface SimulationResult {
    success: boolean;
    data?: unknown;
    error?: string;
    execution_time?: number;
    plot_url?: string;
    // Additional fields from actual simulation responses
    png_base64?: string;
    min_v?: number;
    max_v?: number;
    iter?: number;
    output?: string;
    [key: string]: unknown;  // Allow additional fields
}

// ─────────────────────────────────────────────────────────────────────────────
// Simulation Service
// ─────────────────────────────────────────────────────────────────────────────

const SIM_API_BASE = '/api/v1/sim';

async function runSimulation(endpoint: string, params: SimulationParams): Promise<SimulationResult> {
    const response = await apiClient.post<SimulationResult>(`${SIM_API_BASE}${endpoint}`, params);
    return response.data;
}

export const simService = {
    /**
     * Run 2D Laplace equation simulation.
     */
    runLaplace2D: (params: SimulationParams): Promise<SimulationResult> => {
        return runSimulation('/laplace2d', params);
    },

    /**
     * Run point charges electric field simulation.
     */
    runPointCharges: (params: SimulationParams): Promise<SimulationResult> => {
        return runSimulation('/point-charges', params);
    },

    /**
     * Run wire magnetic field simulation.
     */
    runWireField: (params: SimulationParams): Promise<SimulationResult> => {
        return runSimulation('/wire-field', params);
    },

    /**
     * Execute custom Python simulation code.
     */
    runCustomCode: (code: string): Promise<SimulationResult> => {
        return runSimulation('/execute', { code });
    },
};

