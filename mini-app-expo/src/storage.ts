import AsyncStorage from '@react-native-async-storage/async-storage';

import { MAX_HISTORY } from './config';
import { AuthSession, ChatMessage } from './types';

const STORAGE_KEYS = {
  auth: 'mini_app.auth_session',
  messages: 'mini_app.chat_messages',
};

export async function saveAuthSession(session: AuthSession): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(session));
}

export async function loadAuthSession(): Promise<AuthSession | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.auth);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export async function clearAuthSession(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.auth);
}

export async function saveMessages(messages: ChatMessage[]): Promise<void> {
  const trimmed = messages.slice(-MAX_HISTORY);
  await AsyncStorage.setItem(STORAGE_KEYS.messages, JSON.stringify(trimmed));
}

export async function loadMessages(): Promise<ChatMessage[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.messages);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ChatMessage[];
  } catch {
    return [];
  }
}

export async function clearMessages(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.messages);
}

export async function clearAllStorage(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEYS.auth, STORAGE_KEYS.messages]);
}
