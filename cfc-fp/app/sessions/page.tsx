"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from "react";

interface Session {
  _id: string;
  name: string;
  description: string;
  date: string;
}

export default function SelectSessionPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        // Updated to fetch from the correct backend URL
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`);
        const data = await response.json();
        
        if (response.ok) {
          setSessions(data.sessions || []);
        } else {
          setError(data.message || 'Failed to load sessions');
        }
      } catch (err) {
        setError('Failed to connect to the server. Please ensure the backend is running.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleSessionSelect = (sessionId: string) => {
    router.push(`/face-verification?sessionId=${sessionId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading Available Sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 dark:bg-gray-800">
        <div className="text-red-500 text-4xl mb-4">☹️</div>
        <h2 className="text-2xl font-semibold text-red-700 dark:text-red-400">Oops! Something went wrong.</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{error}</p>
        <p className="mt-1 text-sm text-gray-500">Please try again later or contact support.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">Provide Your Feedback</h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Select the session you attended to begin the verification process.
          </p>
        </header>
        
        {sessions.length === 0 ? (
          <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
            <h3 className="text-2xl font-semibold">No active sessions</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">There are no feedback sessions available at the moment. Please check back later.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <button
                key={session._id}
                onClick={() => handleSessionSelect(session._id)}
                className="w-full text-left bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg hover:scale-105 transform transition-all duration-300 ease-in-out"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400">{session.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">{session.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {new Date(session.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <span className="mt-2 inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-300">
                      Proceed to Verification &rarr;
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 