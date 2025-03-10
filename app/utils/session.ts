import { cookies } from 'next/headers';
import { verifyJWT } from './jwt';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return null;
    }

    const session = verifyJWT(sessionCookie.value);
    if (!session || !session.user) {
      return null;
    }

    // 检查会话是否过期
    if (session.expiresAt && session.expiresAt < Date.now()) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Failed to parse session:', error);
    return null;
  }
}

export async function getSessionUserEmail(): Promise<string | null> {
  const user = await getSessionUser();
  return user?.email || null;
} 