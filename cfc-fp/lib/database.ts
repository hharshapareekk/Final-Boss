export type Session = {
  id: string;
  name: string;
  description: string;
  date: string;
  feedbackSubmitted: boolean;
  imagePath?: string;  // Added optional imagePath
};

export type User = {
  id: string;
  name: string;
  sessions: Session[];
  imagePath?: string;  // Added optional imagePath
};

export const users: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    sessions: [
      {
        id: 'session1',
        name: 'Introduction to Next.js',
        description: 'Learn the basics of Next.js framework',
        date: '2023-06-15',
        feedbackSubmitted: false
      },
      {
        id: 'session4',
        name: 'Advanced Mongodb Patterns',
        description: 'Deep dive into React component patterns',
        date: '2023-06-20',
        feedbackSubmitted: false
      }
    ]
  },
  {
    id: "harsha",
    name: "Harsha",
    imagePath: "/images/harsha.jpg",
    sessions: [
      {
        id: "session1",
        name: "Intro to Programming",
        date: "2024-05-15",
        description: "Learn programming fundamentals",
        feedbackSubmitted: false
      },
      {
        id: "session3",
        name: "Advanced React",
        date: "2024-06-10",
        description: "Deep dive into React hooks",
        feedbackSubmitted: false
      }
    ]
  },
  {
    id: "user2",
    name: "Jane Sen",
    imagePath: "/images/user2.jpg",
    sessions: [
      {
        id: "session3",
        name: "Advanced Node",
        date: "2024-06-10",
        description: "Deep dive into React hooks",
        feedbackSubmitted: false
      }
    ]
  }
];