import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  
  // 删除会话cookie
  cookieStore.delete('session');
  
  return NextResponse.json({ success: true });
} 