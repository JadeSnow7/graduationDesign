import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AISource } from '../types/ai'
import { authApi } from '../api/endpoints/auth'

export type LocalModelStatus =
  | 'not_downloaded'
  | 'downloading'
  | 'ready'
  | 'error'

export interface AIConfig {
  apiKey: string
  defaultMode: AISource
  localModelPath: string
  localModelStatus: LocalModelStatus
  downloadProgress: number
  serverUrl: string
  provider: 'openai' | 'anthropic' | 'custom'
  customBaseUrl: string
  localPort: number
}

interface AIConfigState extends AIConfig {
  setApiKey: (key: string) => void
  setDefaultMode: (mode: AISource) => void
  setLocalModelPath: (path: string) => void
  setLocalModelStatus: (status: LocalModelStatus) => void
  setDownloadProgress: (progress: number) => void
  setServerUrl: (url: string) => void
  setProvider: (provider: AIConfig['provider']) => void
  setCustomBaseUrl: (url: string) => void
  setLocalPort: (port: number) => void
  syncToBackend: () => Promise<void>
  resolveEndpoint: () => 'local' | 'server'
}

export const useAIConfigStore = create<AIConfigState>()(
  persist(
    (set, get) => ({
      apiKey: '',
      defaultMode: 'auto',
      localModelPath: '',
      localModelStatus: 'not_downloaded',
      downloadProgress: 0,
      serverUrl: 'http://localhost:8080',
      provider: 'openai',
      customBaseUrl: '',
      localPort: 8888,

      setApiKey: (apiKey) => set({ apiKey }),
      setDefaultMode: (defaultMode) => set({ defaultMode }),
      setLocalModelPath: (localModelPath) => set({ localModelPath }),
      setLocalModelStatus: (localModelStatus) => set({ localModelStatus }),
      setDownloadProgress: (downloadProgress) => set({ downloadProgress }),
      setServerUrl: (serverUrl) => set({ serverUrl }),
      setProvider: (provider) => set({ provider }),
      setCustomBaseUrl: (customBaseUrl) => set({ customBaseUrl }),
      setLocalPort: (localPort) => set({ localPort }),

      syncToBackend: async () => {
        const state = get()
        try {
          await authApi.patchAIConfig({
            api_key: state.apiKey || undefined,
            default_mode: state.defaultMode,
            server_url: state.serverUrl,
            provider: state.provider,
            custom_base_url: state.customBaseUrl || undefined,
          })
        } catch (err) {
          console.warn('Failed to sync AI config to backend:', err)
        }
      },

      resolveEndpoint: () => {
        const { defaultMode, localModelStatus } = get()
        if (defaultMode === 'local') {
          return localModelStatus === 'ready' ? 'local' : 'server'
        }
        if (defaultMode === 'server') return 'server'
        // auto: local preferred
        return localModelStatus === 'ready' ? 'local' : 'server'
      },
    }),
    {
      name: 'ai-config-store',
      partialize: (state) => ({
        apiKey: state.apiKey,
        defaultMode: state.defaultMode,
        localModelPath: state.localModelPath,
        localModelStatus: state.localModelStatus,
        serverUrl: state.serverUrl,
        provider: state.provider,
        customBaseUrl: state.customBaseUrl,
        localPort: state.localPort,
      }),
    }
  )
)
