"use client";
import Papa from "papaparse";
import React, { useRef, useState } from "react";
import * as XLSX from "xlsx";

interface Attendee {
  name: string;
  email: string;
}

export default function AttendeesStep({ sessionData, updateSessionData, prevStep, handleSubmit }: any) {
  const [attendees, setAttendees] = useState(sessionData.attendees);
  const [manualName, setManualName] = useState("");
  const [manualEmail, setManualEmail] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = results.data as any[];
          const parsed = rows
            .map(row => ({
              name: row.name || row.Name || row["Full Name"] || row["Attendee Name"],
              email: row.email || row.Email || row["E-mail"] || row["Attendee Email"]
            }))
            .filter(r => r.name && r.email);
          setAttendees((prev: Attendee[]) => [...prev, ...parsed]);
        }
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
          .map(row => ({
            name: row.name || row.Name || row["Full Name"] || row["Attendee Name"],
            email: row.email || row.Email || row["E-mail"] || row["Attendee Email"]
          }))
          .filter(r => r.name && r.email);
        setAttendees((prev: Attendee[]) => [...prev, ...parsed]);
      };
      reader.readAsBinaryString(file);
    } else {
      alert("Please upload a CSV or Excel file.");
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleManualAdd = () => {
    if (manualName.trim() && manualEmail.trim()) {
      setAttendees((prev: Attendee[]) => [...prev, { name: manualName.trim(), email: manualEmail.trim() }]);
      setManualName("");
      setManualEmail("");
    }
  };

  const handleAttendeeChange = (index: number, field: string, value: string) => {
    const newAttendees = [...attendees];
    newAttendees[index][field] = value;
    setAttendees(newAttendees);
  };

  const addAttendee = () => {
    setAttendees([...attendees, { name: "", email: "" }]);
  };

  const handleFinalSubmit = () => {
    handleSubmit(attendees);
  };

  return (
    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl w-full border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Create New Session - Step 2: Add Attendees</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* File Upload Section */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Upload a File</h3>
          <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center bg-white">
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer text-blue-500 hover:text-blue-700 font-semibold">
              Select a CSV or Excel file
            </label>
            <p className="text-xs text-blue-400 mt-1">Accepted columns: name, email</p>
          </div>
        </div>
        {/* Manual Add Section */}
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">Add Manually</h3>
          <div className="flex flex-col space-y-3">
            <input
              type="text"
              placeholder="Attendee Name"
              className="bg-white text-blue-900 rounded-md border border-blue-200 focus:ring-blue-400 focus:border-blue-400 p-2 shadow-sm"
              value={manualName}
              onChange={e => setManualName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Attendee Email"
              className="bg-white text-blue-900 rounded-md border border-blue-200 focus:ring-blue-400 focus:border-blue-400 p-2 shadow-sm"
              value={manualEmail}
              onChange={e => setManualEmail(e.target.value)}
            />
            <button
              type="button"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md font-semibold hover:bg-blue-700 shadow"
              onClick={handleManualAdd}
            >
              Add Attendee
            </button>
          </div>
        </div>
      </div>
      {/* Attendees List Section */}
      <div>
        <h3 className="font-semibold text-blue-700 mb-3">Attendees List ({attendees.length})</h3>
        <div className="max-h-64 overflow-y-auto bg-blue-50 rounded-lg border border-blue-100">
          {attendees.length === 0 ? (
            <div className="text-center text-blue-400 p-8">No attendees added yet.</div>
          ) : (
            <table className="min-w-full">
              <thead className="bg-blue-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-700 uppercase tracking-wider">Email</th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-100">
                {attendees.map((a: Attendee, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-100/50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-900">{a.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-500">{a.email}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        className="text-red-500 hover:text-red-400 text-xs font-semibold"
                        onClick={() => setAttendees((prev: Attendee[]) => prev.filter((_: Attendee, i: number) => i !== idx))}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          className="px-6 py-2 bg-blue-200 text-blue-700 font-semibold rounded-md hover:bg-blue-300"
          onClick={prevStep}
        >
          Back
        </button>
        <button
          className="px-8 py-2 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 shadow"
          onClick={handleFinalSubmit}
          disabled={attendees.length === 0}
        >
          Create Session
        </button>
      </div>
    </div>
  );
} 