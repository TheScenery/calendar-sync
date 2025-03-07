import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/app/utils/jwt';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    // 验证并解码JWT令牌
    const session = verifyJWT(sessionCookie.value);
    
    if (!session) {
      return NextResponse.json({ user: null });
    }
    
    // 检查会话是否过期
    if (session.expiresAt && session.expiresAt < Date.now()) {
      // 会话已过期，可以在这里添加刷新令牌的逻辑
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({ user: session.user });
  } catch (error) {
    console.error('Failed to parse session:', error);
    return NextResponse.json({ user: null });
  }
} 