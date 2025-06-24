import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add the auth token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors in API responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Feedback-related API calls
export const feedbackAPI = {
  getAll: (params?: any) => api.get('/feedback', { params }),
  getById: (id: string) => api.get(`/feedback/${id}`),
  create: (data: any) => api.post('/feedback', data),
  update: (id: string, data: any) => api.put(`/feedback/${id}`, data),
  delete: (id: string) => api.delete(`/feedback/${id}`),
  updateStatus: (id: string, status: string) => api.patch(`/feedback/${id}/status`, { status }),
};

// Analytics API (if needed)
export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard'),
  getFeedbackStats: (timeRange: string) => api.get(`/analytics/feedback?range=${timeRange}`),
  getRatingDistribution: () => api.get('/analytics/ratings'),
  getCategoryDistribution: () => api.get('/analytics/categories'),
};

// Settings API endpoints
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data: any) => api.put('/settings', data),
};

// Authentication API
export const authAPI = {
  login: (credentials: { email: string; password: string }) => 
    api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
};

export interface Attendee {
  _id: string;
  name: string;
  email: string;
  isActual: boolean;
}

export type AddAttendeePayload = {
  name: string;
  email: string;
}

export interface Session {
  _id: string;
  name: string;
  date: string;
  image?: string;
  description?: string;
  feedbackQuestions: string[];
  attendees: Attendee[];
}

export interface Attendance {
  _id: string;
  sessionId: string;
  attendeeId: string;
  attendeeName: string;
  attendeeEmail: string;
  photoUrl: string;
  attendedAt: string;
  verified: boolean;
}

// Helper to convert an image file to base64
const toBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export type NewSession = Omit<Session, '_id' | 'feedbackQuestions'>;
export const sessionAPI = {
  // Create a session
  createSession: async (sessionData: NewSession): Promise<Session> => {
    const response = await api.post('/sessions', sessionData);    return response.data.data?.session || response.data.data || response.data;
  },

  // Fetch all sessions
  getSessions: async (): Promise<Session[]> => {
    const response = await api.get('/sessions');
    return response.data.data.sessions;
  },

  // Fetch a session by its ID
  getSession: async (id: string): Promise<Session> => {
    const response = await api.get(`/sessions/${id}`);
    return response.data.data.session;
  },

  // Update session details
  updateSession: async (id: string, sessionData: Partial<Session>): Promise<Session> => {
    const response = await api.put(`/sessions/${id}`, sessionData);
    return response.data.data.session;
  },

  // Update the list of attendees for a session
  updateAttendees: async (id: string, attendees: Attendee[]): Promise<Session> => {
    const response = await api.put(`/sessions/${id}/attendees`, { attendees });
    return response.data.data.session;
  },

  // Add new attendees to a session
  addAttendees: async (id: string, attendees: AddAttendeePayload[]): Promise<Session> => {
    const response = await api.post(`/sessions/${id}/attendees`, { attendees });
    return response.data.data.session;
  },

  // Delete a session by ID
  deleteSession: async (id: string): Promise<void> => {
    await api.delete(`/sessions/${id}`);
  },

  // Remove an attendee from a session
  removeAttendee: async (id: string, attendeeId: string): Promise<void> => {
    await api.delete(`/sessions/${id}/attendees/${attendeeId}`);
  },

  // Send notification emails to registered attendees
  notifyAttendees: async (id: string): Promise<void> => {
    await api.post(`/sessions/${id}/notify-attendees`);
  },

  // Update the status of a single attendee
  updateAttendeeStatus: async (id: string, attendeeId: string, isActual: boolean): Promise<Attendee> => {
    const response = await api.patch(`/sessions/${id}/attendees/${attendeeId}`, { isActual });
    return response.data.data.attendee;
  },
};

// Attendance-related API calls
export const attendanceAPI = {
  // Save attendance data, including a photo
  saveAttendance: async (attendanceData: {
    sessionId: string;
    attendeeId: string;
    attendeeName: string;
    attendeeEmail: string;
    photoUrl: string;
  }): Promise<Attendance> => {
    const response = await api.post('/attendance', attendanceData);
    return response.data.data.attendance;
  },

  // Fetch attendance for a specific session
  getSessionAttendance: async (sessionId: string): Promise<{
    session: Session;
    attendanceCount: number;
    totalAttendees: number;
    attendanceRecords: Attendance[];
  }> => {
    const response = await api.get(`/attendance/session/${sessionId}`);
    return response.data.data;
  },

  // Fetch all attendance records
  getAllAttendance: async (): Promise<Attendance[]> => {
    const response = await api.get('/attendance');
    return response.data.data.attendance;
  },
};

export default api;