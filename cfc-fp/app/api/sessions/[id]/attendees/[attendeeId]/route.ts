import { NextResponse } from 'next/server';

const API_URL = process.env.API_URL;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string; attendeeId: string } }
) {
  try {
    const { id, attendeeId } = params;
    const body = await request.json();

    const res = await fetch(`${API_URL}/sessions/${id}/attendees/${attendeeId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json({ error: errorData.message || 'Failed to update status' }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 