import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');

  if (!sessionCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const session = JSON.parse(sessionCookie.value);
    
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