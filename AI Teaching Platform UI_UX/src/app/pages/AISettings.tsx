import { useState, useEffect } from 'react'
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Radio,
  Typography,
  Space,
  Divider,
  Alert,
  Progress,
  Tag,
  message,
} from 'antd'
import {
  ApiOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  DeleteOutlined,
  SyncOutlined,
} from '@ant-design/icons'
import { useAIConfigStore } from '../../stores/aiConfigStore'
import { usePlatform } from '../../hooks/usePlatform'
import { useMobile } from '../../hooks/useMobile'
import { useTheme } from '../ThemeProvider'

const { Title, Text } = Typography

export default function AISettings() {
  const [form] = Form.useForm()
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [testLoading, setTestLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const { isWeb } = usePlatform()
  const isMobile = useMobile()
  const store = useAIConfigStore()
  const { mode, setMode, primaryColor, setPrimaryColor } = useTheme()

  useEffect(() => {
    form.setFieldsValue({
      defaultMode: store.defaultMode,
      apiKey: store.apiKey,
      provider: store.provider,
      customBaseUrl: store.customBaseUrl,
      serverUrl: store.serverUrl,
    })
  }, [form, store.defaultMode, store.apiKey, store.provider, store.customBaseUrl, store.serverUrl])

  const handleTestConnection = async () => {
    const key = form.getFieldValue('apiKey')
    if (!key) {
      message.warning('请先填写 API Key')
      return
    }
    setTestLoading(true)
    try {
      // Simple connectivity test via model list endpoint
      const provider = form.getFieldValue('provider')
      const baseUrl =
        provider === 'custom'
          ? form.getFieldValue('customBaseUrl')
          : provider === 'openai'
            ? 'https://api.openai.com'
            : form.getFieldValue('serverUrl')
      const resp = await fetch(`${baseUrl}/v1/models`, {
        headers: { Authorization: `Bearer ${key}` },
      })
      if (resp.ok) {
        message.success('连接成功')
      } else {
        message.error(`连接失败: ${resp.status}`)
      }
    } catch {
      message.error('连接失败，请检查 API Key 和网络')
    } finally {
      setTestLoading(false)
    }
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    setSaving(true)
    try {
      store.setDefaultMode(values.defaultMode)
      store.setApiKey(values.apiKey ?? '')
      store.setProvider(values.provider)
      store.setCustomBaseUrl(values.customBaseUrl ?? '')
      store.setServerUrl(values.serverUrl ?? 'http://localhost:8080')
      await store.syncToBackend()
      message.success('配置已保存并同步到账户')
    } catch {
      message.error('同步到后端失败，配置已本地保存')
    } finally {
      setSaving(false)
    }
  }

  const modelStatusColor: Record<string, string> = {
    not_downloaded: 'default',
    downloading: 'processing',
    ready: 'success',
    error: 'error',
  }
  const modelStatusLabel: Record<string, string> = {
    not_downloaded: '未下载',
    downloading: '下载中',
    ready: '已就绪',
    error: '错误',
  }

  return (
    <div
      className="p-6 max-w-3xl mx-auto"
      style={{ color: isMobile ? 'var(--text-light)' : 'var(--text-dark)' }}
    >
      <div className="mb-6 flex items-center gap-3">
        <ApiOutlined style={{ fontSize: 24, color: 'var(--primary-500)' }} />
        <Title level={3} style={{ margin: 0 }}>
          AI 接入配置
        </Title>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        initialValues={{
          defaultMode: 'auto',
          provider: 'openai',
          serverUrl: 'http://localhost:8080',
        }}
      >
        {/* Theme Preferences */}
        <Card
          title="外观与色彩"
          className="mb-4"
          styles={{ header: { borderBottom: '1px solid var(--surface-700)' } }}
        >
          <Form.Item label="主题配色模式">
            <Radio.Group
              value={mode}
              onChange={e => setMode(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="system">跟随系统端</Radio.Button>
              <Radio.Button value="desktop">桌面端预设 (蓝色)</Radio.Button>
              <Radio.Button value="mobile">移动端预设 (紫色)</Radio.Button>
              <Radio.Button value="custom">自定义色彩</Radio.Button>
            </Radio.Group>
          </Form.Item>
          {mode === 'custom' && (
            <Form.Item label="自定义主色调">
              <Input
                type="color"
                value={primaryColor}
                onChange={e => setPrimaryColor(e.target.value)}
                style={{ width: 100, padding: 0, height: 40, border: 'none', background: 'transparent' }}
              />
            </Form.Item>
          )}
        </Card>

        {/* Default Mode */}
        <Card
          title="默认推理模式"
          className="mb-4"
          styles={{ header: { borderBottom: '1px solid var(--surface-700)' } }}
        >
          <Form.Item name="defaultMode" noStyle>
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="auto">智能路由（本地优先）</Radio.Button>
              <Radio.Button value="local">仅本地</Radio.Button>
              <Radio.Button value="server">仅服务端</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Text type="secondary" className="block mt-2 text-sm">
            智能路由：本地模型就绪时优先使用，否则自动切换到服务端
          </Text>
        </Card>

        {/* API Key */}
        <Card title="自定义 API Key" className="mb-4">
          <Space.Compact className="w-full mb-3">
            <Form.Item name="provider" noStyle>
              <Select style={{ width: 140 }}>
                <Select.Option value="openai">OpenAI</Select.Option>
                <Select.Option value="anthropic">Anthropic</Select.Option>
                <Select.Option value="custom">自定义</Select.Option>
              </Select>
            </Form.Item>
          </Space.Compact>

          <Form.Item
            name="apiKey"
            label="API Key"
            extra="Key 将加密存储在服务端，不会明文传输"
          >
            <Input.Password
              placeholder="sk-..."
              visibilityToggle={{
                visible: apiKeyVisible,
                onVisibleChange: setApiKeyVisible,
              }}
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, cur) => prev.provider !== cur.provider}
          >
            {({ getFieldValue }) =>
              getFieldValue('provider') === 'custom' ? (
                <Form.Item
                  name="customBaseUrl"
                  label="自定义 Base URL"
                  rules={[{ type: 'url', message: '请输入有效的 URL' }]}
                >
                  <Input placeholder="https://your-api.example.com" />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Button
            icon={<CheckCircleOutlined />}
            loading={testLoading}
            onClick={handleTestConnection}
          >
            测试连接
          </Button>
        </Card>

        {/* Local Model */}
        <Card title="本地模型管理" className="mb-4">
          {isWeb ? (
            <Alert
              message="本地 AI 仅在桌面客户端（Tauri）中可用"
              description="请下载 EduCloud 桌面应用以使用本地离线 AI 功能"
              type="info"
              showIcon
            />
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Text strong>Qwen2.5-1.5B-GGUF-INT4</Text>
                  <br />
                  <Text type="secondary" className="text-sm">
                    1.2 GB · CoreML/DirectML 加速
                  </Text>
                </div>
                <Space>
                  <Tag color={modelStatusColor[store.localModelStatus]}>
                    {modelStatusLabel[store.localModelStatus]}
                  </Tag>
                  {store.localModelStatus === 'ready' && (
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => store.setLocalModelStatus('not_downloaded')}
                    >
                      删除
                    </Button>
                  )}
                  {store.localModelStatus === 'not_downloaded' && (
                    <Button
                      size="small"
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => {
                        store.setLocalModelStatus('downloading')
                        store.setDownloadProgress(0)
                      }}
                    >
                      下载
                    </Button>
                  )}
                </Space>
              </div>

              {store.localModelStatus === 'downloading' && (
                <Progress
                  percent={store.downloadProgress}
                  status="active"
                  className="mb-3"
                />
              )}

              <Divider />
              <Form.Item
                label="下载新模型（HuggingFace URL）"
                name="customModelUrl"
                extra="支持 GGUF INT4/INT8 格式"
              >
                <Space.Compact className="w-full">
                  <Input placeholder="https://huggingface.co/.../model.gguf" />
                  <Button type="primary" icon={<DownloadOutlined />}>
                    下载
                  </Button>
                </Space.Compact>
              </Form.Item>
            </>
          )}
        </Card>

        {/* Server URL */}
        <Card title="服务端 AI 地址" className="mb-6">
          <Form.Item
            name="serverUrl"
            label="后端服务地址"
            rules={[{ type: 'url', message: '请输入有效 URL' }]}
          >
            <Space.Compact className="w-full">
              <Input placeholder="http://localhost:8080" />
              <Button
                onClick={() =>
                  form.setFieldValue('serverUrl', 'http://localhost:8080')
                }
              >
                恢复默认
              </Button>
            </Space.Compact>
          </Form.Item>
        </Card>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={saving}
            icon={<SyncOutlined />}
            className="w-full"
          >
            保存并同步到账户
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
