import { NextResponse } from 'next/server';
import { getUserByEmail, saveUser } from '@/app/services/userService';
import { cookies } from 'next/headers';
import { signJWT } from '@/app/utils/jwt';

// 获取当前环境的重定向URI
const getRedirectUri = () => {
  const uri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  console.log('Using Google redirect URI:', uri);
  return uri;
};

export async function GET(request: Request) {
  try {
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
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
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
    
    // 获取用户信息
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user info' },
        { status: 500 }
      );
    }

    const userInfo = await userInfoResponse.json();
    
    // 获取或创建用户
    let user = await getUserByEmail(userInfo.email);
    
    if (!user) {
      // 如果用户不存在，返回错误
      return NextResponse.redirect(new URL('/login?error=user_not_found', request.url));
    }
    
    // 更新用户的Google令牌
    if (!user.tokens) {
      user.tokens = {};
    }
    
    user.tokens.google = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };
    
    // 保存更新后的用户信息
    await saveUser(user);
    
    // 创建会话
    const session = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };

    // 使用JWT加密会话数据
    const jwtToken = signJWT(session);

    // 设置会话cookie
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'session',
      value: jwtToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7天
      path: '/',
      sameSite: 'lax',
    });

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