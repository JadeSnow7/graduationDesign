import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '@/api/ai';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ChatStatus = 'idle' | 'streaming' | 'error';

interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

interface ChatStoreState {
    // Current conversation state
    status: ChatStatus;
    currentConversationId: string | null;
    error: string | null;

    // Conversation history
    conversations: Conversation[];

    // Options
    mode: string;
    rag: boolean;

    // Guided learning session state
    guidedSession: {
        sessionId: string | null;
        currentStep: number;
        totalSteps: number;
        progressPercentage: number;
        weakPoints: string[];
        learningPath: Array<{
            step: number;
            title: string;
            description: string;
            questions: string[];
        }>;
    } | null;

    // Actions
    getCurrentConversation: () => Conversation | null;
    getMessages: () => ChatMessage[];

    // Conversation management
    newConversation: () => string;
    selectConversation: (id: string) => void;
    deleteConversation: (id: string) => void;
    clearHistory: () => void;

    // Message actions (deprecated - use orchestrator directly)
    sendMessage: (prompt: string) => void;
    appendToken: (token: string) => void;
    stop: () => void;
    setError: (error: string | null) => void;
    finishStreaming: () => void;

    // Options
    setMode: (mode: string) => void;
    setRag: (rag: boolean) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Store Implementation
// ─────────────────────────────────────────────────────────────────────────────

export const useChatStore = create<ChatStoreState>()(
    persist(
        (set, get) => ({
            status: 'idle',
            currentConversationId: null,
            error: null,
            conversations: [],
            mode: 'tutor',
            rag: false,
            guidedSession: null,

            // Get current conversation
            getCurrentConversation: () => {
                const { currentConversationId, conversations } = get();
                if (!currentConversationId) return null;
                return conversations.find(c => c.id === currentConversationId) || null;
            },

            // Get messages of current conversation
            getMessages: () => {
                const conv = get().getCurrentConversation();
                return conv?.messages || [];
            },

            // Create new conversation - delegates to orchestrator
            newConversation: () => {
                // Lazy import to avoid circular dependency
                import('./orchestrator').then(({ chatOrchestrator }) => {
                    chatOrchestrator.handleNewConversationIntent();
                });
                // Return empty string - orchestrator will set the ID
                return '';
            },

            // Select existing conversation
            selectConversation: (id: string) => {
                import('./orchestrator').then(({ chatOrchestrator }) => {
                    chatOrchestrator.handleSelectConversationIntent(id);
                });
            },

            // Delete conversation
            deleteConversation: (id: string) => {
                import('./orchestrator').then(({ chatOrchestrator }) => {
                    chatOrchestrator.handleDeleteConversationIntent(id);
                });
            },

            // Clear all history
            clearHistory: () => {
                import('./orchestrator').then(({ chatOrchestrator }) => {
                    chatOrchestrator.handleClearHistoryIntent();
                });
            },

            /**
             * Send message - async action
             * @deprecated Use chatOrchestrator.handleSendIntent() directly
             */
            sendMessage: (prompt: string) => {
                if (import.meta.env.DEV) {
                    console.warn('[useChatStore] sendMessage is deprecated. Use chatOrchestrator.handleSendIntent()');
                }
                import('./orchestrator').then(({ chatOrchestrator }) => {
                    chatOrchestrator.handleSendIntent(prompt);
                });
            },

            // Append token to current assistant message
            // Note: This is called by the orchestrator
            appendToken: (token: string) => {
                const { currentConversationId } = get();
                if (!currentConversationId) return;

                set(state => ({
                    conversations: state.conversations.map(c => {
                        if (c.id !== currentConversationId) return c;
                        const msgs = [...c.messages];
                        const last = msgs[msgs.length - 1];
                        if (last?.role === 'assistant') {
                            msgs[msgs.length - 1] = { ...last, content: last.content + token };
                        }
                        return { ...c, messages: msgs, updatedAt: Date.now() };
                    }),
                }));
            },

            /**
             * Stop streaming
             * @deprecated Use chatOrchestrator.handleStopIntent() directly
             */
            stop: () => {
                if (import.meta.env.DEV) {
                    console.warn('[useChatStore] stop is deprecated. Use chatOrchestrator.handleStopIntent()');
                }
                import('./orchestrator').then(({ chatOrchestrator }) => {
                    chatOrchestrator.handleStopIntent();
                });
            },

            // Set error
            setError: (error: string | null) => {
                set({ status: error ? 'error' : 'idle', error });
            },

            // Finish streaming
            finishStreaming: () => {
                set({ status: 'idle' });
            },

            // Set mode
            setMode: (mode: string) => {
                import('./orchestrator').then(({ chatOrchestrator }) => {
                    chatOrchestrator.handleModeChangeIntent(mode);
                });
            },
            setRag: (rag: boolean) => {
                import('./orchestrator').then(({ chatOrchestrator }) => {
                    chatOrchestrator.handleRagChangeIntent(rag);
                });
            },
        }),
        {
            name: 'chat-storage',
            // Only persist certain fields
            partialize: (state) => ({
                conversations: state.conversations,
                currentConversationId: state.currentConversationId,
                mode: state.mode,
                rag: state.rag,
            }),
        }
    )
);

// Re-export types for convenience
export type { ChatStatus, Conversation, ChatStoreState };
