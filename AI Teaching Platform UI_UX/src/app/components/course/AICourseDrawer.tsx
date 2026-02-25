import { useState, useRef, useEffect } from 'react'
import { Drawer, Space, Tag, Button, Typography } from 'antd'
import { Sparkles } from 'lucide-react'
import { streamChat } from '../../../api/endpoints/ai'
import { useAIConfigStore } from '../../../stores/aiConfigStore'

const { Text } = Typography

interface AICourseDrawerProps {
    courseId?: string
    open: boolean
    onClose: () => void
    isMobile?: boolean
}

export function AICourseDrawer({ courseId, open, onClose, isMobile }: AICourseDrawerProps) {
    const aiConfig = useAIConfigStore()
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const [aiMessages, setAiMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
        {
            role: 'assistant',
            content:
                '你好！我是 EduCloud 智能助教。针对这门课，你可以随时向我提问。',
        },
    ])
    const [inputValue, setInputValue] = useState('')
    const [streaming, setStreaming] = useState(false)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [aiMessages])

    const handleAskAI = async () => {
        if (!inputValue.trim() || streaming) return
        const userMsg = inputValue.trim()
        setInputValue('')
        setAiMessages((prev) => [...prev, { role: 'user', content: userMsg }])
        setStreaming(true)

        let accumulated = ''
        setAiMessages((prev) => [...prev, { role: 'assistant', content: '' }])

        try {
            const endpoint = aiConfig.resolveEndpoint()
            const gen = streamChat({
                mode: 'tutor_rag',
                messages: [{ role: 'user', content: userMsg }],
                stream: true,
                course_id: courseId ? parseInt(courseId) : undefined,
            })

            for await (const chunk of gen) {
                accumulated += chunk
                setAiMessages((prev) => {
                    const updated = [...prev]
                    updated[updated.length - 1] = {
                        role: 'assistant',
                        content: accumulated + (endpoint === 'local' ? ' [本地·Qwen2.5-1.5B]' : ''),
                    }
                    return updated
                })
            }
        } catch {
            setAiMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                    role: 'assistant',
                    content: '抱歉，AI 服务暂时不可用，请检查网络连接或 AI 配置。',
                }
                return updated
            })
        } finally {
            setStreaming(false)
        }
    }

    // Common UI components that can be reused
    const chatMessagesArea = (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiMessages.map((msg, i) => (
                <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div
                        className="max-w-[85%] rounded-2xl p-3"
                        style={{
                            backgroundColor:
                                msg.role === 'user' ? 'var(--primary-700)' : isMobile ? 'white' : 'var(--surface-800)',
                            color: msg.role === 'user' ? 'white' : isMobile ? 'var(--text-light)' : 'var(--text-dark)',
                        }}
                    >
                        <Text style={{ color: 'inherit', whiteSpace: 'pre-wrap' }}>{msg.content}</Text>
                    </div>
                </div>
            ))}
            {streaming && (
                <div className="flex justify-start">
                    <div
                        className="px-4 py-2 rounded-xl flex gap-1"
                        style={{ backgroundColor: isMobile ? 'var(--surface-100)' : 'var(--surface-800)' }}
                    >
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-2 h-2 rounded-full animate-bounce"
                                style={{
                                    backgroundColor: 'var(--ai-purple)',
                                    animationDelay: `${i * 150}ms`,
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    )

    const chatInputArea = (
        <div
            className={isMobile ? "p-4 bg-white border-t flex gap-2" : "p-4 border-t flex gap-2"}
            style={!isMobile ? { borderColor: 'var(--surface-700)', backgroundColor: 'var(--surface-800)' } : undefined}
        >
            <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAskAI()}
                placeholder="向 AI 提问..."
                className={`flex-1 px-3 py-2 outline-none text-sm ${isMobile ? 'rounded-full' : 'rounded-lg'}`}
                style={{
                    backgroundColor: isMobile ? 'var(--surface-100)' : 'var(--surface-700)',
                    color: isMobile ? 'var(--text-light)' : 'var(--text-dark)'
                }}
            />
            {isMobile ? (
                <Button
                    type="primary"
                    shape="circle"
                    loading={streaming}
                    onClick={handleAskAI}
                    disabled={!inputValue.trim()}
                />
            ) : (
                <Button
                    type="primary"
                    loading={streaming}
                    onClick={handleAskAI}
                    disabled={!inputValue.trim()}
                >
                    发送
                </Button>
            )}
        </div>
    )

    return (
        <Drawer
            title={
                isMobile ? 'AI 课程答疑' : (
                    <Space>
                        <Sparkles size={18} color="var(--ai-purple)" />
                        <span>课程答疑助手</span>
                        <Tag color="purple">
                            {aiConfig.resolveEndpoint() === 'local' ? '本地·Qwen2.5' : '服务端 AI'}
                        </Tag>
                    </Space>
                )
            }
            placement={isMobile ? "bottom" : "right"}
            width={isMobile ? undefined : 400}
            height={isMobile ? "70%" : undefined}
            open={open}
            onClose={onClose}
            styles={{
                body: {
                    backgroundColor: isMobile ? 'var(--surface-50)' : 'var(--surface-950)',
                    padding: 0
                },
                header: isMobile ? undefined : {
                    backgroundColor: 'var(--surface-800)',
                    borderBottom: '1px solid var(--surface-700)',
                    color: 'var(--text-dark)',
                },
            }}
        >
            <div className="flex flex-col h-full">
                {chatMessagesArea}
                {chatInputArea}
            </div>
        </Drawer>
    )
}
