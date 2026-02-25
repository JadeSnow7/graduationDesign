import { Card, List, Tag, Typography, Statistic, Input, Badge } from 'antd'
import { FireOutlined, PlusOutlined, FileTextOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useMobile } from '../../hooks/useMobile'

const { Title, Text } = Typography

const weeks = 52
const days = 7
const heatmapData = Array.from({ length: weeks }, () =>
  Array.from({ length: days }, () => Math.floor(Math.random() * 5))
)

const getHeatmapColor = (value: number) => {
  if (value === 0) return 'var(--surface-700)'
  if (value === 1) return '#1e3a5f'
  if (value === 2) return '#1e3a8a'
  if (value === 3) return '#2563eb'
  return '#60a5fa'
}

const folders = [
  { name: '电磁学笔记', fileCount: 24 },
  { name: '实验报告', fileCount: 8 },
  { name: '参考文献', fileCount: 15 },
]

const assignments = [
  { name: '电磁场仿真实验报告', course: '电磁场与电磁波', dueDate: '明天 23:59', isOverdue: false, isUrgent: true },
  { name: 'Maxwell方程推导', course: '电磁场与电磁波', dueDate: '3天后', isOverdue: false, isUrgent: false },
  { name: '波导理论作业', course: '微波技术', dueDate: '2天前', isOverdue: true, isUrgent: false },
]

const radarAxes = ['逻辑性', '创造力', '深度', '表达清晰度', '引用规范', '原创性']

export default function Learning() {
  const isMobile = useMobile()

  if (isMobile) {
    return (
      <div className="p-4 space-y-4">
        {/* Weekly bar chart */}
        <Card styles={{ body: { padding: 16 } }}>
          <div className="flex items-center justify-between mb-4">
            <Text strong style={{ color: 'var(--text-light)' }}>本周学习时长</Text>
            <Tag color="blue">本周 18.5h ↑12%</Tag>
          </div>
          <div className="flex items-end justify-between gap-2 h-28">
            {['一', '二', '三', '四', '五', '六', '日'].map((day, i) => {
              const hours = [2.5, 3.2, 2.8, 4.1, 3.5, 1.8, 0.6][i]
              const isToday = i === 3
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${(hours / 5) * 100}%`,
                      backgroundColor: isToday
                        ? 'var(--primary-500)'
                        : i < 4
                        ? 'var(--primary-300)'
                        : 'var(--surface-100)',
                    }}
                  />
                  <Text style={{ color: 'var(--text-muted)', fontSize: 11 }}>{day}</Text>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Knowledge base */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <Text strong style={{ color: 'var(--text-light)' }}>我的知识库</Text>
            <Text style={{ color: 'var(--primary-500)', fontSize: 13 }}>查看全部</Text>
          </div>
          <div
            className="flex gap-3 overflow-x-auto pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {folders.map((folder, i) => (
              <Card
                key={i}
                hoverable
                size="small"
                className="flex-shrink-0 w-32"
                styles={{ body: { padding: 12 } }}
              >
                <div className="w-10 h-10 rounded-lg mb-2 flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                  <FileTextOutlined style={{ color: 'white', fontSize: 18 }} />
                </div>
                <Text strong style={{ color: 'var(--text-light)', fontSize: 13, display: 'block' }}>
                  {folder.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {folder.fileCount} 个文件
                </Text>
              </Card>
            ))}
            <Card
              hoverable
              size="small"
              className="flex-shrink-0 w-32"
              styles={{ body: { padding: 12 } }}
              style={{ border: '2px dashed var(--surface-100)' }}
            >
              <div className="flex flex-col items-center justify-center gap-2 h-full py-4">
                <PlusOutlined style={{ fontSize: 20, color: 'var(--text-muted)' }} />
                <Text type="secondary" style={{ fontSize: 11, textAlign: 'center' }}>
                  新建知识库
                </Text>
              </div>
            </Card>
          </div>
        </div>

        {/* AI writing analysis */}
        <Card
          styles={{ body: { padding: 16 } }}
          title={
            <span style={{ color: 'var(--text-light)' }}>
              ✨ AI 写作风格分析
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-4">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {[20, 40, 60, 80].map((r) => (
                <circle key={r} cx="50" cy="50" r={r / 2} fill="none" stroke="var(--surface-100)" strokeWidth="0.5" />
              ))}
              {radarAxes.map((_, i) => {
                const angle = (i * 60 - 90) * (Math.PI / 180)
                return (
                  <line
                    key={i}
                    x1="50" y1="50"
                    x2={50 + 40 * Math.cos(angle)}
                    y2={50 + 40 * Math.sin(angle)}
                    stroke="var(--surface-100)"
                    strokeWidth="0.5"
                  />
                )
              })}
              <polygon
                points="50,18 70,35 65,60 35,60 30,35"
                fill="rgba(37,99,235,0.4)"
                stroke="var(--primary-500)"
                strokeWidth="1.5"
              />
            </svg>
            <div className="flex flex-col justify-center">
              <Text style={{ color: 'var(--text-light)', lineHeight: 1.6, fontSize: 13 }}>
                逻辑性和深度表现突出，建议加强创造性表达和引用规范性。
              </Text>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // Desktop
  return (
    <div className="p-8" style={{ backgroundColor: 'var(--surface-950)', minHeight: '100%' }}>
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Heatmap */}
        <Card
          style={{
            backgroundColor: 'var(--surface-800)',
            border: '1px solid var(--surface-700)',
          }}
          styles={{ body: { padding: 24 } }}
        >
          <div className="flex items-center justify-between mb-4">
            <Title level={4} style={{ color: 'var(--text-dark)', margin: 0 }}>
              Learning Activity
            </Title>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
              style={{ backgroundColor: 'var(--surface-950)' }}
            >
              <FireOutlined style={{ color: 'var(--semantic-warning)' }} />
              <Text style={{ color: 'var(--text-dark)' }}>连续 12 天</Text>
            </div>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-2">
            {heatmapData.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((value, di) => (
                  <div
                    key={di}
                    className="w-3.5 h-3.5 rounded-sm"
                    style={{ backgroundColor: getHeatmapColor(value) }}
                    title={`${value}h`}
                  />
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Middle row */}
        <div className="grid grid-cols-3 gap-6">
          {/* Knowledge base */}
          <Card
            className="col-span-2"
            style={{
              backgroundColor: 'var(--surface-800)',
              border: '1px solid var(--surface-700)',
            }}
            title={
              <Title level={4} style={{ color: 'var(--text-dark)', margin: 0 }}>
                Knowledge Base
              </Title>
            }
            extra={
              <Input
                prefix={<span style={{ color: 'var(--text-muted)' }}>🔍</span>}
                placeholder="搜索..."
                style={{
                  backgroundColor: 'var(--surface-700)',
                  color: 'var(--text-dark)',
                  border: 'none',
                  width: 180,
                }}
              />
            }
          >
            <div className="grid grid-cols-4 gap-4">
              {folders.map((folder, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl cursor-pointer transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--surface-700)' }}
                >
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
                    <FileTextOutlined style={{ color: 'white', fontSize: 20 }} />
                  </div>
                  <Text strong style={{ color: 'var(--text-dark)', display: 'block', marginBottom: 4 }}>
                    {folder.name}
                  </Text>
                  <Text type="secondary" style={{ fontSize: 13 }}>
                    {folder.fileCount} 个文件
                  </Text>
                </div>
              ))}
              <div
                className="p-4 rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2"
                style={{ border: '2px dashed var(--surface-700)' }}
              >
                <PlusOutlined style={{ fontSize: 24, color: 'var(--text-muted)' }} />
                <Text type="secondary" style={{ fontSize: 13 }}>新建知识库</Text>
              </div>
            </div>
          </Card>

          {/* Pending assignments */}
          <Card
            style={{
              backgroundColor: 'var(--surface-800)',
              border: '1px solid var(--surface-700)',
            }}
            title={
              <Title level={4} style={{ color: 'var(--text-dark)', margin: 0 }}>
                Pending Assignments
              </Title>
            }
          >
            <List
              dataSource={assignments}
              renderItem={(item) => (
                <List.Item
                  style={{
                    borderLeft: item.isOverdue ? '3px solid var(--semantic-error)' : 'none',
                    paddingLeft: item.isOverdue ? 8 : 0,
                    marginBottom: 8,
                    border: 'none',
                    padding: '8px 0',
                  }}
                >
                  <div className="w-full">
                    <Text strong style={{ color: 'var(--text-dark)', display: 'block', marginBottom: 4 }}>
                      {item.name}
                    </Text>
                    <Tag color="blue" style={{ marginBottom: 4 }}>
                      {item.course}
                    </Tag>
                    <br />
                    <Text
                      style={{
                        color: item.isUrgent ? 'var(--semantic-warning)' : 'var(--text-muted)',
                        fontSize: 12,
                      }}
                    >
                      <ClockCircleOutlined className="mr-1" />
                      {item.dueDate}
                    </Text>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </div>

        {/* AI Analysis */}
        <Card
          style={{
            backgroundColor: 'var(--surface-800)',
            border: '1px solid var(--surface-700)',
          }}
          title={
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: 'var(--ai-light)' }}
              >
                ✨
              </div>
              <Title level={4} style={{ color: 'var(--text-dark)', margin: 0 }}>
                AI 写作风格分析
              </Title>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-8">
            <div className="flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-72 h-72">
                <defs>
                  <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--primary-500)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="var(--primary-700)" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                {[20, 40, 60, 80].map((r) => (
                  <circle key={r} cx="100" cy="100" r={r} fill="none" stroke="var(--surface-700)" strokeWidth="1" />
                ))}
                {radarAxes.map((label, i) => {
                  const angle = (i * 60 - 90) * (Math.PI / 180)
                  const x = 100 + 80 * Math.cos(angle)
                  const y = 100 + 80 * Math.sin(angle)
                  const lx = 100 + 95 * Math.cos(angle)
                  const ly = 100 + 95 * Math.sin(angle)
                  return (
                    <g key={i}>
                      <line x1="100" y1="100" x2={x} y2={y} stroke="var(--surface-700)" strokeWidth="1" />
                      <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill="var(--text-muted)">
                        {label}
                      </text>
                    </g>
                  )
                })}
                <polygon
                  points="100,36 140,70 130,120 70,120 60,70"
                  fill="url(#radarGrad)"
                  stroke="var(--primary-500)"
                  strokeWidth="2"
                />
              </svg>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <Text style={{ color: 'var(--text-dark)', lineHeight: 1.8 }}>
                分析显示，您的写作在逻辑性和深度方面表现优异，能够系统性地展开论述。创造力和原创性方面有较大提升空间，建议尝试更多独特视角。
              </Text>
              <Text style={{ color: 'var(--text-dark)', lineHeight: 1.8 }}>
                表达清晰度保持良好水平，但引用规范需要加强，建议参考学术写作规范。
              </Text>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <Statistic
                  title={<span style={{ color: 'var(--text-muted)' }}>逻辑性</span>}
                  value={88}
                  suffix="%"
                  valueStyle={{ color: 'var(--primary-300)' }}
                />
                <Statistic
                  title={<span style={{ color: 'var(--text-muted)' }}>深度</span>}
                  value={82}
                  suffix="%"
                  valueStyle={{ color: 'var(--primary-300)' }}
                />
                <Statistic
                  title={<span style={{ color: 'var(--text-muted)' }}>创造力</span>}
                  value={61}
                  suffix="%"
                  valueStyle={{ color: 'var(--semantic-warning)' }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
