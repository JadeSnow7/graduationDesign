import { useState } from 'react'
import {
  Button,
  Typography,
  Image,
  Space,
  Input,
} from 'antd'
import {
  PlayCircleOutlined,
  CodeOutlined,
  ThunderboltOutlined,
  MessageOutlined,
  AppstoreOutlined,
} from '@ant-design/icons'
import { Sparkles } from 'lucide-react'
import { useMobile } from '../../hooks/useMobile'

const { Title, Text } = Typography

// Mock simulation field SVG
function SimFieldVisualization({ base64 }: { base64?: string }) {
  if (base64) {
    return (
      <Image
        src={`data:image/png;base64,${base64}`}
        alt="仿真结果"
        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        preview={false}
      />
    )
  }
  return (
    <div className="rounded-lg overflow-hidden border mt-4" style={{ borderColor: 'var(--surface-700)', display: 'inline-block' }}>
      <svg viewBox="0 0 400 300" width="400" height="300" style={{ backgroundColor: '#0B0F19' }}>
        <defs>
          <linearGradient id="fieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="50%" stopColor="#1E1B4B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#fieldGrad)" />
        {/* Draw mock field lines */}
        {[...Array(20)].map((_, i) => (
          <path key={i} d={`M 150 150 Q 200 ${i * 15} 250 150`} stroke="#00C2FF" strokeWidth="1" fill="none" opacity="0.6" />
        ))}
        {[...Array(20)].map((_, i) => (
          <path key={`b${i}`} d={`M 150 150 Q 100 ${i * 15} 50 150`} stroke="#00C2FF" strokeWidth="1" fill="none" opacity="0.6" />
        ))}
        {[...Array(20)].map((_, i) => (
          <path key={`c${i}`} d={`M 250 150 Q 300 ${i * 15} 350 150`} stroke="#00C2FF" strokeWidth="1" fill="none" opacity="0.6" />
        ))}
        <circle cx="150" cy="150" r="4" fill="#EF4444" />
        <circle cx="250" cy="150" r="4" fill="#EF4444" />
        <text x="200" y="22" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="11">
          Electric Field Lines: Dipole
        </text>
      </svg>
    </div>
  )
}

export default function Workspace() {
  const isMobile = useMobile()
  const [activeSim, setActiveSim] = useState('python')
  const [running, setRunning] = useState(false)
  const [showResult, setShowResult] = useState(true)
  const [modifyCodeOpen, setModifyCodeOpen] = useState(true)

  if (isMobile) {
    return (
      <div className="p-4 flex items-center justify-center h-full" style={{ backgroundColor: 'var(--surface-950)' }}>
        <Text style={{ color: 'var(--text-muted)' }}>移动端暂不支持高级仿真工作台，请使用桌面端。</Text>
      </div>
    )
  }

  return (
    <div className="h-full flex text-sm" style={{ backgroundColor: '#0D0E15', color: 'rgba(255,255,255,0.85)' }}>
      {/* Simulation Types Sub-sidebar */}
      <div
        className="w-64 flex-shrink-0 border-r flex flex-col"
        style={{ borderColor: '#1E1F2E', backgroundColor: '#13141F' }}
      >
        <div className="p-5">
          <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, display: 'block', marginBottom: 16 }}>仿真类型</Text>
          <div className="space-y-2">
            {[
              { id: 'python', label: 'Python 代码', desc: '自定义 Python 仿真代码', icon: <CodeOutlined /> },
              { id: 'laplace', label: 'Laplace 2D', desc: '二维拉普拉斯方程数值解', icon: <ThunderboltOutlined /> },
              { id: 'point_charge', label: '点电荷场', desc: '点电荷系统电场分布', icon: <AppstoreOutlined /> },
            ].map(item => {
              const isActive = activeSim === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveSim(item.id)}
                  className="rounded-xl p-3 cursor-pointer transition-colors flex items-start gap-3"
                  style={{
                    backgroundColor: isActive ? 'rgba(76, 29, 149, 0.4)' : 'transparent',
                    border: isActive ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid transparent',
                  }}
                >
                  <div style={{ color: isActive ? '#C4B5FD' : 'rgba(255,255,255,0.45)', marginTop: 2, fontSize: 16 }}>
                    {item.icon}
                  </div>
                  <div>
                    <Text strong style={{ color: isActive ? '#E2E8F0' : 'rgba(255,255,255,0.65)', display: 'block' }}>{item.label}</Text>
                    <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{item.desc}</Text>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between px-8 py-5 border-b"
          style={{ borderColor: '#1E1F2E' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(139, 92, 246, 0.15)' }}>
              <AppstoreOutlined style={{ color: '#A78BFA', fontSize: 20 }} />
            </div>
            <div>
              <Title level={4} style={{ color: '#F8FAFC', margin: 0, fontWeight: 500 }}>电磁场仿真</Title>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>支持自定义 Python 代码与预设仿真</Text>
            </div>
          </div>
          <Space size="middle">
            <Button
              type="primary"
              icon={<PlayCircleOutlined />}
              size="large"
              onClick={() => {
                setRunning(true);
                setShowResult(false);
                setTimeout(() => {
                  setRunning(false);
                  setShowResult(true);
                }, 2000);
              }}
              loading={running}
              style={{
                background: 'linear-gradient(90deg, #8B5CF6, #6D28D9)',
                border: 'none',
                padding: '0 24px',
                borderRadius: 8,
                boxShadow: '0 4px 14px 0 rgba(139, 92, 246, 0.39)'
              }}
            >
              运行
            </Button>
            <Button
              icon={<MessageOutlined />}
              size="large"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderColor: 'rgba(255,255,255,0.1)',
                color: '#E2E8F0',
                borderRadius: 8,
              }}
            >
              AI 问答
            </Button>
          </Space>
        </div>

        {/* Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">

          {/* Code Editor block */}
          <div className="rounded-xl overflow-hidden relative" style={{ backgroundColor: '#13141F', border: '1px solid #1E1F2E' }}>
            {/* Header of code block */}
            <div className="flex justify-end p-3 border-b border-[#1E1F2E]">
              <div className="px-3 py-1.5 rounded-md bg-[#6D28D9] text-white text-xs flex items-center gap-1.5 font-medium cursor-pointer hover:bg-[#7C3AED] transition-colors">
                <Sparkles size={14} /> AI 助手
              </div>
            </div>

            {/* Fake Code Lines */}
            <div className="p-4 font-mono text-sm leading-relaxed overflow-x-auto" style={{ color: '#E2E8F0' }}>
              <table className="w-full">
                <tbody>
                  {[
                    '# 电磁场仿真示例代码',
                    '# 预置模块 (无需 import): np (numpy), plt (matplotlib.pyplot), math',
                    '',
                    '# 创建电场可视化',
                    'x = np.linspace(-2, 2, 20)',
                    'y = np.linspace(-2, 2, 20)',
                    'X, Y = np.meshgrid(x, y)',
                    '',
                    '# 点电荷位置',
                    'q1_pos = (-1, 0)',
                    'q2_pos = (1, 0)',
                    '',
                    '# 计算电场 (简化模型)',
                    'def electric_field(qx, qy, X, Y, q=1):',
                    '    dx = X - qx',
                    '    dy = Y - qy'
                  ].map((line, idx) => {
                    let coloredLine = line;
                    if (line.startsWith('#')) {
                      coloredLine = `<span style="color: #4ADE80">${line}</span>`;
                    } else if (line.includes('def ')) {
                      coloredLine = `<span style="color: #60A5FA">def</span> ${line.replace('def ', '').replace('electric_field', '<span style="color:#A78BFA">electric_field</span>')}`;
                    } else if (line.includes('np.')) {
                      coloredLine = line.replace(/np\./g, '<span style="color:#FCD34D">np.</span>');
                    }

                    return (
                      <tr key={idx}>
                        <td className="w-10 select-none text-right pr-4 align-top" style={{ color: 'rgba(255,255,255,0.3)' }}>{idx + 1}</td>
                        <td className="whitespace-pre align-top" dangerouslySetInnerHTML={{ __html: coloredLine }} />
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Floating AI Input relative to code block */}
            {modifyCodeOpen && (
              <div
                className="absolute left-[8%] bottom-6 z-10 flex items-center gap-3 p-2 rounded-xl"
                style={{
                  backgroundColor: '#0D0E15',
                  border: '1px solid #8B5CF6',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.5) inset',
                  width: '84%',
                }}
              >
                <Input
                  value="非对称情况下的点电荷场"
                  bordered={false}
                  style={{ color: '#F8FAFC', fontSize: 14 }}
                  className="flex-1 px-3 font-mono"
                />
                <Button
                  type="primary"
                  icon={<Sparkles size={14} />}
                  style={{ backgroundColor: '#8B5CF6', border: 'none', fontWeight: 500, borderRadius: 6 }}
                  onClick={() => {
                    setRunning(true);
                    setModifyCodeOpen(false);
                    setTimeout(() => setRunning(false), 1500);
                  }}
                >
                  修改代码
                </Button>
                <Button
                  type="text"
                  style={{ color: 'rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 6 }}
                  onClick={() => setModifyCodeOpen(false)}
                >
                  取消
                </Button>
              </div>
            )}
          </div>

          {/* Output Area */}
          <div className="mt-8 mb-4 flex items-center">
            <Text style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace', fontSize: 13 }}>&gt;_ 输出</Text>
          </div>

          {showResult ? (
            <div className="space-y-4">
              <Text style={{ color: '#10B981', display: 'block', fontSize: 14 }}>仿真完成！电场方向已可视化。</Text>
              <SimFieldVisualization />
            </div>
          ) : (
            <div className="space-y-4">
              {running ? (
                <Text style={{ color: 'rgba(255,255,255,0.4)', display: 'block', fontSize: 14 }}>正在运行...</Text>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
