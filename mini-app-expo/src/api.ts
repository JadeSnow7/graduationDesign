import { API_BASE_URL, API_PREFIX, NETWORK_TIMEOUT_MS } from './config';
import { AuthSession, ChatMessage } from './types';

type ApiError = {
  code?: string;
  message?: string;
};

type ApiEnvelope<T> = {
  success?: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
};

function buildUrl(path: string): string {
  return `${API_BASE_URL}${API_PREFIX}${path}`;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { signal: externalSignal, ...rest } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS);
  let abortListener: (() => void) | null = null;

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort();
    } else {
      abortListener = () => controller.abort();
      externalSignal.addEventListener('abort', abortListener);
    }
  }

  try {
    const response = await fetch(buildUrl(path), {
      ...rest,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(rest.headers ?? {}),
      },
    });

    const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

    if (!response.ok) {
      const message = payload?.error?.message ?? payload?.message ?? `Request failed (${response.status})`;
      throw new Error(message);
    }

    if (!payload || payload.success !== true || payload.data === undefined) {
      const message = payload?.error?.message ?? payload?.message ?? 'Unexpected response';
      throw new Error(message);
    }

    return payload.data;
  } catch (error) {
    const isAbortError = error instanceof Error && error.name === 'AbortError';
    if (isAbortError) {
      if (externalSignal?.aborted) {
        throw new Error('Request canceled');
      }
      throw new Error('Request timed out');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
    if (externalSignal && abortListener) {
      externalSignal.removeEventListener('abort', abortListener);
    }
  }
}

type LoginResponse = {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  user_id?: string;
  username?: string;
  role?: string;
};

export async function login(username: string, password: string): Promise<AuthSession> {
  const data = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username,
      password,
    }),
  });

  return {
    token: data.access_token,
    tokenType: data.token_type ?? 'Bearer',
    expiresIn: data.expires_in,
    user: {
      id: data.user_id,
      username: data.username,
      role: data.role,
    },
  };
}

export async function chat(
  token: string,
  tokenType: string,
  messages: ChatMessage[],
  mode: string,
  signal?: AbortSignal
): Promise<string> {
  const data = await request<{ reply: string }>('/ai/chat', {
    method: 'POST',
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
    signal,
    body: JSON.stringify({
      mode,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      stream: false,
    }),
  });

  return data.reply;
}
