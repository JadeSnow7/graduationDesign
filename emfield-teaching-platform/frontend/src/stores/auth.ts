import { defineStore } from 'pinia'

import { apiFetch } from '@/api/client'

type LoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
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

