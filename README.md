Project: Feedback/Admin Portal

Overview
This project is a feedback and admin portal for managing sessions and collecting feedback from attendees. It uses a Next.js frontend and a Node.js/Express backend with MongoDB. Features include admin authentication, attendee management, feedback forms, and email notifications.

Features
- Admin dashboard for sessions and attendees
- Feedback forms for attendees
- Missed session feedback
- OTP-based feedback authentication
- Email notifications to all registered attendees
- Secure admin login and protected routes

Folder Structure
- backend-js/         Main Node.js/Express backend API
- cfc-fp/cfc-fp/      Next.js frontend app
- node_modules/       Node dependencies (not committed)

Local Setup
1. Clone the repository.
2. Install dependencies:
   - cd backend-js && npm install
   - cd ../cfc-fp/cfc-fp && npm install
3. Create .env files in both backend and frontend folders (see below).
4. Start the backend:
   - cd backend-js && npm start
5. Start the frontend:
   - cd ../cfc-fp/cfc-fp && npm run dev

Deployment
Frontend (Vercel):
- Import the repo on vercel.com
- Set environment variables in the Vercel dashboard
- Deploy

Backend (Render):
- Create a new Web Service on render.com
- Connect the repo and select the backend-js folder
- Set environment variables in the Render dashboard
- Deploy


Contributing
Pull requests are welcome. For major changes, open an issue to discuss what you want to change.

Created by - Harsha Pareek :D

