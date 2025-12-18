/**
 * WeChat Work (企业微信) authentication utilities
 */

import { apiFetch, ApiError } from './client'

// WeChat Work configuration from backend
interface WecomConfig {
    corp_id: string
    agent_id: string
    timestamp: number
    noncestr: string
    signature: string
}

// WeChat Work login response
interface WecomLoginResponse {
    access_token: string
    token_type: string
    expires_in: number
    user_id: string
    name: string
}

// Check if running inside WeChat Work
export function isInWecom(): boolean {
    const ua = navigator.userAgent.toLowerCase()
    return ua.includes('wxwork') || ua.includes('micromessenger')
}

// Get OAuth authorization URL
export async function getOAuthURL(redirectUri: string): Promise<string> {
    const resp = await apiFetch<{ url: string }>(
        `/auth/wecom/oauth-url?redirect_uri=${encodeURIComponent(redirectUri)}`
    )
    return resp.url
}

// Redirect to WeChat Work OAuth
export async function redirectToWecomAuth(redirectUri?: string): Promise<void> {
    const uri = redirectUri || window.location.href.split('?')[0]
    const url = await getOAuthURL(uri)
    window.location.href = url
}

// Get OAuth code from URL after redirect
export function getAuthCodeFromUrl(): string | null {
    const params = new URLSearchParams(window.location.search)
    return params.get('code')
}

// Exchange OAuth code for access token
export async function loginWithWecom(code: string): Promise<WecomLoginResponse> {
    return apiFetch<WecomLoginResponse>('/auth/wecom', {
        method: 'POST',
        body: JSON.stringify({ code }),
    })
}

// Get JS-SDK configuration for current page
export async function getJSConfig(url?: string): Promise<WecomConfig> {
    const currentUrl = url || window.location.href.split('#')[0]
    return apiFetch<WecomConfig>('/auth/wecom/jsconfig', {
        method: 'POST',
        body: JSON.stringify({ url: currentUrl }),
    })
}

// Initialize WeChat Work JS-SDK (requires @wecom/jssdk)
export async function initWecomSDK(): Promise<void> {
    // Check if SDK is available
    if (typeof (window as any).ww === 'undefined') {
        console.warn('WeChat Work JS-SDK not loaded')
        return
    }

    try {
        const config = await getJSConfig()
        const ww = (window as any).ww

        await new Promise<void>((resolve, reject) => {
            ww.register({
                corpId: config.corp_id,
                agentId: config.agent_id,
                jsApiList: ['getContext', 'selectExternalContact'],
                getConfigSignature: () => ({
                    timestamp: config.timestamp,
                    nonceStr: config.noncestr,
                    signature: config.signature,
                }),
                onConfigSuccess: () => resolve(),
                onConfigFail: (err: any) => reject(err),
            })
        })
        console.log('WeChat Work JS-SDK initialized')
    } catch (error) {
        console.error('Failed to initialize WeChat Work JS-SDK:', error)
    }
}

// Auto-login flow for WeChat Work
export async function autoLoginWecom(): Promise<WecomLoginResponse | null> {
    // Only run in WeChat Work environment
    if (!isInWecom()) {
        return null
    }

    // Check for OAuth code in URL
    const code = getAuthCodeFromUrl()
    if (code) {
        try {
            // Clear code from URL
            const url = new URL(window.location.href)
            url.searchParams.delete('code')
            url.searchParams.delete('state')
            window.history.replaceState({}, '', url.toString())

            // Exchange code for token
            return await loginWithWecom(code)
        } catch (error) {
            if (error instanceof ApiError && error.status === 502) {
                // Code expired or invalid, redirect to OAuth again
                await redirectToWecomAuth()
            }
            throw error
        }
    }

    return null
}
