const tokens = {
  accessToken: '',
  refreshToken: '',
};

export const getAccessToken =  () => {
  return tokens.accessToken;
};

export const getRefreshToken =  () => {
  return tokens.refreshToken;
};

export const storeTokens =  (accessToken: string, refreshToken: string) => {
  tokens.accessToken = accessToken;
  tokens.refreshToken = refreshToken;
};

