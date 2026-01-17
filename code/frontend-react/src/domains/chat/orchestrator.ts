/**
 * Chat Domain - Orchestrator
 *
 * The orchestrator is the "glue" that:
 * - Receives intents from UI
 * - Schedules tasks via the Scheduler
 * - Translates TaskEvents into ChatMutations
 * - Applies mutations to the store
 * - Triggers effects on errors (e.g., auth redirect)
 *
 * This keeps the Store pure (no IO) and the UI simple (just dispatch intents).
 */

import { scheduler, AuthorizationError } from '@/scheduler';
import type { TaskCallbacks } from '@/scheduler';
import { aiStreamClient } from '@/lib/ai-stream';
import { useChatStore } from './useChatStore';
import type { ChatMessage } from '@/api/ai';

// ─────────────────────────────────────────────────────────────────────────────
// ID Generation
// ─────────────────────────────────────────────────────────────────────────────

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generateTitle(messages: ChatMessage[]): string {
    const firstUserMsg = messages.find(m => m.role === 'user');
    if (firstUserMsg) {
        return firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
    }
    return '新对话';
}

// ─────────────────────────────────────────────────────────────────────────────
// Chat Orchestrator
// ─────────────────────────────────────────────────────────────────────────────

export const chatOrchestrator = {
    /**
     * Handle send message intent from UI.
     * Creates conversation if needed, schedules streaming task.
     */
    handleSendIntent(prompt: string): void {
        const store = useChatStore.getState();
        let { currentConversationId, conversations, mode, rag } = store;

        // Create new conversation if none exists
        if (!currentConversationId) {
            const newId = generateId();
            useChatStore.setState(state => ({
                conversations: [
                    {
                        id: newId,
                        title: '新对话',
                        messages: [],
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    },
                    ...state.conversations,
                ],
                currentConversationId: newId,
                status: 'idle',
                error: null,
            }));
            currentConversationId = newId;
            conversations = useChatStore.getState().conversations;
        }

        // Get conversation and build messages
        const conv = conversations.find(c => c.id === currentConversationId);
        if (!conv) return;

        const userMessage: ChatMessage = { role: 'user', content: prompt };
        const assistantPlaceholder: ChatMessage = { role: 'assistant', content: '' };
        const updatedMessages = [...conv.messages, userMessage, assistantPlaceholder];

        // Update state: add messages, set streaming status
        useChatStore.setState(state => ({
            status: 'streaming',
            error: null,
            conversations: state.conversations.map(c =>
                c.id === currentConversationId
                    ? {
                        ...c,
                        messages: updatedMessages,
                        title: c.messages.length === 0 ? generateTitle(updatedMessages) : c.title,
                        updatedAt: Date.now(),
                    }
                    : c
            ),
        }));

        // Build effective mode
        let effectiveMode = mode || 'tutor';
        if (rag) {
            effectiveMode = `${effectiveMode}_rag`;
        }

        // Filter empty messages for API call
        const filteredMessages = updatedMessages.filter(m => m.content.trim() !== '');

        // Schedule the streaming task
        const taskId = `chat-stream-${generateId()}`;

        const callbacks: TaskCallbacks<string> = {
            onPartial: (token: string) => {
                // Append token to current assistant message
                const state = useChatStore.getState();
                const convId = state.currentConversationId;
                if (!convId) return;


                useChatStore.setState(s => ({
                    conversations: s.conversations.map(c => {
                        if (c.id !== convId) return c;
                        const msgs = [...c.messages];
                        const last = msgs[msgs.length - 1];
                        if (last?.role === 'assistant') {
                            msgs[msgs.length - 1] = { ...last, content: last.content + (token as string) };
                        }
                        return { ...c, messages: msgs, updatedAt: Date.now() };
                    }),
                }));
            },
            onComplete: () => {
                useChatStore.setState({ status: 'idle' });
            },
            onError: (error: Error) => {
                useChatStore.setState({ status: 'error', error: error.message });

                // Handle auth errors - trigger effects
                if (error instanceof AuthorizationError) {
                    // Phase 4: Will use authEffects.navigateToLogin()
                    console.warn('[ChatOrchestrator] Auth error - should redirect to login');
                }
            },
            onCancel: () => {
                useChatStore.setState({ status: 'idle' });
            },
        };

        scheduler.schedule(
            {
                id: taskId,
                type: 'chat/stream',
                priority: 1,
                conflictKeys: ['chat-stream'],
                cancellationPolicy: 'cancel-old',
            },
            async (signal, reporter): Promise<string> => {
                let isReasoning = false;
                await aiStreamClient.streamChat(filteredMessages, {
                    mode: effectiveMode,
                    signal,
                    onMessage: (token: string) => {
                        if (isReasoning) {
                            reporter.reportPartial('\n\n---\n\n');
                            isReasoning = false;
                        }
                        reporter.reportPartial(token);
                    },
                    onReasoning: (token: string) => {
                        if (!isReasoning) {
                            reporter.reportPartial('> **Thinking...**\n\n> ');
                            isReasoning = true;
                        }
                        // Handle newlines to maintain blockquote style
                        const formatted = token.replace(/\n/g, '\n> ');
                        reporter.reportPartial(formatted);
                    },
                    onFinish: () => { /* handled by scheduler onComplete */ },
                    onError: (error: Error) => { throw error; },
                });
                return ''; // Stream complete, no final value needed
            },
            callbacks
        );
    },

    /**
     * Handle stop intent - cancel ongoing stream.
     */
    handleStopIntent(): void {
        scheduler.cancelByConflictKey('chat-stream');
        useChatStore.setState({ status: 'idle' });
    },

    /**
     * Handle new conversation intent.
     */
    handleNewConversationIntent(): string {
        // Cancel any ongoing stream
        scheduler.cancelByConflictKey('chat-stream');

        const id = generateId();
        useChatStore.setState(state => ({
            conversations: [
                {
                    id,
                    title: '新对话',
                    messages: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                },
                ...state.conversations,
            ],
            currentConversationId: id,
            status: 'idle',
            error: null,
        }));
        return id;
    },

    /**
     * Handle select conversation intent.
     */
    handleSelectConversationIntent(id: string): void {
        // Cancel any ongoing stream when switching
        scheduler.cancelByConflictKey('chat-stream');
        useChatStore.setState({ currentConversationId: id, status: 'idle', error: null });
    },

    /**
     * Handle delete conversation intent.
     */
    handleDeleteConversationIntent(id: string): void {
        useChatStore.setState(state => {
            const filtered = state.conversations.filter(c => c.id !== id);
            const newCurrentId = state.currentConversationId === id
                ? (filtered[0]?.id || null)
                : state.currentConversationId;
            return {
                conversations: filtered,
                currentConversationId: newCurrentId,
            };
        });
    },

    /**
     * Handle clear history intent.
     */
    handleClearHistoryIntent(): void {
        scheduler.cancelByConflictKey('chat-stream');
        useChatStore.setState({ conversations: [], currentConversationId: null, status: 'idle' });
    },

    /**
     * Handle mode change intent.
     */
    handleModeChangeIntent(mode: string): void {
        useChatStore.setState({ mode });
    },

    /**
     * Handle RAG toggle intent.
     */
    handleRagChangeIntent(rag: boolean): void {
        useChatStore.setState({ rag });
    },

    /**
     * Handle guided learning send intent.
     * Uses non-streaming chatGuided API and updates guided session state.
     */
    async handleGuidedSendIntent(prompt: string, topic?: string): Promise<void> {
        const store = useChatStore.getState();
        let { currentConversationId, conversations, guidedSession } = store;

        // Create new conversation if none exists
        if (!currentConversationId) {
            const newId = generateId();
            useChatStore.setState(state => ({
                conversations: [
                    {
                        id: newId,
                        title: topic || '引导式学习',
                        messages: [],
                        createdAt: Date.now(),
                        updatedAt: Date.now(),
                    },
                    ...state.conversations,
                ],
                currentConversationId: newId,
                status: 'idle',
                error: null,
            }));
            currentConversationId = newId;
            conversations = useChatStore.getState().conversations;
        }

        // Get conversation and build messages
        const conv = conversations.find(c => c.id === currentConversationId);
        if (!conv) return;

        const userMessage: ChatMessage = { role: 'user', content: prompt };
        const updatedMessages = [...conv.messages, userMessage];

        // Update state: add user message, set streaming status
        useChatStore.setState(state => ({
            status: 'streaming',
            error: null,
            conversations: state.conversations.map(c =>
                c.id === currentConversationId
                    ? { ...c, messages: updatedMessages, updatedAt: Date.now() }
                    : c
            ),
        }));

        try {
            // Import and call guided chat API
            const { chatGuided } = await import('@/api/ai');

            const response = await chatGuided({
                session_id: guidedSession?.sessionId || undefined,
                topic: topic,
                messages: updatedMessages.filter(m => m.content.trim() !== ''),
            });

            // Update store with response
            const assistantMessage: ChatMessage = { role: 'assistant', content: response.reply };

            useChatStore.setState(state => ({
                status: 'idle',
                guidedSession: {
                    sessionId: response.session_id,
                    currentStep: response.current_step,
                    totalSteps: response.total_steps,
                    progressPercentage: response.progress_percentage,
                    weakPoints: response.weak_points || [],
                    learningPath: response.learning_path || [],
                },
                conversations: state.conversations.map(c =>
                    c.id === currentConversationId
                        ? { ...c, messages: [...updatedMessages, assistantMessage], updatedAt: Date.now() }
                        : c
                ),
            }));
        } catch (error) {
            useChatStore.setState({
                status: 'error',
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    },

    /**
     * Clear guided session state (when switching modes).
     */
    clearGuidedSession(): void {
        useChatStore.setState({ guidedSession: null });
    },
};

