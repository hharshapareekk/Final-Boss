export interface Session {
  id: string;
  name: string;
  date: string;
  description?: string;
  image?: string;
  attendees: Attendee[];
}

export interface Attendee {
  name: string;
  email: string;
  photoUrl?: string;
  feedbackSubmitted: boolean;
}

const ADMIN_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/**
 * Get all sessions from admin backend
 */
export async function getAllSessions(): Promise<{ sessions: Session[]; error?: string }> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/sessions`);
    const data = await response.json();

    if (response.ok) {
      return { sessions: data };
    }

    return {
      sessions: [],
      error: data.error || 'Failed to fetch sessions'
    };

  } catch (error) {
    console.error('Get sessions error:', error);
    return {
      sessions: [],
      error: error instanceof Error ? error.message : 'Service unavailable'
    };
  }
}

/**
 * Get specific session by ID
 */
export async function getSessionById(sessionId: string): Promise<{ session?: Session; error?: string }> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/sessions/${sessionId}`);
    const data = await response.json();

    if (response.ok) {
      return { session: data };
    }

    return {
      error: data.error || 'Session not found'
    };

  } catch (error) {
    console.error('Get session error:', error);
    return {
      error: error instanceof Error ? error.message : 'Service unavailable'
    };
  }
}

/**
 * Check if user is registered for a session
 */
export async function checkUserAttendance(sessionId: string, userEmail: string): Promise<{ isRegistered: boolean; attendee?: Attendee; error?: string }> {
  try {
    const response = await fetch(`${ADMIN_API_BASE_URL}/sessions/${sessionId}/attendance/${encodeURIComponent(userEmail)}`);
    const data = await response.json();

    if (response.ok) {
      return { 
        isRegistered: data.isRegistered,
        attendee: data.attendee
      };
    }

    return {
      isRegistered: false,
      error: data.error || 'Failed to check attendance'
    };

  } catch (error) {
    console.error('Check attendance error:', error);
    return {
      isRegistered: false,
      error: error instanceof Error ? error.message : 'Service unavailable'
    };
  }
} 
