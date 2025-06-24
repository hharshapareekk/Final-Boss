"use client";

import { Attendee } from "@/lib/adminApi";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

interface Props {
  attendee: Attendee;
  sessionId: string;
  onUploadSuccess: (attendeeEmail: string, imageId: string) => void;
}

const videoConstraints = {
  width: 400,
  height: 400,
  facingMode: "user",
};

export default function AttendeePhotoUpload({ attendee, sessionId, onUploadSuccess }: Props) {
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const webcamRef = useRef<Webcam>(null);

  const capture = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) {
      setError("Could not capture image.");
      return;
    }
    
    setIsUploading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions/${sessionId}/attendees/${attendee.email}/photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc }),
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      onUploadSuccess(attendee.email, data.imageId);
      setIsUploading(false);
      setIsCapturing(false);

    } catch (err) {
      setError("Upload failed. Please try again.");
      setIsUploading(false);
      console.error(err);
    }
  }, [webcamRef, attendee, sessionId, onUploadSuccess]);

  return (
    <div className="flex flex-col items-center">
      {!isCapturing && (
        <button
          onClick={() => setIsCapturing(true)}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-sm"
        >
          Capture Photo
        </button>
      )}

      {isCapturing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-center">Capture for {attendee.name}</h3>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="rounded-lg"
            />
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setIsCapturing(false)}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg font-semibold"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={capture}
                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Capture & Upload'}
              </button>
            </div>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
} 