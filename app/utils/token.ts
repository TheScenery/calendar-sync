import { createClient } from 'redis';

// Define a type for token providers
export type TokenProvider = 'outlook' | 'google';

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

const redis = await createClient({
  url: process.env.REDIS_URL,
}).connect();

export const getAccessToken = async (provider: TokenProvider = 'outlook') => {
  const tokens = await redis.get(provider);
  return tokens ? JSON.parse(tokens).accessToken : null;  
};

export const getRefreshToken = async (provider: TokenProvider = 'outlook') => {
  const tokens = await redis.get(provider);
  return tokens ? JSON.parse(tokens).refreshToken : null;
};

export const storeTokens = async (accessToken: string, refreshToken: string, provider: TokenProvider = 'outlook') => {
  await redis.set(provider, JSON.stringify({ accessToken, refreshToken }));
};

// Get all available providers that have tokens
export const getAvailableProviders = () => {
  return Object.entries(tokens)
    .filter(([_, value]) => value.accessToken)
    .map(([key]) => key as TokenProvider);
};

