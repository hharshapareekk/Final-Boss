"use client";

import { Session, attendanceAPI, sessionAPI } from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface Attendee {
  name: string;
  email: string;
}

export default function ClickAttendeePhotosPage() {
  const params = useParams();
  const sessionId = params?.id as string;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [totalAttendees, setTotalAttendees] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);

  const [input, setInput] = useState("");
  const [selected, setSelected] = useState<Attendee | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMsg, setShowMsg] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSessionAndAttendance = async () => {
      try {
        setLoading(true);
        console.log('Fetching session with ID:', sessionId);
        
        const [sessionData, attendanceData] = await Promise.all([
          sessionAPI.getSession(sessionId),
          attendanceAPI.getSessionAttendance(sessionId)
        ]);
        
        console.log('Session data:', sessionData);
        console.log('Attendance data:', attendanceData);
        
        setSession(sessionData);
        setAttendanceCount(attendanceData.attendanceCount);
        setTotalAttendees(attendanceData.totalAttendees);
        setAttendanceRecords(attendanceData.attendanceRecords);
      } catch (err) {
        console.error('Error fetching session:', err);
        setError('Failed to load session');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSessionAndAttendance();
    }
  }, [sessionId]);

  const handleTakePhotoClick = () => {
    setCameraError(null);
    setIsCapturing(true);
  };

  useEffect(() => {
    let stream: MediaStream | null = null;
    const enableCameraStream = async () => {
      if (isCapturing && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
          videoRef.current.srcObject = stream;
        } catch (err: any) {
          console.error("Error accessing camera:", err);
          setCameraError("Could not access camera. Please check permissions and ensure a camera is connected.");
          setIsCapturing(false);
        }
      }
    };
    enableCameraStream();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCapturing]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const photoDataUrl = canvas.toDataURL('image/jpeg');
        setPhotoUrl(photoDataUrl);
        setIsCapturing(false); 
      }
    }
  };

  useEffect(() => {
    if (photoUrl) {
      console.log("photoUrl state updated. It should now be visible.");
    }
  }, [photoUrl]);

  const retakePhoto = () => {
    setPhotoUrl(null);
    setCameraError(null);
    setIsCapturing(true);
  };

  const availableAttendees = useMemo(() => {
    if (!session) return [];
    const attendedEmails = new Set(attendanceRecords.map(ar => ar.attendeeEmail));
    return session.attendees.filter(attendee => !attendedEmails.has(attendee.email));
  }, [session, attendanceRecords]);

  const handleSaveAttendee = async () => {
    if (!selected || !photoUrl) {
      setShowMsg("Please select an attendee and take a photo first!");
      setTimeout(() => setShowMsg(""), 3000);
      return;
    }

    try {
      await attendanceAPI.saveAttendance({
        sessionId,
        attendeeId: selected.email, // Using email as unique identifier
        attendeeName: selected.name,
        attendeeEmail: selected.email,
        photoUrl
      });

      setShowMsg(`Attendance saved for ${selected.name}!`);
      setInput("");
      setSelected(null);
      setPhotoUrl(null);
      
      // Refresh attendance data
      const attendanceData = await attendanceAPI.getSessionAttendance(sessionId);
      setAttendanceCount(attendanceData.attendanceCount);
      setAttendanceRecords(attendanceData.attendanceRecords);
      
      setTimeout(() => setShowMsg(""), 3000);
    } catch (err: any) {
      setShowMsg(err.message || "Failed to save attendance");
      setTimeout(() => setShowMsg(""), 3000);
    }
  };

  const handleFinishSession = () => {
    if (isCapturing) {
      // Stop the camera stream before navigating away
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
    router.push('/sessions');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg w-full flex flex-col items-center border border-blue-100">
          <h1 className="text-3xl font-bold text-blue-700 mb-4 text-center">Loading...</h1>
          <p className="text-gray-600 text-center">Fetching session details...</p>
        </div>
      </div>
    );
  }

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

  // Filter attendees by input
  const filtered = input.trim()
    ? availableAttendees.filter((a) =>
        a.name.toLowerCase().includes(input.trim().toLowerCase())
      )
    : [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 py-12 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-2xl w-full flex flex-col items-center border border-purple-200 relative">
        <button
          onClick={handleFinishSession}
          className="absolute top-6 right-6 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
        >
          Finish Session
        </button>
        <h1 className="text-3xl font-bold text-purple-700 mb-2 text-center">Click Attendee Photos</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-2 text-center">Session: {session.name}</h2>
        
        {/* Attendance Count */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-6 py-3 mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-700">{attendanceCount}/{totalAttendees}</div>
            <div className="text-sm text-blue-600">Verified Attendees</div>
          </div>
        </div>

        <div className="w-full flex flex-col items-center mb-8">
          {/* Camera/Photo Display */}
          <div className="w-80 h-60 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-5xl mb-4 border-2 border-dashed border-gray-400 overflow-hidden relative">
            {isCapturing ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : photoUrl ? (
              <img src={photoUrl} alt="Captured photo" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center text-center p-4">
                <span className="text-6xl">📷</span>
                {cameraError && (
                  <p className="text-sm text-red-600 mt-2 font-semibold">{cameraError}</p>
                )}
              </div>
            )}
          </div>
          
          {/* Hidden canvas for photo capture */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          {/* Camera Controls */}
          <div className="flex gap-4 mb-4">
            {!isCapturing && !photoUrl && (
              <button 
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                onClick={handleTakePhotoClick}
              >
                Take Photo
              </button>
            )}
            {isCapturing && (
              <button 
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                onClick={capturePhoto}
              >
                Capture Photo
              </button>
            )}
            {photoUrl && (
              <button 
                className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700"
                onClick={retakePhoto}
              >
                Retake Photo
              </button>
            )}
          </div>
        </div>

        <div className="w-full max-w-md mb-8">
          <label className="block font-semibold mb-2 text-gray-700">Type attendee name</label>
          <input
            type="text"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-4 text-2xl focus:outline-none focus:border-purple-400 text-black placeholder-gray-400"
            placeholder="Start typing attendee name..."
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setShowDropdown(true);
              setSelected(null);
            }}
            onFocus={() => setShowDropdown(true)}
            autoComplete="off"
          />
          {showDropdown && filtered.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg mt-1 shadow-lg z-10 absolute w-full max-h-48 overflow-y-auto">
              {filtered.map((a, idx) => (
                <div
                  key={idx}
                  className="px-4 py-3 cursor-pointer hover:bg-purple-50 text-black text-lg"
                  onClick={() => {
                    setSelected(a);
                    setInput(a.name);
                    setShowDropdown(false);
                  }}
                >
                  {a.name} <span className="text-base text-gray-400">({a.email})</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-4">
          {selected && (
            <button
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg shadow hover:bg-green-700 transition-colors"
              onClick={handleSaveAttendee}
              disabled={!photoUrl}
            >
              Save Attendee
            </button>
          )}
        </div>

        {showMsg && (
          <div className={`mt-2 font-semibold text-center px-4 py-2 rounded-lg ${
            showMsg.includes('saved') || showMsg.includes('success') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}>
            {showMsg}
          </div>
        )}
      </div>
    </div>
  );
} 