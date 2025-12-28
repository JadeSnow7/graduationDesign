import { useReducer, useCallback, useRef, useEffect } from 'react';
import { streamChat, type ChatMessage, type ChatPayload } from '@/services/ai';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ChatStatus = 'idle' | 'streaming' | 'error';

interface ChatState {
    status: ChatStatus;
    messages: ChatMessage[];
    lastPrompt: string;
    error: string | null;
}

type ChatAction =
    | { type: 'SEND_MESSAGE'; prompt: string }
    | { type: 'APPEND_TOKEN'; token: string }
    | { type: 'STOP' }
    | { type: 'RETRY' }
    | { type: 'FINISH' }
    | { type: 'FAIL'; error: string };

// ─────────────────────────────────────────────────────────────────────────────
// Reducer (Pure function, testable)
// ─────────────────────────────────────────────────────────────────────────────

const initialState: ChatState = {
    status: 'idle',
    messages: [],
    lastPrompt: '',
    error: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case 'SEND_MESSAGE':
            return {
                ...state,
                status: 'streaming',
                lastPrompt: action.prompt,
                error: null,
                messages: [
                    ...state.messages,
                    { role: 'user', content: action.prompt },
                    { role: 'assistant', content: '' }, // Placeholder for streaming
                ],
            };

        case 'APPEND_TOKEN': {
            const msgs = [...state.messages];
            const last = msgs[msgs.length - 1];
            if (last?.role === 'assistant') {
                msgs[msgs.length - 1] = { ...last, content: last.content + action.token };
            }
            return { ...state, messages: msgs };
        }

        case 'STOP':
        case 'FINISH':
            return { ...state, status: 'idle' };

        case 'FAIL':
            return { ...state, status: 'error', error: action.error };

        case 'RETRY':
            // Re-trigger with lastPrompt - actual call happens in hook
            return {
                ...state,
                status: 'streaming',
                error: null,
                messages: [
                    ...state.messages,
                    { role: 'assistant', content: '' },
                ],
            };

        default:
            return state;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

interface UseChatOptions {
    mode?: ChatPayload['mode'];
    rag?: boolean;
}

export function useChat(options: UseChatOptions = {}) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const abortControllerRef = useRef<AbortController | null>(null);
    const pendingRetryRef = useRef(false);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            abortControllerRef.current?.abort();
        };
    }, []);

    const startStream = useCallback(
        async (prompt: string) => {
            // Cancel any existing stream
            abortControllerRef.current?.abort();
            abortControllerRef.current = new AbortController();

            const payload: ChatPayload = {
                messages: [...state.messages, { role: 'user', content: prompt }],
                mode: options.mode,
                rag: options.rag,
            };

            await streamChat(payload, {
                signal: abortControllerRef.current.signal,
                onToken: (token) => dispatch({ type: 'APPEND_TOKEN', token }),
                onFinish: () => dispatch({ type: 'FINISH' }),
                onError: (error) => dispatch({ type: 'FAIL', error: error.message }),
            });
        },
        [state.messages, options.mode, options.rag]
    );

    const sendMessage = useCallback(
        async (prompt: string) => {
            dispatch({ type: 'SEND_MESSAGE', prompt });
            await startStream(prompt);
        },
        [startStream]
    );

    const stop = useCallback(() => {
        abortControllerRef.current?.abort();
        dispatch({ type: 'STOP' });
    }, []);

    const retry = useCallback(async () => {
        if (!state.lastPrompt) return;
        dispatch({ type: 'RETRY' });
        pendingRetryRef.current = true;
    }, [state.lastPrompt]);

    // Handle retry effect
    useEffect(() => {
        if (pendingRetryRef.current && state.status === 'streaming') {
            pendingRetryRef.current = false;
            startStream(state.lastPrompt);
        }
    }, [state.status, state.lastPrompt, startStream]);

    return {
        messages: state.messages,
        status: state.status,
        error: state.error,
        sendMessage,
        stop,
        retry,
    };
}
