import { NextResponse } from 'next/server';

// 获取当前环境的重定向URI
const getRedirectUri = () => {
  const uri = process.env.NEXT_PUBLIC_REDIRECT_URI;
  console.log('Using redirect URI:', uri); // 添加日志以便调试
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

    // 构建令牌页面URL时使用请求的origin
    const origin = new URL(request.url).origin;
    const tokenPageUrl = new URL('/token', origin);
    tokenPageUrl.searchParams.set('access_token', tokens.access_token);
    if (tokens.refresh_token) {
      tokenPageUrl.searchParams.set('refresh_token', tokens.refresh_token);
    }

    return NextResponse.redirect(tokenPageUrl);

  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
