/**
 * App Runtime - Bootstrap and Global Event Routing
 *
 * Responsibilities:
 * - Initialize app on mount
 * - Dispatch restoreAuthIntent on startup
 * - Subscribe to global auth state changes → trigger effects
 * - Handle global errors (e.g., 401) → route to auth effects
 *
 * This is the "glue" layer that wires orchestrators together.
 */

import { useEffect } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Runtime Initialization Hook
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hook to initialize the app runtime.
 * Should be called once at the app root (e.g., in App.tsx or main.tsx).
 *
 * Currently a placeholder - will wire up auth orchestrator in Phase 3.
 */
export function useAppRuntime() {
    useEffect(() => {
        // Phase 3: Will dispatch restoreAuthIntent here
        // authOrchestrator.handleRestoreIntent();

        console.debug('[Runtime] App initialized');

        return () => {
            console.debug('[Runtime] App cleanup');
        };
    }, []);
}

// ─────────────────────────────────────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handle authorization errors globally.
 * Called by orchestrators when they catch AuthorizationError.
 *
 * @param error - The error that occurred
 */
export function handleGlobalError(error: Error): void {
    // Phase 3: Will integrate with auth effects
    // if (error instanceof AuthorizationError) {
    //     authEffects.clearAuth();
    //     authEffects.navigateToLogin();
    // }

    console.error('[Runtime] Global error:', error);
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime Configuration
// ─────────────────────────────────────────────────────────────────────────────

export interface RuntimeConfig {
    /**
     * Enable debug logging for runtime events
     */
    debug?: boolean;
}

let runtimeConfig: RuntimeConfig = {
    debug: import.meta.env.DEV,
};

export function configureRuntime(config: Partial<RuntimeConfig>): void {
    runtimeConfig = { ...runtimeConfig, ...config };
}

export function getRuntimeConfig(): RuntimeConfig {
    return runtimeConfig;
}
