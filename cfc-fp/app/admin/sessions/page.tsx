"use client";

import { Session, sessionAPI } from "@/lib/adminApi";
import { Trash2 } from 'lucide-react';
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SessionsListPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await sessionAPI.getSessions();
        setSessions(data);
      } catch (err) {
        setError("Failed to load sessions.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleNotify = async (sessionId: string) => {
    setNotificationStatus(prev => ({ ...prev, [sessionId]: 'sending' }));
    try {
      await sessionAPI.notifyAttendees(sessionId);
      setNotificationStatus(prev => ({ ...prev, [sessionId]: 'sent' }));
    } catch (error) {
      console.error('Failed to send notifications:', error);
      setNotificationStatus(prev => ({ ...prev, [sessionId]: 'error' }));
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await sessionAPI.deleteSession(sessionId);
      setSessions(sessions => sessions.filter(s => s._id !== sessionId));
    } catch (err) {
      alert('Failed to delete session');
    }
  };

  if (loading) return <div>Loading sessions...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sessions</h1>
        <Link href="/admin/create-session">
          <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors">
            + Create New Session
          </button>
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="divide-y divide-gray-200">
          {sessions.length === 0 ? (
            <p className="p-6 text-gray-500">No sessions found.</p>
          ) : (
            sessions.map((session) => (
              <div key={session._id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <Link href={`/admin/sessions/${session._id}`} className="flex-grow">
                    <div>
                      <p className="text-lg font-semibold text-blue-700">{session.name}</p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(session.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.attendees.length} registered attendees
                      </p>
                    </div>
                  </Link>
                  <div className="flex items-center space-x-2">
                    <Link href={`/admin/sessions/${session._id}/edit`}>
                      <button className="bg-gray-200 text-gray-800 px-3 py-1 rounded-md text-sm hover:bg-gray-300 transition-colors">
                        Edit
                      </button>
                    </Link>
                    <Link href={`/admin/sessions/${session._id}/add-attendees`}>
                      <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm hover:bg-blue-200 transition-colors">
                        Add Registrants
                      </button>
                    </Link>
                    <button
                      onClick={() => handleNotify(session._id)}
                      disabled={notificationStatus[session._id] === 'sending' || notificationStatus[session._id] === 'sent'}
                      className="bg-green-500 text-white px-3 py-1 rounded-md text-sm font-semibold shadow hover:bg-green-600 transition-colors disabled:bg-gray-400"
                    >
                      {notificationStatus[session._id] === 'sending' && 'Sending...'}
                      {notificationStatus[session._id] === 'sent' && 'Sent!'}
                      {notificationStatus[session._id] === 'error' && 'Error!'}
                      {!notificationStatus[session._id] && 'Notify'}
                    </button>
                    <Link href={`/admin/sessions/${session._id}`}>
                      <button className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm hover:bg-gray-800">
                        View
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(session._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600 flex items-center"
                      title="Delete session"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}