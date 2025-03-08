import redis from '../utils/redis';
import { User, UserWithTokens, TokenProvider, TokenData } from '../models/User';

const USER_PREFIX = 'user:';
const EMAIL_TO_ID_PREFIX = 'email-to-id:';

// 根据邮箱获取用户ID
export async function getUserIdByEmail(email: string): Promise<string | null> {
  const id = await redis.get(`${EMAIL_TO_ID_PREFIX}${email}`);
  return id;
}

// 根据ID获取用户
export async function getUserById(id: string): Promise<UserWithTokens | null> {
  const userData = await redis.get(`${USER_PREFIX}${id}`);
  if (!userData) return null;
  
  try {
    return JSON.parse(userData) as UserWithTokens;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

// 根据邮箱获取用户
export async function getUserByEmail(email: string): Promise<UserWithTokens | null> {
  const id = await getUserIdByEmail(email);
  if (!id) return null;
  
  return getUserById(id);
}

// 创建或更新用户
export async function saveUser(user: UserWithTokens): Promise<boolean> {
  try {
    // 更新用户数据
    user.updatedAt = Date.now();
    
    // 如果是新用户，设置创建时间
    if (!user.createdAt) {
      user.createdAt = user.updatedAt;
    }
    
    // 存储用户数据
    await redis.set(`${USER_PREFIX}${user.id}`, JSON.stringify(user));
    
    // 存储邮箱到ID的映射
    await redis.set(`${EMAIL_TO_ID_PREFIX}${user.email}`, user.id);
    
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
}

// 更新用户的令牌
export async function updateUserTokens(
  userId: string,
  provider: TokenProvider,
  tokenData: TokenData
): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    if (!user) return false;
    
    // 确保tokens对象存在
    if (!user.tokens) {
      user.tokens = {};
    }
    
    // 更新指定提供商的令牌
    user.tokens[provider] = {
      accessToken: tokenData.accessToken,
      refreshToken: tokenData.refreshToken,
      expiresAt: tokenData.expiresAt
    };
    
    // 保存更新后的用户数据
    return saveUser(user);
  } catch (error) {
    console.error(`Error updating ${provider} tokens for user ${userId}:`, error);
    return false;
  }
}

// 检查用户是否存在
export async function userExists(email: string): Promise<boolean> {
  const id = await getUserIdByEmail(email);
  return !!id;
}

// 获取用户的令牌
export async function getUserTokens(
  userId: string,
  provider: TokenProvider
): Promise<TokenData | null> {
  const user = await getUserById(userId);
  if (!user || !user.tokens || !user.tokens[provider]) return null;
  
  return user.tokens[provider] as TokenData;
} 