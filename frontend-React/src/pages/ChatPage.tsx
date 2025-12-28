import { useState, useRef, useEffect, type FormEvent } from 'react';
import { useChat } from '@/domains/chat/useChat';
import { Send, Square, RotateCcw, Bot, User } from 'lucide-react';
import { clsx } from 'clsx';

export function ChatPage() {
    const { messages, status, error, sendMessage, stop, retry } = useChat({ mode: 'tutor' });
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || status === 'streaming') return;
        sendMessage(input.trim());
        setInput('');
    };

    const isStreaming = status === 'streaming';

    return (
        <div className="h-screen flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 border-b border-gray-700/50 bg-gray-900/50 backdrop-blur-sm">
                <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Bot className="w-6 h-6 text-blue-400" />
                    AI 智能答疑
                </h1>
                <p className="text-sm text-gray-400 mt-1">
                    向 AI 助手提问有关电磁学的问题
                </p>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>开始提问吧！例如："请解释高斯定律"</p>
                    </div>
                )}

                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={clsx(
                            'flex gap-3',
                            msg.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-blue-400" />
                            </div>
                        )}
                        <div
                            className={clsx(
                                'max-w-[70%] px-4 py-3 rounded-2xl',
                                msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-md'
                                    : 'bg-gray-800 text-gray-100 rounded-bl-md border border-gray-700'
                            )}
                        >
                            <p className="whitespace-pre-wrap">
                                {msg.content}
                                {msg.role === 'assistant' && isStreaming && idx === messages.length - 1 && (
                                    <span className="inline-block w-2 h-4 bg-blue-400 ml-1 animate-pulse" />
                                )}
                            </p>
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-gray-300" />
                            </div>
                        )}
                    </div>
                ))}

                {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                        <span>出错了: {error}</span>
                        <button
                            onClick={retry}
                            className="flex items-center gap-1 px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            重试
                        </button>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
                onSubmit={handleSubmit}
                className="p-4 border-t border-gray-700/50 bg-gray-900/50 backdrop-blur-sm"
            >
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="输入你的问题..."
                        className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        disabled={isStreaming}
                    />
                    {isStreaming ? (
                        <button
                            type="button"
                            onClick={stop}
                            className="px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium transition-all flex items-center gap-2"
                        >
                            <Square className="w-5 h-5" />
                            停止
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            发送
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
