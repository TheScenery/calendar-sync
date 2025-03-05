import { NextResponse } from 'next/server';
import { getAccessToken } from '@/app/utils/token';

async function fetchOutlookEvents(accessToken: string) {
  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
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
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
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

export async function GET() {
  try {
    // Get access tokens for both providers
    const outlookToken = await getAccessToken('outlook');
    const googleToken = await getAccessToken('google');

    // Fetch events from both providers
    const [outlookEvents, googleEvents] = await Promise.all([
      outlookToken ? fetchOutlookEvents(outlookToken) : [],
      googleToken ? fetchGoogleEvents(googleToken) : []
    ]);

    // Combine and sort events by start time
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