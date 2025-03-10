import { NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/app/services/userService';
import { cookies } from 'next/headers';
import { signJWT } from '@/app/utils/jwt';
import { getSessionUserEmail } from '@/app/utils/session';

// 获取当前环境的重定向URI
const getRedirectUri = () => {
  const uri = process.env.NEXT_PUBLIC_REDIRECT_URI;
  console.log('Using redirect URI:', uri);
  return uri;
};

export async function GET(request: Request) {
  try {

    const userEmail = await getSessionUserEmail();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Failed to fetch user info' },
        { status: 500 }
      );
    }

    // 获取或创建用户
    let user = await getUserByEmail(userEmail);
    
    if (!user) {
      // 如果用户不存在，返回错误
      return NextResponse.redirect(new URL('/login?error=user_not_found', request.url));
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    
    if (!code) {
      return NextResponse.json(
        { error: 'No authorization code received' },
        { status: 400 }
      );
    }

    const redirectUri = getRedirectUri();
    
    // Exchange the authorization code for tokens
    const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
        client_secret: process.env.AZURE_CLIENT_SECRET || '',
        code: code,
        redirect_uri: redirectUri || '',
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code', details: error },
        { status: 500 }
      );
    }

    const tokens = await tokenResponse.json();
    
    // 更新用户的Outlook令牌
    if (!user.tokens) {
      user.tokens = {};
    }
    
    user.tokens.outlook = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };
    
    // 保存更新后的用户信息
    await saveUser(user);
    
    // 重定向到首页
    return NextResponse.redirect(new URL('/', request.url));

  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
