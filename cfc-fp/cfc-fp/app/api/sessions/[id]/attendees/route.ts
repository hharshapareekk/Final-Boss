    // app/api/sessions/[id]/attendees/route.ts
    import { NextResponse } from 'next/server';

    const API_URL = process.env.API_URL;

    // ADD attendees to a session
    export async function POST(
      request: Request,
      { params }: { params: { id: string } }
    ) {
      try {
        const { id } = params;
        const body = await request.json();
        const res = await fetch(`${API_URL}/sessions/${id}/attendees`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json();
          return NextResponse.json({ error: errorData.message || 'Failed to add attendees' }, { status: res.status });
        }
        const data = await res.json();
        return NextResponse.json(data);
      } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
      }
    }