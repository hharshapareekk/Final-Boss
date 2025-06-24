"use client";

import { NewSession, sessionAPI } from "@/lib/adminApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AttendeesStep from "./AttendeesStep";
import SessionDetailsStep from "./SessionDetailsStep";

export default function MultiStepCreateSession() {
  const [step, setStep] = useState(1);
  const [sessionData, setSessionData] = useState({
    name: "",
    date: "",
    questions: {
      initial: [{ text: "How would you rate this session overall?", type: "rating" as const }],
      positive: [{ text: "What did you enjoy most about the session?", type: "text" as const }],
      negative: [{ text: "What constructive feedback do you have for future sessions?", type: "text" as const }],
    },
    attendees: [],
  });
  const router = useRouter();

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const updateSessionData = (data: Partial<typeof sessionData>) => {
    setSessionData((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async (finalAttendees: any[]) => {
    try {
      await sessionAPI.createSession({ ...sessionData, attendees: finalAttendees } as NewSession);
      alert('Session created successfully!');
      router.push('/admin/sessions');
    } catch (error) {
      console.error("Failed to create session:", error);
      alert('Failed to create session. Please check the console for details.');
    }
  };

  switch (step) {
    case 1:
      return (
        <SessionDetailsStep
          sessionData={sessionData}
          updateSessionData={updateSessionData}
          nextStep={nextStep}
        />
      );
    case 2:
      return (
        <AttendeesStep
          sessionData={sessionData}
          updateSessionData={updateSessionData}
          prevStep={prevStep}
          handleSubmit={handleSubmit}
        />
      );
    default:
      return <div>Invalid step</div>;
  }
}