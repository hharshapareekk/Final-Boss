"use client";
import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";

interface WebcamCaptureProps {
  onCapture: (imageSrc: string) => void;
}

export default function WebcamCapture({ onCapture }: WebcamCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const [isCaptured, setIsCaptured] = useState(false);

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        onCapture(imageSrc);
        setIsCaptured(true);
      }
    }
  }, [webcamRef, onCapture]);

  return (
    <div className="space-y-4">
      <div className="relative w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
        {!isCaptured ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ facingMode: "user" }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-green-50">
            <p className="text-green-600 font-medium">Photo captured!</p>
          </div>
        )}
      </div>

      {!isCaptured ? (
        <button
          onClick={capture}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Capture Photo
        </button>
      ) : (
        <button
          onClick={() => setIsCaptured(false)}
          className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Retake Photo
        </button>
      )}
    </div>
  );
}
