import { NextResponse } from 'next/server';
import { verifyJWT } from '@/app/utils/jwt';
import { getUserTokens, getUserById } from '@/app/services/userService';
import { TokenProvider } from '@/app/models/User';

// 定义同步结果类型
interface SyncResult {
  success: number;
  failed: number;
  errors: string[];
}

// 从Outlook获取日历事件
async function fetchOutlookEvents(accessToken: string) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events?$top=50&$select=id,subject,start,end,organizer', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Outlook events: ${response.status}`);
    }

    const data = await response.json();
    return data.value;
  } catch (error) {
    console.error('Error fetching Outlook events:', error);
    throw error;
  }
}

// 从Google获取日历事件
async function fetchGoogleEvents(accessToken: string) {
  try {
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Google events: ${response.status}`);
    }

    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error('Error fetching Google events:', error);
    throw error;
  }
}

// 将Outlook事件同步到Google
async function syncOutlookToGoogle(outlookEvents: any[], googleAccessToken: string): Promise<SyncResult> {
  const results: SyncResult = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const event of outlookEvents) {
    try {
      // 转换Outlook事件为Google事件格式
      const googleEvent = {
        summary: event.subject,
        start: {
          dateTime: event.start.dateTime,
          timeZone: event.start.timeZone
        },
        end: {
          dateTime: event.end.dateTime,
          timeZone: event.end.timeZone
        },
        description: `Synced from Outlook. Original organizer: ${event.organizer?.emailAddress?.name || 'Unknown'}`,
        // 使用Outlook事件ID作为扩展属性，以便后续识别
        extendedProperties: {
          private: {
            outlookId: event.id
          }
        }
      };

      // 创建Google日历事件
      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(googleEvent)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create Google event: ${errorText}`);
      }

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return results;
}

// 将Google事件同步到Outlook
async function syncGoogleToOutlook(googleEvents: any[], outlookAccessToken: string): Promise<SyncResult> {
  const results: SyncResult = {
    success: 0,
    failed: 0,
    errors: []
  };

  for (const event of googleEvents) {
    try {
      // 转换Google事件为Outlook事件格式
      const outlookEvent = {
        subject: event.summary,
        start: {
          dateTime: event.start.dateTime || `${event.start.date}T00:00:00`,
          timeZone: event.start.timeZone || 'UTC'
        },
        end: {
          dateTime: event.end.dateTime || `${event.end.date}T23:59:59`,
          timeZone: event.end.timeZone || 'UTC'
        },
        body: {
          contentType: 'text',
          content: `Synced from Google. ${event.description || ''}`
        }
      };

      // 创建Outlook日历事件
      const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${outlookAccessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(outlookEvent)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create Outlook event: ${errorText}`);
      }

      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push(error instanceof Error ? error.message : String(error));
    }
  }

  return results;
}

export async function POST(request: Request) {
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
    
    // 获取同步方向和其他参数
    const { direction } = await request.json();
    
    if (!direction || !['outlook-to-google', 'google-to-outlook', 'both'].includes(direction)) {
      return NextResponse.json(
        { error: 'Invalid sync direction' },
        { status: 400 }
      );
    }

    // 获取用户的令牌
    const outlookTokens = await getUserTokens(userId, 'outlook');
    const googleTokens = await getUserTokens(userId, 'google');

    if (!outlookTokens || !googleTokens) {
      return NextResponse.json(
        { error: 'Missing required tokens for sync' },
        { status: 400 }
      );
    }

    const results: {
      outlookToGoogle: SyncResult | null;
      googleToOutlook: SyncResult | null;
    } = {
      outlookToGoogle: null,
      googleToOutlook: null
    };

    // 根据方向执行同步
    if (direction === 'outlook-to-google' || direction === 'both') {
      const outlookEvents = await fetchOutlookEvents(outlookTokens.accessToken);
      results.outlookToGoogle = await syncOutlookToGoogle(outlookEvents, googleTokens.accessToken);
    }

    if (direction === 'google-to-outlook' || direction === 'both') {
      const googleEvents = await fetchGoogleEvents(googleTokens.accessToken);
      results.googleToOutlook = await syncGoogleToOutlook(googleEvents, outlookTokens.accessToken);
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error syncing calendars:', error);
    return NextResponse.json(
      { error: 'Failed to sync calendars', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}