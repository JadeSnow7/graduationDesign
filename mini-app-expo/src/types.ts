export type ChatRole = 'user' | 'assistant';

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

export type UserInfo = {
  id?: string;
  username?: string;
  role?: string;
};

export type AuthSession = {
  token: string;
  tokenType: string;
  expiresIn?: number;
  user: UserInfo;
};
