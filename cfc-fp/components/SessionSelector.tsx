"use client";
import { Session } from "@/lib/sessions";
import { useEffect, useState } from "react";

interface SessionSelectorProps {
  onSessionSelect: (session: Session) => void;
  selectedSession?: Session;
}

export default function SessionSelector({ onSessionSelect, selectedSession }: SessionSelectorProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`);
        const data = await response.json();
        
        if (response.ok) {
          setSessions(data.sessions || []);
        } else {
          setError(data.error || 'Failed to load sessions');
        }
      } catch (err) {
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-[#19486a]">Select Your Session</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#19486a]"></div>
          <span className="ml-3 text-gray-600">Loading sessions...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-[#19486a]">Select Your Session</h3>
        <div className="text-red-500 text-center py-4">
          {error}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4 text-[#19486a]">Select Your Session</h3>
        <div className="text-gray-500 text-center py-4">
          No sessions available at the moment.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4 text-[#19486a]">Select Your Session</h3>
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {sessions.map((session) => (
          <div
            key={session.id}
            onClick={() => onSessionSelect(session)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedSession?.id === session.id
                ? 'border-[#19486a] bg-[#19486a]/5'
                : 'border-gray-200 hover:border-[#19486a]/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-[#19486a] mb-1">{session.name}</h4>
                <p className="text-sm text-gray-600 mb-2">{formatDate(session.date)}</p>
                {session.description && (
                  <p className="text-sm text-gray-500">{session.description}</p>
                )}
              </div>
              {selectedSession?.id === session.id && (
                <div className="ml-3">
                  <svg
                    className="w-5 h-5 text-[#19486a]"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 