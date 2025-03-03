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

export const getAccessToken = (provider: TokenProvider = 'outlook') => {
  return tokens[provider].accessToken;
};

export const getRefreshToken = (provider: TokenProvider = 'outlook') => {
  return tokens[provider].refreshToken;
};

export const storeTokens = (accessToken: string, refreshToken: string, provider: TokenProvider = 'outlook') => {
  tokens[provider].accessToken = accessToken;
  tokens[provider].refreshToken = refreshToken;
};

// Get all available providers that have tokens
export const getAvailableProviders = () => {
  return Object.entries(tokens)
    .filter(([_, value]) => value.accessToken)
    .map(([key]) => key as TokenProvider);
};

