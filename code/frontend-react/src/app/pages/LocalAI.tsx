import { useState, useRef, useEffect } from 'react'
import {
  Button,
  Progress,
  Alert,
  Input,
  Tag,
  Typography,
  Flex,
  Tooltip,
} from 'antd'
import {
  SendOutlined,
  PaperClipOutlined,
  ApiOutlined,
  DesktopOutlined,
  CloudOutlined,
} from '@ant-design/icons'
import { Sparkles, Cpu, WifiOff, Wifi } from 'lucide-react'
import { useAIConfigStore } from '../../stores/aiConfigStore'
import { usePlatform } from '../../hooks/usePlatform'
import { useMobile } from '../../hooks/useMobile'
import { streamChat, streamLocalChat } from '../../api/endpoints/ai'
import type { Message } from '../../types/ai'

const { Text } = Typography

interface ChatMessage extends Message {
  source?: 'local' | 'server'
  model_name?: string
}

export default function LocalAI() {
  const isMobile = useMobile()
  const { isDesktop, isWeb } = usePlatform()
  const aiConfig = useAIConfigStore()

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: '你好！我是 AI 助手。在桌面端可以使用本地模型（无需联网），也可以连接云端服务。',
      source: 'server',
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [showSwitchBanner, setShowSwitchBanner] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const endpoint = aiConfig.resolveEndpoint()
  const isLocalReady = aiConfig.localModelStatus === 'ready'

  const handleDownloadModel = async () => {
    if (!isDesktop) return
    aiConfig.setLocalModelStatus('downloading')
    aiConfig.setDownloadProgress(0)

    try {
      const { invoke, Channel } = await import('@tauri-apps/api/core')
      const progressChannel = new Channel<number>()
      progressChannel.onmessage = (progress) => {
        aiConfig.setDownloadProgress(Math.round(progress * 100))
      }
      await invoke('download_model', {
        url: 'https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct-GGUF/resolve/main/qwen2.5-1.5b-instruct-q4_k_m.gguf',
        progressTx: progressChannel,
      })
      aiConfig.setLocalModelStatus('ready')
      aiConfig.setDownloadProgress(100)
    } catch (err) {
      console.error('Download error:', err)
      aiConfig.setLocalModelStatus('error')
    }
  }

  const handleStartServer = async () => {
    if (!isDesktop || !isLocalReady) return
    try {
      const { invoke } = await import('@tauri-apps/api/core')
      const port = await invoke<number>('start_llama_server', {
        modelPath: aiConfig.localModelPath,
      })
      aiConfig.setLocalPort(port)
    } catch (err) {
      console.error('Failed to start llama server:', err)
    }
  }

  const handleSend = async () => {
    if (!inputValue.trim() || streaming) return
    const userText = inputValue.trim()
    setInputValue('')

    const userMsg: ChatMessage = { role: 'user', content: userText }
    setMessages((prev) => [...prev, userMsg])
    setStreaming(true)

    const source = aiConfig.resolveEndpoint()
    let accumulated = ''
    const assistantMsg: ChatMessage = {
      role: 'assistant',
      content: '',
      source,
      model_name: source === 'local' ? 'Qwen2.5-1.5B' : 'GPT/Qwen3',
    }
    setMessages((prev) => [...prev, assistantMsg])

    try {
      const gen =
        source === 'local'
          ? streamLocalChat({ mode: 'tutor', messages: [userMsg] }, aiConfig.localPort)
          : streamChat({ mode: 'tutor', messages: [...messages, userMsg].map(({ role, content }) => ({ role, content })), stream: true })

      for await (const chunk of gen) {
        accumulated += chunk
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { ...assistantMsg, content: accumulated }
          return updated
        })
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          ...assistantMsg,
          content: 'AI 服务暂时不可用，请检查网络连接或 AI 配置。',
        }
        return updated
      })
    } finally {
      setStreaming(false)
    }
  }

  const sourceLabel = (msg: ChatMessage) => {
    if (!msg.source) return null
    return msg.source === 'local'
      ? `[本地·${msg.model_name ?? 'Qwen2.5-1.5B'}]`
      : `[服务端·${msg.model_name ?? 'GPT/Qwen3'}]`
  }

  const statusBar = (
    <div>
      {aiConfig.localModelStatus === 'downloading' && (
        <div
          className="px-6 py-3 flex items-center gap-4"
          style={{ backgroundColor: 'var(--ai-purple)' }}
        >
          <Text style={{ color: 'white', fontWeight: 500 }}>
            模型下载中 {aiConfig.downloadProgress}%
          </Text>
          <Progress
            percent={aiConfig.downloadProgress}
            showInfo={false}
            strokeColor="white"
            trailColor="rgba(255,255,255,0.3)"
            style={{ flex: 1, maxWidth: 300 }}
          />
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12 }}>
            首次使用需下载 ~1.2GB
          </Text>
        </div>
      )}

      {showSwitchBanner && (
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: 'var(--semantic-success)' }}
        >
          <div className="flex items-center gap-3">
            <Wifi size={18} color="white" />
            <div>
              <Text style={{ color: 'white', fontWeight: 500, display: 'block' }}>网络已恢复</Text>
              <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                是否切换到云端增强模式？
              </Text>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowSwitchBanner(false)}
              style={{ backgroundColor: 'white', color: 'var(--text-light)' }}
            >
              保持本地
            </Button>
            <Button
              onClick={() => {
                aiConfig.setDefaultMode('server')
                setShowSwitchBanner(false)
              }}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
            >
              切换云端
            </Button>
          </div>
        </div>
      )}

      <div
        className="px-6 py-2 text-sm flex items-center gap-4"
        style={{ backgroundColor: 'var(--ai-light)' }}
      >
        <span style={{ color: 'var(--ai-purple)' }}>
          <Cpu size={14} className="inline mr-1" />
          区别于工作台 AI：此助手可在设备本地运行，适合基础问答与文档总结
        </span>
        <div className="ml-auto flex items-center gap-2">
          <Tag
            color={endpoint === 'local' ? 'purple' : 'blue'}
            icon={endpoint === 'local' ? <DesktopOutlined /> : <CloudOutlined />}
          >
            {endpoint === 'local' ? '本地模式' : '云端模式'}
          </Tag>
        </div>
      </div>
    </div>
  )

  const chatArea = (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[70%] rounded-2xl p-6"
              style={{
                backgroundColor:
                  msg.role === 'user' ? 'var(--primary-700)' : 'var(--surface-800)',
                color: msg.role === 'user' ? 'white' : 'var(--text-dark)',
              }}
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={18} color="var(--ai-purple)" />
                  <Text style={{ color: 'var(--ai-purple)', fontWeight: 500 }}>AI 助手</Text>
                  {sourceLabel(msg) && (
                    <Tag
                      color={msg.source === 'local' ? 'purple' : 'blue'}
                      style={{ fontSize: 11 }}
                    >
                      {sourceLabel(msg)}
                    </Tag>
                  )}
                </div>
              )}
              <Text style={{ color: 'inherit', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </Text>
            </div>
          </div>
        ))}

        {streaming && (
          <div className="flex justify-start">
            <div
              className="rounded-2xl p-6"
              style={{ backgroundColor: 'var(--surface-800)' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={18} color="var(--ai-purple)" />
                <Text style={{ color: 'var(--ai-purple)', fontWeight: 500 }}>AI 思考中</Text>
              </div>
              <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full animate-bounce"
                    style={{
                      backgroundColor: 'var(--ai-purple)',
                      animationDelay: `${i * 150}ms`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )

  const inputArea = (
    <div
      className="flex-shrink-0 px-6 py-5 border-t"
      style={{ borderColor: 'var(--surface-700)' }}
    >
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <Tooltip title="附加文件">
          <Button
            type="text"
            icon={<PaperClipOutlined />}
            style={{ color: 'var(--text-muted)' }}
          />
        </Tooltip>
        <Input.TextArea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder="向 AI 提问... (Enter 发送，Shift+Enter 换行)"
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{
            backgroundColor: 'var(--surface-700)',
            color: 'var(--text-dark)',
            border: 'none',
            borderRadius: 12,
            resize: 'none',
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={streaming}
          disabled={!inputValue.trim()}
          onClick={handleSend}
          style={{ borderRadius: 10, height: 44, width: 44 }}
        />
      </div>

      {/* Mode switch controls */}
      <div className="max-w-4xl mx-auto mt-3 flex items-center gap-3 flex-wrap">
        {isDesktop && aiConfig.localModelStatus === 'not_downloaded' && (
          <Button
            size="small"
            icon={<DesktopOutlined />}
            style={{ color: 'var(--ai-purple)', borderColor: 'var(--ai-purple)' }}
            onClick={handleDownloadModel}
          >
            下载本地模型 (Qwen2.5-1.5B, ~1.2GB)
          </Button>
        )}
        {isDesktop && isLocalReady && endpoint === 'server' && (
          <Button
            size="small"
            icon={<DesktopOutlined />}
            style={{ color: 'var(--ai-purple)', borderColor: 'var(--ai-purple)' }}
            onClick={() => {
              aiConfig.setDefaultMode('local')
              handleStartServer()
            }}
          >
            切换到本地模型
          </Button>
        )}
        {endpoint === 'local' && (
          <Button
            size="small"
            icon={<CloudOutlined />}
            onClick={() => aiConfig.setDefaultMode('server')}
          >
            切换到服务端 AI
          </Button>
        )}
        {isWeb && (
          <Alert
            message="本地 AI 仅在桌面客户端可用，当前使用云端模式"
            type="info"
            showIcon
            style={{ padding: '4px 12px', fontSize: 12 }}
            banner
          />
        )}
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <div
        className="flex flex-col"
        style={{ height: 'calc(100vh - 8rem)', backgroundColor: 'var(--surface-50)' }}
      >
        {statusBar}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className="max-w-[85%] rounded-2xl p-4"
                style={{
                  backgroundColor:
                    msg.role === 'user' ? 'var(--primary-700)' : 'var(--surface-100)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-light)',
                }}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 mb-2">
                    <Sparkles size={14} color="var(--ai-purple)" />
                    <Text style={{ color: 'var(--ai-purple)', fontSize: 12, fontWeight: 500 }}>
                      AI
                    </Text>
                    {sourceLabel(msg) && (
                      <Tag
                        color={msg.source === 'local' ? 'purple' : 'blue'}
                        style={{ fontSize: 10, margin: 0 }}
                      >
                        {sourceLabel(msg)}
                      </Tag>
                    )}
                  </div>
                )}
                <Text style={{ color: 'inherit', lineHeight: 1.6 }}>{msg.content}</Text>
              </div>
            </div>
          ))}
          {streaming && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl flex gap-1" style={{ backgroundColor: 'var(--surface-100)' }}>
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: 'var(--ai-purple)', animationDelay: `${i * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div
          className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-lg border-t"
          style={{ borderColor: 'var(--surface-100)' }}
        >
          <div className="flex items-center gap-2">
            <input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="向 AI 提问..."
              className="flex-1 px-4 py-2 rounded-full outline-none text-sm"
              style={{ backgroundColor: 'var(--surface-100)', color: 'var(--text-light)' }}
            />
            <Button
              type="primary"
              shape="circle"
              icon={<SendOutlined />}
              loading={streaming}
              disabled={!inputValue.trim()}
              onClick={handleSend}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--surface-950)' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-8 py-5 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--surface-700)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: 'var(--ai-light)' }}
          >
            <Sparkles size={22} color="var(--ai-purple)" />
          </div>
          <div>
            <Text strong style={{ color: 'var(--text-dark)', fontSize: 18, display: 'block' }}>
              Local AI 助手
            </Text>
            <Text type="secondary" style={{ fontSize: 13 }}>
              <Cpu size={12} className="inline mr-1" />
              {endpoint === 'local' ? '本地运行，无需联网' : '云端服务模式'}
            </Text>
          </div>
        </div>

        <Flex gap={12} align="center">
          {aiConfig.localModelStatus === 'not_downloaded' && isDesktop && (
            <Button
              icon={<DesktopOutlined />}
              style={{ borderColor: 'var(--ai-purple)', color: 'var(--ai-purple)' }}
              onClick={handleDownloadModel}
            >
              下载本地模型
            </Button>
          )}
          {aiConfig.localModelStatus === 'ready' && (
            <Tag color="success" icon={<DesktopOutlined />}>
              本地模型就绪
            </Tag>
          )}
          <div
            className="px-3 py-2 rounded-lg flex items-center gap-2"
            style={{ backgroundColor: 'var(--surface-800)' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  endpoint === 'local' ? 'var(--ai-purple)' : 'var(--semantic-online)',
              }}
            />
            <Text style={{ color: 'var(--text-dark)' }}>
              {endpoint === 'local' ? '本地计算模式' : '云端服务模式'}
            </Text>
            {endpoint === 'local' ? (
              <WifiOff size={14} color="var(--text-muted)" />
            ) : (
              <Wifi size={14} color="var(--semantic-online)" />
            )}
          </div>
          <Button
            size="small"
            icon={<ApiOutlined />}
            onClick={() => setShowSwitchBanner(true)}
          >
            模拟网络恢复
          </Button>
        </Flex>
      </div>

      {statusBar}
      {chatArea}
      {inputArea}
    </div>
  )
}
