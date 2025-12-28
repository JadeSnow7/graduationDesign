import { useState, type FormEvent } from 'react'
import {
  chatWithAi,
  type ChatMessage,
  type ChatReference,
} from '../features/ai/aiService'

const AI_MODES = [
  { value: 'tutor', label: 'Tutor' },
  { value: 'grader', label: 'Grader' },
  { value: 'sim_explain', label: 'Simulation explain' },
  { value: 'formula_verify', label: 'Formula verify' },
  { value: 'problem_solver', label: 'Problem solver' },
]

const AiAssistantPage = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('tutor')
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [references, setReferences] = useState<ChatReference[]>([])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) {
      return
    }

    setError(null)
    setIsSending(true)

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: trimmed },
    ]

    setMessages(nextMessages)
    setInput('')

    try {
      const reply = await chatWithAi({
        mode,
        messages: nextMessages,
        stream: false,
      })
      setMessages([...nextMessages, { role: 'assistant', content: reply.reply }])
      setReferences(reply.references || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'AI request failed'
      setError(message)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="page">
      <div className="page__header">
        <div>
          <h1>AI Assistant</h1>
          <p>Start a focused tutoring or grading conversation with the model.</p>
        </div>
        <label className="field field--inline">
          <span className="field__label">Mode</span>
          <select value={mode} onChange={(event) => setMode(event.target.value)}>
            {AI_MODES.map((aiMode) => (
              <option key={aiMode.value} value={aiMode.value}>
                {aiMode.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="chat">
        <div className="chat__log">
          {messages.length === 0 ? (
            <div className="empty">Ask the assistant to get started.</div>
          ) : (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`chat__bubble chat__bubble--${message.role}`}
              >
                <span>{message.content}</span>
              </div>
            ))
          )}
        </div>
        <form className="chat__form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask about boundary conditions, simulations, homework..."
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={isSending}
          />
          <button type="submit" className="button" disabled={isSending}>
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
      {error ? <div className="alert alert--error">{error}</div> : null}
      {references.length > 0 ? (
        <div className="card">
          <h2>References</h2>
          <ul className="list">
            {references.map((ref, index) => (
              <li key={`${ref.source}-${index}`}>
                {ref.source}
                {ref.section ? ` - ${ref.section}` : ''}
                {ref.confidence ? ` - ${Math.round(ref.confidence * 100)}%` : ''}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

export default AiAssistantPage
