"use client";
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MissedSessionFeedbackPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('sessionId');
    const email = searchParams.get('email');

    const [reason, setReason] = useState('');
    const [interest, setInterest] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!reason || !interest) {
            setError('Please fill out all fields.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/feedback/missed-session`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    email,
                    reason,
                    futureInterest: interest,
                }),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Failed to submit feedback.');
            }

            setSuccess(true);
            setTimeout(() => router.push('/'), 2000); // Redirect to home after 2s
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full text-center p-8 bg-white shadow-lg rounded-2xl">
                    <h1 className="text-2xl font-bold text-green-600">Thank You!</h1>
                    <p className="mt-2 text-gray-600">Your feedback has been received. We appreciate you taking the time.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">We Missed You!</h1>
                <p className="text-gray-600 mb-6">Please let us know why you couldn't make it to the session. Your feedback is valuable for our improvement.</p>
                
                {error && <div className="mb-4 bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                            What was the primary reason you were unable to attend?
                        </label>
                        <textarea
                            id="reason"
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-800"
                            placeholder="e.g., scheduling conflict, technical issues, etc."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                     <div>
                        <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">
                           Are you interested in attending a future session on this topic? Why or why not?
                        </label>
                        <textarea
                            id="interest"
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-800"
                            placeholder="Let us know your thoughts..."
                            value={interest}
                            onChange={(e) => setInterest(e.target.value)}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 transition duration-300"
                    >
                        {isLoading ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
} 