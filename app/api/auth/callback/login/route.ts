import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { signJWT } from '@/app/utils/jwt';
import { userExists, saveUser, getUserByEmail } from '@/app/services/userService';
import { UserWithTokens } from '@/app/models/User';

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

    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_AUTH_REDIRECT_URI || new URL(request.url).origin + '/api/auth/callback/login';

    // 交换授权码获取令牌
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: GOOGLE_CLIENT_ID || '',
        client_secret: GOOGLE_CLIENT_SECRET || '',
        code,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code' },
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
    
    // 检查用户是否存在于系统中
    const userExistsInSystem = await userExists(userInfo.email);
    
    if (!userExistsInSystem) {
      // 如果用户不存在，返回错误
      return NextResponse.redirect(new URL('/login?error=user_not_found', request.url));
    }
    
    // 获取现有用户或创建新用户
    let user = await getUserByEmail(userInfo.email);
    
    if (!user) {
      // 创建新用户
      user = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        tokens: {
          google: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Date.now() + tokens.expires_in * 1000,
          }
        }
      };
      
      // 保存用户信息
      await saveUser(user);
    } else {
      // 更新现有用户的Google令牌
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
    }
    
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