import { getAccessToken } from "@/app/utils/token";
import { NextResponse } from "next/server";

export async function GET() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return NextResponse.json({ error: 'Access token is required' }, { status: 400 });
  }

  try {
    const response = await fetch('https://graph.microsoft.com/v1.0/me/events', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch events' }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json(data.value);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


