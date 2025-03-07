import jwt from 'jsonwebtoken';

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

interface SessionPayload {
  user: User;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-key';

// 签发JWT令牌
export function signJWT(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '7d', // 令牌7天后过期
  });
}

// 验证JWT令牌
export function verifyJWT(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// 解码JWT令牌（不验证签名）
export function decodeJWT(token: string): SessionPayload | null {
  try {
    return jwt.decode(token) as SessionPayload;
  } catch (error) {
    console.error('JWT decode failed:', error);
    return null;
  }
} 