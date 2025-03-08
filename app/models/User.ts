export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserWithTokens extends User {
  tokens: {
    outlook?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
    google?: {
      accessToken: string;
      refreshToken: string;
      expiresAt: number;
    };
  };
}

export type TokenProvider = 'outlook' | 'google';

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}