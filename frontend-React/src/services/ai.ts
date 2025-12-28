import { getAuthHeaders } from './api/getAuthHeaders';

const MOCK_MODE = import.meta.env.VITE_MOCK_API === 'true';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface ChatPayload {
    messages: ChatMessage[];
    mode?: 'tutor' | 'grader' | 'sim_explain';
    rag?: boolean;
}

/**
 * Mock stream generator for development
 */
async function* mockStreamGenerator(): AsyncGenerator<string> {
    const mockResponse = '这是一个模拟的 AI 回复。高斯定律描述了电场与电荷之间的关系，是电磁学的基本定律之一。';
    for (const char of mockResponse) {
        await new Promise((resolve) => setTimeout(resolve, 50));
        yield char;
    }
}

/**
 * Stream chat with AI service using SSE
 * @param payload - Chat messages and options
 * @param options - AbortSignal for cancellation and token callback
 */
export async function streamChat(
    payload: ChatPayload,
    options: {
        signal: AbortSignal;
        onToken: (token: string) => void;
        onFinish?: () => void;
        onError?: (error: Error) => void;
    }
): Promise<void> {
    // Mock mode
    if (MOCK_MODE) {
        try {
            for await (const token of mockStreamGenerator()) {
                if (options.signal.aborted) break;
                options.onToken(token);
            }
            options.onFinish?.();
        } catch (error) {
            options.onError?.(error as Error);
        }
        return;
    }

    // Real API call
    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat?stream=true`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders(),
            },
            body: JSON.stringify(payload),
            signal: options.signal,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('No readable stream');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();

            if (done) {
                options.onFinish?.();
                break;
            }

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE format: "data: xxx\n\n"
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const token = line.slice(6);
                    if (token === '[DONE]') {
                        options.onFinish?.();
                        return;
                    }
                    options.onToken(token);
                }
            }
        }
    } catch (error) {
        if ((error as Error).name === 'AbortError') {
            // User aborted, not an error
            return;
        }
        options.onError?.(error as Error);
    }
}
