'use client'

import MultiStepCreateSession from "./components/MultiStepCreateSession";

const preAddedQuestions = [
  'How satisfied were you with the session?',
  'What did you like most about the session?',
  'What can be improved for future sessions?',
  'Would you recommend this session to others?',
];

export default function CreateSessionPage() {
  return <MultiStepCreateSession />;
} 