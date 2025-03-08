import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/utils/jwt';
import { getUserTokens } from '@/app/services/userService';

async function fetchOutlookEvents(accessToken: string) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events?$top=10&$select=id,subject,start,end', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Outlook events');
    }

    const data = await response.json();
    return data.value.map((event: any) => ({
      id: event.id,
      title: event.subject,
      start: event.start.dateTime,
      end: event.end.dateTime,
      provider: 'outlook'
    }));
  } catch (error) {
    console.error('Error fetching Outlook events:', error);
    return [];
  }
}

async function fetchGoogleEvents(accessToken: string) {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Google events');
    }

    const data = await response.json();
    return data.items.map((event: any) => ({
      id: event.id,
      title: event.summary,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      provider: 'google'
    }));
  } catch (error) {
    console.error('Error fetching Google events:', error);
    return [];
  }
}

export async function GET(request: Request) {
  try {
    // 从cookie中获取会话
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split('=');
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const sessionCookie = cookies['session'];
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 验证会话
    const session = verifyJWT(sessionCookie);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 获取用户的令牌
    const outlookTokens = await getUserTokens(userId, 'outlook');
    const googleTokens = await getUserTokens(userId, 'google');

    // 获取日历事件
    const [outlookEvents, googleEvents] = await Promise.all([
      outlookTokens ? fetchOutlookEvents(outlookTokens.accessToken) : [],
      googleTokens ? fetchGoogleEvents(googleTokens.accessToken) : []
    ]);

    // 合并并按开始时间排序
    const allEvents = [...outlookEvents, ...googleEvents].sort((a, b) => 
      new Date(a.start).getTime() - new Date(b.start).getTime()
    );

    return NextResponse.json({
      events: allEvents,
      providers: {
        outlook: outlookEvents.length > 0,
        google: googleEvents.length > 0
      }
    });
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
} 