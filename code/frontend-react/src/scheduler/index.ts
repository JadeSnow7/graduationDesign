/**
 * Scheduler Module
 * 
 * Provides task scheduling with conflict resolution, cancellation support,
 * and priority queuing for async operations.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface TaskConfig {
    id: string;
    type: string;
    priority: number;
    conflictKeys: string[];
    cancellationPolicy: 'cancel-old' | 'reject-new' | 'queue';
}

export interface TaskReporter<T> {
    reportPartial(data: T): void;
}

export interface TaskCallbacks<T> {
    onPartial?: (data: T) => void;
    onComplete?: (result: T) => void;
    onError?: (error: Error) => void;
    onCancel?: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Errors
// ─────────────────────────────────────────────────────────────────────────────

export class AuthorizationError extends Error {
    constructor(message: string = 'Unauthorized') {
        super(message);
        this.name = 'AuthorizationError';
    }
}

export class TaskCancelledError extends Error {
    constructor(message: string = 'Task was cancelled') {
        super(message);
        this.name = 'TaskCancelledError';
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Scheduler Implementation
// ─────────────────────────────────────────────────────────────────────────────

interface ActiveTask {
    config: TaskConfig;
    abortController: AbortController;
}

class Scheduler {
    private activeTasks: Map<string, ActiveTask> = new Map();
    private conflictMap: Map<string, Set<string>> = new Map();

    /**
     * Schedule a task with conflict resolution and cancellation support.
     */
    schedule<T>(
        config: TaskConfig,
        executor: (signal: AbortSignal, reporter: TaskReporter<T>) => Promise<T>,
        callbacks: TaskCallbacks<T>
    ): void {
        // Handle conflicts based on policy
        for (const key of config.conflictKeys) {
            const existingTaskIds = this.conflictMap.get(key);
            if (existingTaskIds && existingTaskIds.size > 0) {
                if (config.cancellationPolicy === 'cancel-old') {
                    // Cancel all existing tasks with this conflict key
                    for (const taskId of existingTaskIds) {
                        this.cancelTask(taskId);
                    }
                } else if (config.cancellationPolicy === 'reject-new') {
                    // Don't schedule this task
                    callbacks.onError?.(new Error('Task rejected due to conflict'));
                    return;
                }
            }
        }

        const abortController = new AbortController();
        const activeTask: ActiveTask = { config, abortController };

        // Register task
        this.activeTasks.set(config.id, activeTask);
        for (const key of config.conflictKeys) {
            if (!this.conflictMap.has(key)) {
                this.conflictMap.set(key, new Set());
            }
            this.conflictMap.get(key)!.add(config.id);
        }

        // Create reporter
        const reporter: TaskReporter<T> = {
            reportPartial: (data: T) => {
                callbacks.onPartial?.(data);
            },
        };

        // Execute task
        executor(abortController.signal, reporter)
            .then((result) => {
                this.cleanup(config.id, config.conflictKeys);
                callbacks.onComplete?.(result);
            })
            .catch((error) => {
                this.cleanup(config.id, config.conflictKeys);
                if (error instanceof TaskCancelledError || abortController.signal.aborted) {
                    callbacks.onCancel?.();
                } else {
                    callbacks.onError?.(error);
                }
            });
    }

    /**
     * Cancel a specific task by ID.
     */
    cancelTask(taskId: string): void {
        const task = this.activeTasks.get(taskId);
        if (task) {
            task.abortController.abort();
            this.cleanup(taskId, task.config.conflictKeys);
        }
    }

    /**
     * Cancel all tasks with a specific conflict key.
     */
    cancelByConflictKey(conflictKey: string): void {
        const taskIds = this.conflictMap.get(conflictKey);
        if (taskIds) {
            for (const taskId of [...taskIds]) {
                this.cancelTask(taskId);
            }
        }
    }

    /**
     * Clean up after task completion or cancellation.
     */
    private cleanup(taskId: string, conflictKeys: string[]): void {
        this.activeTasks.delete(taskId);
        for (const key of conflictKeys) {
            const taskSet = this.conflictMap.get(key);
            if (taskSet) {
                taskSet.delete(taskId);
                if (taskSet.size === 0) {
                    this.conflictMap.delete(key);
                }
            }
        }
    }
}

// Export singleton instance
export const scheduler = new Scheduler();
