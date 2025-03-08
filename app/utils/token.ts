import { createClient } from 'redis';
import { getUserTokens, updateUserTokens } from '../services/userService';
import { TokenData } from '../models/User';
import type { TokenProvider } from '../models/User';

// Store tokens for multiple providers
const tokens: Record<TokenProvider, { accessToken: string; refreshToken: string }> = {
  outlook: {
    accessToken: '',
    refreshToken: '',
  },
  google: {
    accessToken: '',
    refreshToken: '',
  },
};

const redis = await createClient().connect();

export const getAccessToken = async (userId: string, provider: TokenProvider = 'outlook'): Promise<string | null> => {
  try {
    const tokenData = await getUserTokens(userId, provider);
    return tokenData ? tokenData.accessToken : null;
  } catch (error) {
    console.error(`Error getting ${provider} access token for user ${userId}:`, error);
    return null;
  }
};

export const getRefreshToken = async (userId: string, provider: TokenProvider = 'outlook'): Promise<string | null> => {
  try {
    const tokenData = await getUserTokens(userId, provider);
    return tokenData ? tokenData.refreshToken : null;
  } catch (error) {
    console.error(`Error getting ${provider} refresh token for user ${userId}:`, error);
    return null;
  }
};

export const storeTokens = async (
  userId: string,
  accessToken: string,
  refreshToken: string,
  provider: TokenProvider = 'outlook'
): Promise<boolean> => {
  try {
    const tokenData: TokenData = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + 3600 * 1000 // 默认1小时过期
    };
    
    return await updateUserTokens(userId, provider, tokenData);
  } catch (error) {
    console.error(`Error storing ${provider} tokens for user ${userId}:`, error);
    return false;
  }
};

// Get all available providers that have tokens
export const getAvailableProviders = () => {
  return Object.entries(tokens)
    .filter(([_, value]) => value.accessToken)
    .map(([key]) => key as TokenProvider);
};

