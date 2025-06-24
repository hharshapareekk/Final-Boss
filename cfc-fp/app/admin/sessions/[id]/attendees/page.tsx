"use client";

import { sessionAPI, type Attendee, type Session } from "@/lib/adminApi";
import { useParams, useRouter } from "next/navigation";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";

export default function EditAttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await sessionAPI.getSession(sessionId);
        setSession(data);
        setAttendees(data.attendees || []);
      } catch (err) {
        setError("Failed to load session");
        console.error("Error fetching session:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId]);

  // If loading
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full flex flex-col items-center border border-blue-100">
          <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">Loading...</h1>
        </div>
      </div>
    );
  }

  // If error or session not found
  if (error || !session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full flex flex-col items-center border border-red-100">
          <h1 className="text-3xl font-bold text-red-700 mb-4 text-center">Session Not Found</h1>
          <p className="text-gray-600 text-center">{error || `No session found for ID: ${sessionId}`}</p>
        </div>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const rows = results.data as any[];
          const parsed = rows
            .map((row: any) => ({
              name: row.name || row.Name || row["Full Name"] || row["Attendee Name"],
              email: row.email || row.Email || row["E-mail"] || row["Attendee Email"],
              _id: "", // placeholder, backend will assign real id
              isActual: false
            }))
            .filter((r: any) => r.name && r.email);
          setAttendees((prev) => [
            ...prev,
            ...parsed.map((att: any) => ({
              name: att.name,
              email: att.email,
              _id: att._id || "",
              isActual: typeof att.isActual === 'boolean' ? att.isActual : false
            }))
          ]);
        },
      });
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const data = evt.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);
        const parsed = (rows as any[])
          .map((row: any) => ({
            name: row.name || row.Name || row["Full Name"] || row["Attendee Name"],
            email: row.email || row.Email || row["E-mail"] || row["Attendee Email"],
            _id: "", // placeholder, backend will assign real id
            isActual: false
          }))
          .filter((r: any) => r.name && r.email);
        setAttendees((prev) => [
          ...prev,
          ...parsed.map((att: any) => ({
            name: att.name,
            email: att.email,
            _id: att._id || "",
            isActual: typeof att.isActual === 'boolean' ? att.isActual : false
          }))
        ]);
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Please upload a CSV or Excel file.");
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleManualAdd = () => {
    if (manualName.trim() && manualEmail.trim()) {
      setAttendees((prev) => [
        ...prev,
        {
          name: manualName.trim(),
          email: manualEmail.trim(),
          _id: "",
          isActual: false
        },
      ]);
      setManualName("");
      setManualEmail("");
    }
  };

  const handleRemove = (idx: number) => {
    setAttendees((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      await sessionAPI.updateAttendees(sessionId, attendees);
      router.push("/sessions");
    } catch (err) {
      console.error("Error updating attendees:", err);
      setError("Failed to update attendees. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleStatusChange = async (attendeeId: string, isActual: boolean) => {
    try {
      // Update local state immediately for a responsive UI
      setAttendees(prev =>
        prev.map(a => (a._id === attendeeId ? { ...a, isActual } : a))
      );
      // Call API to persist the change
      await sessionAPI.updateAttendeeStatus(sessionId, attendeeId, isActual);
    } catch (err) {
      console.error("Error updating attendee status:", err);
      // Optionally, revert the state and show an error message
      setError("Failed to update status. Please refresh and try again.");
      // You might want to fetch the session again here to get the true state
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl w-full flex flex-col items-center border border-green-100">
        <h1 className="text-3xl font-bold text-green-700 mb-4 text-center">Edit Registered Attendees</h1>
        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        <div className="mb-6 w-full">
          <label className="block font-semibold mb-2 text-gray-700">Upload CSV or Excel</label>
          <input
            type="file"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileUpload}
            ref={fileInputRef}
            className="block border border-gray-200 rounded px-3 py-2 w-full max-w-xs"
          />
          <p className="text-xs text-gray-500 mt-1">Accepted columns: name, email (or similar variations)</p>
        </div>
        <div className="mb-6 w-full">
          <label className="block font-semibold mb-2 text-gray-700">Add Manually</label>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 items-stretch">
            <input
              type="text"
              placeholder="Name"
              className="border border-gray-200 rounded px-3 py-2 text-black placeholder-gray-400 flex-1 h-[42px]"
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-200 rounded px-3 py-2 text-black placeholder-gray-400 flex-1 h-[42px]"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
            />
            <button
              type="button"
              className="bg-blue-600 text-white px-6 h-[42px] w-32 rounded font-semibold hover:bg-blue-700 whitespace-nowrap"
              onClick={handleManualAdd}
            >
              Add
            </button>
          </div>
        </div>
        <div className="mb-8 w-full">
          <h3 className="font-semibold text-gray-700 mb-2">Attendees List</h3>
          {attendees.length === 0 ? (
            <div className="text-gray-400">No attendees added yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Email</th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-b">Attended</th>
                    <th className="px-6 py-3 border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((a, idx) => (
                    <tr key={a._id || idx}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-b">{a.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 border-b">{a.email}</td>
                      <td className="px-6 py-4 text-center border-b">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          checked={a.isActual}
                          onChange={(e) => handleStatusChange(a._id, e.target.checked)}
                        />
                      </td>
                      <td className="px-6 py-4 border-b">
                        <button
                          className="text-red-500 hover:underline text-xs"
                          onClick={() => handleRemove(idx)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="flex justify-between w-full">
          <button
            className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold"
            onClick={() => router.push("/sessions")}
          >
            Back
          </button>
          <button
            className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors disabled:opacity-50"
            onClick={handleUpdate}
            disabled={updating}
          >
            {updating ? "Updating..." : "Update Attendees"}
          </button>
        </div>
      </div>
    </div>
  );
} 