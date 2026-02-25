import { Outlet, useLocation, useNavigate } from 'react-router'
import { Layout, Menu, Badge, Avatar, Typography } from 'antd'
import {
  BookOutlined,
  RocketOutlined,
  ExperimentOutlined,
  SettingOutlined,
  BellOutlined,
  ApiOutlined,
} from '@ant-design/icons'
import { Brain } from 'lucide-react'
import { useMobile } from '../hooks/useMobile'

const { Sider, Content, Header } = Layout
const { Text } = Typography

const navItems = [
  { key: '/', label: '学习', icon: <BookOutlined /> },
  { key: '/courses', label: '课程', icon: <RocketOutlined />, badge: 2 },
  { key: '/local-ai', label: 'Local AI', icon: <Brain size={16} />, isAI: true },
  { key: '/workspace', label: '工作台', icon: <ExperimentOutlined /> },
  { key: '/settings/ai', label: 'AI 配置', icon: <ApiOutlined /> },
]

export default function Root() {
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useMobile()

  const currentKey =
    navItems
      .slice()
      .reverse()
      .find((item) =>
        item.key === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.key)
      )?.key ?? '/'

  if (isMobile) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'var(--surface-50)' }}>
        {/* Mobile top bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-transparent">
          <div className="px-4 py-3 flex items-center justify-between">
            <Avatar
              size={36}
              style={{ background: 'linear-gradient(135deg, #60A5FA, #1D4ED8)' }}
            >
              E
            </Avatar>
            <Text strong style={{ color: 'var(--text-light)', fontSize: 18 }}>
              {navItems.find((i) => i.key === currentKey)?.label ?? '学习'}
            </Text>
            <div className="flex items-center gap-3">
              <Badge count={3} size="small">
                <button className="w-10 h-10 flex items-center justify-center">
                  <BellOutlined style={{ fontSize: 20, color: 'var(--text-light)' }} />
                </button>
              </Badge>
              <button
                className="w-10 h-10 flex items-center justify-center"
                onClick={() => navigate('/settings/ai')}
              >
                <SettingOutlined style={{ fontSize: 20, color: 'var(--text-light)' }} />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-16 pb-20">
          <Outlet />
        </div>

        {/* Mobile bottom tab bar */}
        <div
          className="fixed bottom-0 left-0 right-0 z-50 border-t"
          style={{
            backgroundColor: 'rgba(255,255,255,0.9)',
            backdropFilter: 'blur(20px)',
            borderColor: 'var(--surface-100)',
          }}
        >
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const active = item.key === currentKey
              const color = active
                ? item.isAI
                  ? 'var(--ai-purple)'
                  : 'var(--primary-500)'
                : 'var(--text-muted)'
              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.key)}
                  className="relative flex flex-col items-center justify-center min-w-[56px] py-1 px-2"
                >
                  <div className="relative" style={{ color }}>
                    {item.badge && !active ? (
                      <Badge count={item.badge} size="small">
                        {item.icon}
                      </Badge>
                    ) : (
                      item.icon
                    )}
                  </div>
                  <span className="text-[11px] mt-0.5" style={{ color }}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // Desktop layout
  const menuItems = navItems.map((item) => ({
    key: item.key,
    icon: item.badge ? (
      <Badge count={item.badge} size="small" offset={[4, 0]}>
        <span style={{ color: 'inherit' }}>{item.icon}</span>
      </Badge>
    ) : (
      item.icon
    ),
    label: item.label,
    style: item.isAI ? { color: 'var(--ai-purple)' } : undefined,
  }))

  return (
    <Layout hasSider style={{ height: '100vh', backgroundColor: 'var(--surface-950)' }}>
      <Sider
        width={224}
        theme="dark"
        style={{
          backgroundColor: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--surface-700)',
          position: 'relative',
        }}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex-shrink-0" />
          <Text strong style={{ color: 'var(--text-dark)', fontSize: 18 }}>
            EduCloud
          </Text>
        </div>

        {/* Navigation */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[currentKey]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ backgroundColor: 'transparent', border: 'none' }}
        />

        {/* Bottom section */}
        <div
          className="absolute bottom-0 left-0 right-0 p-4 space-y-3"
          style={{ borderTop: '1px solid var(--surface-700)' }}
        >
          <div
            className="px-3 py-2 rounded-lg flex items-center gap-2"
            style={{ backgroundColor: 'var(--surface-800)' }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--semantic-online)' }}
            />
            <Text style={{ color: 'var(--text-dark)', fontSize: 13 }}>已连接云端</Text>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex-1 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => navigate('/settings/ai')}
            >
              <SettingOutlined style={{ fontSize: 18, color: 'var(--text-muted)' }} />
            </button>
            <Badge count={3} size="small" offset={[-4, 4]}>
              <button className="flex-1 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors">
                <BellOutlined style={{ fontSize: 18, color: 'var(--text-muted)' }} />
              </button>
            </Badge>
          </div>
        </div>
      </Sider>

      <Layout style={{ backgroundColor: 'var(--surface-950)' }}>
        <Content style={{ overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
