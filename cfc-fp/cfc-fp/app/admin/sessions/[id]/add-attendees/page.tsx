"use client";

import { Attendee, sessionAPI } from "@/lib/adminApi";
import { ArrowLeft, PlusCircle, Trash, UserX } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AttendeeInput = {
  name: string;
  email: string;
};

export default function ManageAttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [existingAttendees, setExistingAttendees] = useState<Attendee[]>([]);
  const [newAttendees, setNewAttendees] = useState<AttendeeInput[]>([{ name: '', email: '' }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchSession = async () => {
        try {
          const session = await sessionAPI.getSession(id);
          setExistingAttendees(session.attendees);
        } catch (err) {
          setError("Failed to load session details.");
        } finally {
          setLoading(false);
        }
      };
      fetchSession();
    }
  }, [id]);

  const handleNewAttendeeChange = (index: number, field: keyof AttendeeInput, value: string) => {
    const updated = [...newAttendees];
    updated[index][field] = value;
    setNewAttendees(updated);
  };

  const addAttendeeField = () => {
    setNewAttendees([...newAttendees, { name: '', email: '' }]);
  };

  const removeNewAttendeeField = (index: number) => {
    const updated = newAttendees.filter((_, i) => i !== index);
    setNewAttendees(updated);
  };
  
  const handleRemoveExisting = async (attendeeId: string) => {
    if (!confirm("Are you sure you want to remove this registrant?")) return;

    try {
      console.log('Trying to delete attendee with id:', attendeeId);

        await sessionAPI.removeAttendee(id, attendeeId);
        setExistingAttendees(prev => prev.filter(a => a._id !== attendeeId));
      alert('Attendee removed successfully!');
    } catch (err) {
        setError("Failed to remove registrant.");
      alert('Failed to remove registrant.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const toAdd = newAttendees.filter(a => a.name.trim() !== '' && a.email.trim() !== '');

    if (toAdd.length === 0) {
      setError("Please add at least one new attendee to save.");
      setSaving(false);
      return;
    }

    try {
      await sessionAPI.addAttendees(id, toAdd);
      router.push(`/admin/sessions/${id}`);
    } catch (err) {
      setError("Failed to add attendees.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Link href={`/admin/sessions/${id}`} className="flex items-center text-gray-600 hover:text-gray-900 mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Session Details
      </Link>
      
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Manage Registrants</h1>

      {/* Existing Registrants */}
      <div className="bg-white p-8 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Existing Registrants</h2>
        <div className="space-y-3">
          {existingAttendees.length > 0 ? (
            existingAttendees.map(attendee => (
              <div key={attendee._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium text-gray-900">{attendee.name}</p>
                  <p className="text-sm text-gray-600">{attendee.email}</p>
                </div>
                <button onClick={() => handleRemoveExisting(attendee._id)} className="text-red-500 hover:text-red-700">
                  <UserX className="w-5 h-5" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No one is registered for this session yet.</p>
          )}
        </div>
      </div>

      {/* Add New Registrants Form */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Registrants</h2>
        <div className="space-y-4">
          {newAttendees.map((attendee, index) => (
            <div key={index} className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Attendee Name"
                value={attendee.name}
                onChange={(e) => handleNewAttendeeChange(index, 'name', e.target.value)}
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                required
              />
              <input
                type="email"
                placeholder="attendee@example.com"
                value={attendee.email}
                onChange={(e) => handleNewAttendeeChange(index, 'email', e.target.value)}
                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900"
                required
              />
              <button
                type="button"
                onClick={() => removeNewAttendeeField(index)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addAttendeeField}
          className="mt-6 flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Another
        </button>

        {error && <p className="mt-4 text-red-500">{error}</p>}

        <div className="flex justify-end mt-8">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {saving ? 'Saving...' : 'Save New Registrants'}
          </button>
        </div>
      </form>
    </div>
  );
}