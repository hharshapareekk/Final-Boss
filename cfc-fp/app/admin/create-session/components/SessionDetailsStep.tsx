"use client";
import React from "react";

const preAddedQuestions = [
  'How satisfied were you with the session?',
  'What did you like most about the session?',
  'What can be improved for future sessions?',
  'Would you recommend this session to others?',
];

interface SessionDetails {
  name: string;
  date: string;
  image?: string;
  questions: {
    initial: { text: string; type: 'rating' }[];
    positive: { text: string; type: 'text' }[];
    negative: { text: string; type: 'text' }[];
  };
  attendees: any[];
}

interface Props {
  sessionData: SessionDetails;
  updateSessionData: (data: Partial<SessionDetails>) => void;
  nextStep: () => void;
}

export default function SessionDetailsStep({ sessionData, updateSessionData, nextStep }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    updateSessionData({ [name]: value });
  };

  const handleQuestionChange = (
    type: 'initial' | 'positive' | 'negative',
    index: number,
    value: string
  ) => {
    const newQuestions = { ...sessionData.questions };
    newQuestions[type][index].text = value;
    updateSessionData({ questions: newQuestions });
  };

  const addQuestion = (type: 'initial' | 'positive' | 'negative') => {
    const newQuestions = { ...sessionData.questions };
    const newQuestion = { text: '', type: type === 'initial' ? 'rating' : 'text' };
    
    if (!newQuestions[type]) {
        newQuestions[type] = [];
    }
    
    newQuestions[type].push(newQuestion as any); // Use 'as any' to bypass strict type checking for this dynamic push
    updateSessionData({ questions: newQuestions });
  };

  return (
    <div className="bg-white p-4 sm:p-8 rounded-lg shadow-xl w-full border border-blue-100">
      <h2 className="text-2xl font-bold text-blue-700 mb-6">Create New Session - Step 1: Details & Questions</h2>
      <form onSubmit={(e) => { e.preventDefault(); nextStep(); }} className="space-y-6">
        
        {/* Session Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-blue-700 mb-1">Session Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={sessionData.name}
              onChange={handleChange}
              required
              className="w-full bg-white text-blue-900 rounded-md border border-blue-200 focus:ring-blue-400 focus:border-blue-400 p-2 shadow-sm"
              placeholder="e.g., Q2 Volunteer Meetup"
            />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-blue-700 mb-1">Date</label>
            <input
              id="date"
              type="date"
              name="date"
              value={sessionData.date}
              onChange={handleChange}
              required
              className="w-full bg-white text-blue-900 rounded-md border border-blue-200 focus:ring-blue-400 focus:border-blue-400 p-2 shadow-sm"
            />
          </div>
        </div>

        {/* Questions Section */}
        <div className="space-y-4 rounded-md bg-blue-50 p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-700">Feedback Questions</h3>
            
            {/* Initial Question */}
            <div>
                <label className="block text-sm font-medium text-blue-600">Initial Rating Question</label>
                {sessionData.questions.initial.map((q, i) => (
          <input
                        key={`initial-${i}`}
            type="text"
                        value={q.text}
                        onChange={(e) => handleQuestionChange('initial', i, e.target.value)}
                        className="mt-1 w-full bg-white text-blue-900 rounded-md border border-blue-200 focus:ring-blue-400 focus:border-blue-400 p-2 shadow-sm"
                    />
            ))}
          </div>

            {/* Positive Questions */}
            <div>
                <label className="block text-sm font-medium text-blue-600">Positive Follow-up Questions</label>
                {sessionData.questions.positive.map((q, i) => (
                    <input
                        key={`positive-${i}`}
                        type="text"
                        value={q.text}
                        onChange={(e) => handleQuestionChange('positive', i, e.target.value)}
                        placeholder={`Positive Question ${i + 1}`}
                        className="mt-1 w-full bg-white text-blue-900 rounded-md border border-blue-200 focus:ring-blue-400 focus:border-blue-400 p-2 mb-2 shadow-sm"
                    />
                ))}
                <button type="button" onClick={() => addQuestion('positive')} className="text-sm text-blue-500 hover:text-blue-700 font-semibold mt-2">+ Add Positive Question</button>
        </div>

            {/* Negative Questions */}
        <div>
                <label className="block text-sm font-medium text-blue-600">Negative Follow-up Questions</label>
                {sessionData.questions.negative.map((q, i) => (
                    <input
                        key={`negative-${i}`}
                        type="text"
                        value={q.text}
                        onChange={(e) => handleQuestionChange('negative', i, e.target.value)}
                        placeholder={`Negative Question ${i + 1}`}
                        className="mt-1 w-full bg-white text-blue-900 rounded-md border border-blue-200 focus:ring-blue-400 focus:border-blue-400 p-2 mb-2 shadow-sm"
                    />
                ))}
                <button type="button" onClick={() => addQuestion('negative')} className="text-sm text-blue-500 hover:text-blue-700 font-semibold mt-2">+ Add Negative Question</button>
            </div>
        </div>
        
        {/* Navigation */}
      <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 shadow">
                Next: Add Attendees
        </button>
      </div>
    </form>
    </div>
  );
} 