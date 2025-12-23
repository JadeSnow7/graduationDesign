import { defineStore } from 'pinia'

import { apiFetch } from '@/api/client'
import { isInWecom, autoLoginWecom } from '@/api/wecom'

type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
  user_id?: string
  name?: string
}

export type Me = {
  id: number
  username: string
  role: string
  name?: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    me: null as Me | null,
    loading: false,
    error: '',
    isWecom: isInWecom(),
  }),
  actions: {
    async login(username: string, password: string) {
      this.loading = true
      this.error = ''
      try {
        const resp = await apiFetch<LoginResponse>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ username, password }),
        })
        this.token = resp.access_token
        localStorage.setItem('token', this.token)
        await this.loadMe()
      } catch (e: any) {
        this.error = e?.message || '登录失败'
        this.token = ''
        localStorage.removeItem('token')
        this.me = null
        throw e
      } finally {
        this.loading = false
      }
    },

    // WeChat Work login using OAuth code
    async loginWithWecom(code: string) {
      this.loading = true
      this.error = ''
      try {
        const resp = await apiFetch<LoginResponse>('/auth/wecom', {
          method: 'POST',
          body: JSON.stringify({ code }),
        })
        this.token = resp.access_token
        localStorage.setItem('token', this.token)
        await this.loadMe()
      } catch (e: any) {
        this.error = e?.message || '企业微信登录失败'
        this.token = ''
        localStorage.removeItem('token')
        this.me = null
        throw e
      } finally {
        this.loading = false
      }
    },

    // Auto-login for WeChat Work environment
    async tryWecomAutoLogin(): Promise<boolean> {
      if (!this.isWecom) return false
      if (this.token) return true // Already logged in

      try {
        const result = await autoLoginWecom()
        if (result) {
          this.token = result.access_token
          localStorage.setItem('token', this.token)
          await this.loadMe()
          return true
        }
      } catch (e: any) {
        console.error('WeChat Work auto-login failed:', e)
      }
      return false
    },

    async loadMe() {
      if (!this.token) return
      this.me = await apiFetch<Me>('/auth/me', { token: this.token })
    },

    logout() {
      this.token = ''
      localStorage.removeItem('token')
      this.me = null
    },
  },
})
