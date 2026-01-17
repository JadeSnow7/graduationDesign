/**
 * SimAIChat - AI Chat component for simulation page
 * 
 * Features:
 * - Uses sim_qa skill automatically
 * - Injects simulation context (type, params, results)
 * - Supports tool calling for calculations
 * - Renders responses with Markdown + LaTeX
 */

import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Loader2, Calculator, Sparkles } from 'lucide-react';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { aiApi, type ChatMessage, type ToolResult } from '@/api/ai';

interface SimContext {
    simType: string;
    params?: Record<string, unknown>;
    results?: Record<string, unknown>;
    code?: string;  // Current code from editor
    codeOutput?: string;  // Latest execution output
    codePlots?: number;  // Number of plots generated
}

interface SimAIChatProps {
    isOpen: boolean;
    onClose: () => void;
    context: SimContext;
}

export function SimAIChat({ isOpen, onClose, context }: SimAIChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toolResults, setToolResults] = useState<ToolResult[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Suggested questions based on simulation type
    const getSuggestedQuestions = () => {
        const common = [
            '这个仿真结果代表什么物理含义？',
            '请解释仿真中的边界条件',
        ];

        switch (context.simType) {
            case 'laplace':
                return [
                    '解释拉普拉斯方程的物理意义',
                    '为什么电势满足拉普拉斯方程？',
                    ...common,
                ];
            case 'charges':
                return [
                    '点电荷周围的电场分布规律',
                    '如何根据库仑定律计算电场强度？',
                    ...common,
                ];
            case 'code':
                return [
                    '帮我解释这段代码的物理含义',
                    '如何优化这个仿真算法？',
                    ...common,
                ];
            default:
                return common;
        }
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', content: input.trim() };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await aiApi.chatWithTools({
                mode: 'sim_qa',
                messages: newMessages,
                enable_tools: true,
                context: {
                    sim_type: context.simType,
                    params: context.params,
                    results: context.results,
                    current_code: context.code,
                    code_output: context.codeOutput,
                    plots_generated: context.codePlots,
                },
            });

            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.reply,
            };
            setMessages([...newMessages, assistantMessage]);

            if (response.tool_results.length > 0) {
                setToolResults(response.tool_results);
            }
        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: `抱歉，发生错误：${error instanceof Error ? error.message : '未知错误'}`,
            };
            setMessages([...newMessages, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInput(question);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-gray-900 border-l border-gray-700 flex flex-col z-50 shadow-2xl">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between bg-gray-800">
                <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-purple-400" />
                    <span className="font-medium text-white">仿真 AI 助手</span>
                    <span className="text-xs px-2 py-0.5 bg-purple-600/30 text-purple-300 rounded">sim_qa</span>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Context Info */}
            {context.simType && (
                <div className="px-4 py-2 bg-gray-800/50 border-b border-gray-700 text-xs text-gray-400">
                    <span className="text-gray-500">当前仿真: </span>
                    <span className="text-purple-300">{context.simType}</span>
                    {context.code && (
                        <span className="ml-2 text-blue-400">✓ 已读取代码</span>
                    )}
                    {context.codeOutput && (
                        <span className="ml-2 text-green-400">✓ 已有输出</span>
                    )}
                </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="space-y-4">
                        <div className="text-center text-gray-500 py-4">
                            <Sparkles className="w-8 h-8 mx-auto mb-2 text-purple-400/50" />
                            <p className="text-sm">我可以帮你理解仿真结果、解释物理现象</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-gray-500 uppercase tracking-wide">推荐问题</p>
                            {getSuggestedQuestions().map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestedQuestion(q)}
                                    className="w-full text-left px-3 py-2 text-sm text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            {msg.role === 'assistant' && (
                                <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-purple-400" />
                                </div>
                            )}
                            <div
                                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === 'user'
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                                    }`}
                            >
                                {msg.role === 'assistant' ? (
                                    <MarkdownRenderer content={msg.content} />
                                ) : (
                                    <p>{msg.content}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* Tool Results Indicator */}
                {toolResults.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 px-2">
                        <Calculator className="w-3 h-3" />
                        <span>已调用 {toolResults.length} 个计算工具</span>
                    </div>
                )}

                {/* Loading indicator */}
                {isLoading && (
                    <div className="flex gap-2 justify-start">
                        <div className="w-7 h-7 rounded-lg bg-purple-600/20 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="px-3 py-2 rounded-xl bg-gray-800 border border-gray-700">
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                思考中...
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-gray-700 bg-gray-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="询问关于仿真结果的问题..."
                        className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className="px-3 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
