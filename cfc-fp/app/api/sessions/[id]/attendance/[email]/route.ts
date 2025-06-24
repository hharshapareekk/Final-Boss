import { NextRequest, NextResponse } from 'next/server';

const ADMIN_API_BASE_URL = process.env.ADMIN_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string; email: string } }
) {
  try {
    const { sessionId, email } = params;
    const decodedEmail = decodeURIComponent(email);

    const response = await fetch(
      `${ADMIN_API_BASE_URL}/sessions/${sessionId}/attendance/${encodeURIComponent(decodedEmail)}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: data.error || 'Failed to check attendance' },
      { status: response.status }
    );

  } catch (error) {
    console.error('Error checking attendance:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 