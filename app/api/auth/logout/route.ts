import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // 删除会话cookie
  cookieStore.delete({
    name: 'session',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  
  return NextResponse.json({ success: true });
} 