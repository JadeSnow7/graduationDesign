// AI API types and helpers

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

export interface ToolCall {
    name: string;
    arguments: Record<string, unknown>;
}

export interface ToolResult {
    name: string;
    success: boolean;
    result?: unknown;
    error?: string;
}

export interface ChatWithToolsRequest {
    mode?: string;
    messages: ChatMessage[];
    enable_tools?: boolean;
    max_tool_calls?: number;
    context?: Record<string, unknown>;
}

export interface ChatWithToolsResponse {
    reply: string;
    model?: string;
    tool_calls: ToolCall[];
    tool_results: ToolResult[];
}

export interface SkillInfo {
    id: string;
    name: string;
    description: string;
}

const AI_SERVICE_BASE = '/api/v1/ai';

export const aiApi = {
    /**
     * Chat with tool calling support (non-streaming)
     */
    async chatWithTools(request: ChatWithToolsRequest): Promise<ChatWithToolsResponse> {
        const response = await fetch(`${AI_SERVICE_BASE}/chat_with_tools`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            throw new Error(`AI service error: ${response.status}`);
        }

        return response.json();
    },

    /**
     * List available skills
     */
    async listSkills(): Promise<SkillInfo[]> {
        const response = await fetch(`${AI_SERVICE_BASE}/skills`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch skills: ${response.status}`);
        }

        const data = await response.json();
        return data.skills || [];
    },

    /**
     * Get chat history (placeholder)
     */
    async getHistory(): Promise<ChatMessage[]> {
        return [];
    },
};

// ─────────────────────────────────────────────────────────────────────────────
// Guided Learning Chat
// ─────────────────────────────────────────────────────────────────────────────

export interface Citation {
    index: number;
    source: string;
    section?: string;
    chunk_id: string;
    text: string;
    score: number;
}

export interface LearningStep {
    step: number;
    title: string;
    description: string;
    questions: string[];
}

export interface GuidedChatRequest {
    session_id?: string;
    topic?: string;
    messages: ChatMessage[];
    course_id?: string;
}

export interface GuidedChatResponse {
    reply: string;
    session_id: string;
    current_step: number;
    total_steps: number;
    progress_percentage: number;
    weak_points: string[];
    citations: Citation[];
    tool_results: ToolResult[];
    model?: string;
    learning_path: LearningStep[];
}

/**
 * Guided learning chat API
 */
export async function chatGuided(request: GuidedChatRequest): Promise<GuidedChatResponse> {
    const response = await fetch(`${AI_SERVICE_BASE}/chat/guided`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Guided chat error: ${response.status} - ${errorText}`);
    }

    return response.json();
}

/**
 * Skill ID to use based on current page context
 */
export function getSkillForPage(pagePath: string): string {
    if (pagePath.includes('/simulation') || pagePath.includes('/sim')) {
        return 'sim_qa';
    }
    if (pagePath.includes('/code') || pagePath.includes('/editor')) {
        return 'code_assist';
    }
    if (pagePath.includes('/assignment') || pagePath.includes('/homework')) {
        return 'problem_solve';
    }
    if (pagePath.includes('/chapter')) {
        return 'concept_tutor';
    }
    if (pagePath.includes('/quiz')) {
        return 'problem_solve';
    }
    // Default to tutor mode
    return 'concept_tutor';
}

/**
 * Build context based on page and data
 */
export function buildContext(
    pagePath: string,
    data?: Record<string, unknown>
): Record<string, unknown> | undefined {
    const context: Record<string, unknown> = {};

    // Add simulation context
    if (pagePath.includes('/simulation') && data?.simParams) {
        context.sim_type = data.simType;
        context.params = data.simParams;
        context.results = data.simResults;
    }

    // Add chapter context
    if (data?.chapterTitle) {
        context.chapter_title = data.chapterTitle;
    }
    if (data?.knowledgePoints) {
        context.knowledge_points = data.knowledgePoints;
    }

    // Add code context
    if (data?.codeSnippet) {
        context.code_snippet = data.codeSnippet;
        context.language = data.language || 'python';
    }
    if (data?.errorMessage) {
        context.error_message = data.errorMessage;
    }

    return Object.keys(context).length > 0 ? context : undefined;
}
