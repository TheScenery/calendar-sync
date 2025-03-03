import { storeTokens } from '@/app/utils/token';
import { NextResponse } from 'next/server';

// 获取当前环境的重定向URI
const getRedirectUri = () => {
  const uri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI;
  console.log('Using Google redirect URI:', uri); // 添加日志以便调试
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
    // Store tokens with a prefix to distinguish from Outlook tokens
    storeTokens(tokens.access_token, tokens.refresh_token, 'google');

    // 构建令牌页面URL时使用请求的origin
    const origin = new URL(request.url).origin;
    const tokenPageUrl = new URL('/token', origin);
    tokenPageUrl.searchParams.set('access_token', tokens.access_token);
    if (tokens.refresh_token) {
      tokenPageUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }
    tokenPageUrl.searchParams.set('provider', 'google');

    return NextResponse.redirect(tokenPageUrl);

  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 