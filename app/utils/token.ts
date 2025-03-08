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
  provider: TokenProvider = 'outlook',
  expiresIn: number = 3600
): Promise<boolean> => {
  try {
    const tokenData: TokenData = {
      accessToken,
      refreshToken,
      expiresAt: Date.now() + expiresIn * 1000
    };
    
    return await updateUserTokens(userId, provider, tokenData);
  } catch (error) {
    console.error(`Error storing ${provider} tokens for user ${userId}:`, error);
    return false;
  }
};

// 获取所有可用的提供商
export const getAvailableProviders = async (userId: string): Promise<TokenProvider[]> => {
  try {
    const providers: TokenProvider[] = [];
    
    // 检查每个提供商是否有有效的令牌
    const outlookTokens = await getUserTokens(userId, 'outlook');
    if (outlookTokens) {
      providers.push('outlook');
    }
    
    const googleTokens = await getUserTokens(userId, 'google');
    if (googleTokens) {
      providers.push('google');
    }
    
    return providers;
  } catch (error) {
    console.error(`Error getting available providers for user ${userId}:`, error);
    return [];
  }
};

