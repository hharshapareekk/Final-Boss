"use client";
import { Dialog, Transition } from '@headlessui/react';
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// This is a new interface for the session data
interface Session {
  _id: string;
  name: string;
  date: string;
  description: string;
  feedbackSubmitted?: boolean; // Optional property
}

export default function FeedbackPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isOtpModalOpen, setOtpModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchSessions() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/sessions`); // Fetch all sessions
        if (!res.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await res.json();
        setSessions(data.data.sessions);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const handleFeedbackClick = (session: Session) => {
    setSelectedSession(session);
    setOtpModalOpen(true);
  };

  const closeOtpModal = () => {
    setOtpModalOpen(false);
    setSelectedSession(null);
  };

  const handleOtpSuccess = (isActualAttendee: boolean, email: string) => {
    closeOtpModal();
    if (!selectedSession) return;
    if (isActualAttendee) {
      router.push(`/feedback/quiz?sessionId=${selectedSession._id}&email=${email}`);
    } else {
      router.push(`/feedback/missed-session?sessionId=${selectedSession._id}&email=${email}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading available sessions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-red-600">Failed to Load Sessions</h2>
                <p className="text-gray-600">{error}</p>
            </div>
      </div>
    )
  }

  const cardColors = [
    "bg-blue-100 border-blue-200",
    "bg-emerald-100 border-emerald-200",
    "bg-amber-100 border-amber-200",
    "bg-purple-100 border-purple-200",
    "bg-rose-100 border-rose-200",
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 rounded-2xl shadow-lg mb-10 text-white">
            <h1 className="text-3xl font-bold">Share Your Experience</h1>
            <p className="text-blue-100 mt-2 text-lg">
                Please select a session below to provide your valuable feedback.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.length === 0 ? (
            <div className="col-span-full bg-gray-50 p-10 rounded-2xl shadow-sm border border-gray-200 text-center">
              <div className="inline-flex bg-blue-100 p-4 rounded-full mb-5">
                <svg
                  className="w-10 h-10 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                No Active Sessions
              </h3>
              <p className="text-gray-500">
                There are no sessions available for feedback right now. Please check back later.
              </p>
            </div>
          ) : (
            sessions.map((session, index) => (
              <SessionCard
                key={session._id || index}
                session={session}
                colorVariant={cardColors[index % cardColors.length]}
                onFeedbackClick={() => handleFeedbackClick(session)}
              />
            ))
          )}
        </div>
      </div>
      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={closeOtpModal}
        session={selectedSession}
        onVerificationSuccess={handleOtpSuccess}
      />
    </div>
  );
}

function SessionCard({
  session,
  colorVariant,
  onFeedbackClick,
}: {
  session: Session;
  colorVariant: string;
  onFeedbackClick: () => void;
}) {
  return (
    <div
      className={`group border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col ${colorVariant}`}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 5v2m0 4v2m0 4v2m5-5a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          {session.feedbackSubmitted ? (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center">
              <svg
                className="w-3 h-3 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              COMPLETED
            </span>
          ) : null}
        </div>
        <h3 className="text-gray-800 font-bold text-xl mt-4 line-clamp-2">
          {session.name}
        </h3>
        <p className="text-gray-600 text-sm mt-1">
          {new Date(session.date).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="px-5 pb-5 flex-grow">
        <p className="text-gray-700 line-clamp-4">{session.description}</p>
      </div>

      <div className="p-5 pt-0">
        <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all duration-200 shadow-sm hover:shadow-md w-full flex items-center justify-center"
            onClick={onFeedbackClick}
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Give Feedback
          </button>
      </div>
    </div>
  );
}

function OtpVerificationModal({ isOpen, onClose, session, onVerificationSuccess }: { isOpen: boolean, onClose: () => void, session: Session | null, onVerificationSuccess: (isActual: boolean, email: string) => void}) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'loading', 'error'
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Reset state when modal is reopened for a new session
    if (isOpen) {
      setStep('email');
      setEmail('');
      setOtp('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/otp/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, sessionId: session?._id }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to send OTP.');
      }
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/otp/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, session_id: session?._id, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) {
        throw new Error(data.error || 'OTP verification failed.');
      }
      onVerificationSuccess(data.is_actual_attendee, email);
    } catch (err: any) {
      setError(err.message);
      setStep('otp'); // Stay on otp step on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {step === 'email' ? 'Verify Your Email' : 'Enter OTP'}
                </Dialog.Title>
                 <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      To provide feedback for "{session?.name}", please verify your identity.
                    </p>
                </div>

                {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}

                {step === 'email' ? (
                  <form onSubmit={handleEmailSubmit} className="mt-4 space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                      {isLoading ? 'Sending...' : 'Send OTP'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleOtpSubmit} className="mt-4 space-y-4">
                     <div>
                        <label htmlFor="otp" className="block text-sm font-medium text-gray-700">One-Time Password</label>
                        <input
                          id="otp"
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        />
                    </div>
                     <button type="submit" disabled={isLoading} className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300">
                       {isLoading ? 'Verifying...' : 'Verify & Proceed'}
                    </button>
                  </form>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
