/**
 * Chat Domain - Mutation Types
 *
 * State mutations for the Chat domain. These are pure state transitions
 * applied by the store when receiving results from the orchestrator.
 *
 * The Orchestrator interprets TaskEvents and translates them into these mutations.
 */

import type { ChatMessage } from '@/api/ai';

// ─────────────────────────────────────────────────────────────────────────────
// Mutation Types
// ─────────────────────────────────────────────────────────────────────────────

export type ChatMutation =
    // Conversation lifecycle
    | { type: 'chat/conversationCreated'; id: string; title: string; createdAt: number }
    | { type: 'chat/conversationSelected'; id: string }
    | { type: 'chat/conversationDeleted'; id: string }
    | { type: 'chat/historyCleared' }
    // Message lifecycle
    | { type: 'chat/userMessageAdded'; message: ChatMessage; conversationId: string }
    | { type: 'chat/assistantMessageStarted'; conversationId: string }
    // Streaming
    | { type: 'chat/streamStarted'; conversationId: string }
    | { type: 'chat/tokenReceived'; token: string }
    | { type: 'chat/streamFinished' }
    | { type: 'chat/streamFailed'; error: string }
    | { type: 'chat/streamCancelled' }
    // Settings
    | { type: 'chat/modeChanged'; mode: string }
    | { type: 'chat/ragChanged'; rag: boolean }
    // Error handling
    | { type: 'chat/errorSet'; error: string | null };

// ─────────────────────────────────────────────────────────────────────────────
// State Shape (for reference)
// ─────────────────────────────────────────────────────────────────────────────

export type ChatStatus = 'idle' | 'streaming' | 'error';

export interface Conversation {
    id: string;
    title: string;
    messages: ChatMessage[];
    createdAt: number;
    updatedAt: number;
}

export interface ChatState {
    status: ChatStatus;
    currentConversationId: string | null;
    error: string | null;
    conversations: Conversation[];
    mode: string;
    rag: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Pure Reducer (for testing and debugging)
// ─────────────────────────────────────────────────────────────────────────────

export function applyChatMutation(state: ChatState, mutation: ChatMutation): ChatState {
    switch (mutation.type) {
        // Conversation lifecycle
        case 'chat/conversationCreated':
            return {
                ...state,
                currentConversationId: mutation.id,
                conversations: [
                    ...state.conversations,
                    {
                        id: mutation.id,
                        title: mutation.title,
                        messages: [],
                        createdAt: mutation.createdAt,
                        updatedAt: mutation.createdAt,
                    },
                ],
            };

        case 'chat/conversationSelected':
            return {
                ...state,
                currentConversationId: mutation.id,
                error: null,
            };

        case 'chat/conversationDeleted': {
            const newConversations = state.conversations.filter((c) => c.id !== mutation.id);
            return {
                ...state,
                conversations: newConversations,
                currentConversationId:
                    state.currentConversationId === mutation.id
                        ? newConversations[0]?.id ?? null
                        : state.currentConversationId,
            };
        }

        case 'chat/historyCleared':
            return {
                ...state,
                conversations: [],
                currentConversationId: null,
            };

        // Message lifecycle
        case 'chat/userMessageAdded':
            return {
                ...state,
                conversations: state.conversations.map((c) =>
                    c.id === mutation.conversationId
                        ? {
                            ...c,
                            messages: [...c.messages, mutation.message],
                            updatedAt: Date.now(),
                        }
                        : c
                ),
            };

        case 'chat/assistantMessageStarted':
            return {
                ...state,
                conversations: state.conversations.map((c) =>
                    c.id === mutation.conversationId
                        ? {
                            ...c,
                            messages: [
                                ...c.messages,
                                { role: 'assistant' as const, content: '' },
                            ],
                            updatedAt: Date.now(),
                        }
                        : c
                ),
            };

        // Streaming
        case 'chat/streamStarted':
            return {
                ...state,
                status: 'streaming',
                error: null,
            };

        case 'chat/tokenReceived': {
            const currentConv = state.conversations.find(
                (c) => c.id === state.currentConversationId
            );
            if (!currentConv) return state;

            const lastMessage = currentConv.messages[currentConv.messages.length - 1];
            if (!lastMessage || lastMessage.role !== 'assistant') return state;

            return {
                ...state,
                conversations: state.conversations.map((c) =>
                    c.id === state.currentConversationId
                        ? {
                            ...c,
                            messages: c.messages.map((m, i) =>
                                i === c.messages.length - 1
                                    ? { ...m, content: m.content + mutation.token }
                                    : m
                            ),
                        }
                        : c
                ),
            };
        }

        case 'chat/streamFinished':
            return {
                ...state,
                status: 'idle',
            };

        case 'chat/streamFailed':
            return {
                ...state,
                status: 'error',
                error: mutation.error,
            };

        case 'chat/streamCancelled':
            return {
                ...state,
                status: 'idle',
            };

        // Settings
        case 'chat/modeChanged':
            return {
                ...state,
                mode: mutation.mode,
            };

        case 'chat/ragChanged':
            return {
                ...state,
                rag: mutation.rag,
            };

        // Error handling
        case 'chat/errorSet':
            return {
                ...state,
                error: mutation.error,
                status: mutation.error ? 'error' : state.status,
            };

        default:
            return state;
    }
}
