"use client";

import { Session, sessionAPI } from "@/lib/adminApi";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function SessionDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchSession = async () => {
        try {
          const data = await sessionAPI.getSession(id);
          setSession(data);
        } catch (err) {
          setError("Failed to load session details.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchSession();
    }
  }, [id]);

  const handleStatusChange = async (attendeeId: string, newStatus: boolean) => {
    if (!session) return;
    
    try {
        await sessionAPI.updateAttendeeStatus(session._id, attendeeId, newStatus);
      
        // Optimistically update the UI
        setSession(prevSession => {
            if (!prevSession) return null;
            return {
                ...prevSession,
                attendees: prevSession.attendees.map(attendee => 
                    attendee._id === attendeeId ? { ...attendee, isActual: newStatus } : attendee
                )
            };
        });

    } catch (err) {
      console.error("Failed to update attendee status", err);
      // Optionally, show an error message to the user
    }
  };

  if (loading) return <div>Loading session details...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!session) return <div>Session not found.</div>;

  return (
    <div className="p-8">
      <Link href="/admin/sessions" className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Sessions
      </Link>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{session.name}</h1>
        <p className="text-lg text-gray-500">{new Date(session.date).toLocaleDateString()}</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Attendees ({session.attendees.length})</h2>
            <p className="text-sm text-gray-600 mt-1">
                Use the toggle to mark whether an attendee was present at the session.
            </p>
        </div>
        <div className="divide-y divide-gray-200">
          {session.attendees.length === 0 ? (
            <p className="p-6 text-gray-500">No attendees have been registered for this session yet.</p>
          ) : (
            session.attendees.map((attendee) => (
              <div key={attendee._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-800">{attendee.name}</p>
                  <p className="text-sm text-gray-500">{attendee.email}</p>
                </div>
                <div className="flex items-center">
                    <span className={`mr-3 text-sm font-medium ${attendee.isActual ? 'text-green-600' : 'text-gray-500'}`}>
                        {attendee.isActual ? 'Attended' : 'Absent'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={attendee.isActual}
                            onChange={(e) => handleStatusChange(attendee._id, e.target.checked)}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
