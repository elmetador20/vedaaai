# VedaAI – AI Assessment Creator

VedaAI is a production-quality, full-stack application that enables teachers to create assignments and generate well-structured, print-ready question papers using Gemini AI. The application implements background job processing via BullMQ/Redis and real-time status updates via WebSockets (Socket.io) to deliver a responsive, SaaS-like user experience.

## Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, Zustand, React Hook Form + Zod
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose), Redis, BullMQ, Socket.io
- **AI**: Gemini 1.5 Flash API (Structured JSON output configuration)

## Architecture Overview

```
                  ┌──────────────────────┐
                  │   Next.js Frontend   │
                  └──────────┬───────────┘
                             │ (REST / WebSockets)
                             ▼
                  ┌──────────────────────┐
                  │   Express Backend    │
                  └──────────┬───────────┘
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   ┌─────────────────┐               ┌─────────────────┐
   │  MongoDB (DB)   │               │ Redis (BullMQ)  │
   └─────────────────┘               └────────┬────────┘
                                              │ (Job Queue)
                                              ▼
                                     ┌─────────────────┐
                                     │  BullMQ Worker  │
                                     └────────┬────────┘
                                              │ (Structured AI Call)
                                              ▼
                                     ┌─────────────────┐
                                     │   Gemini API    │
                                     └─────────────────┘
```

## Setup Instructions

### Prerequisites
Make sure you have Node.js (v18+), MongoDB, and Redis installed and running.
- **MongoDB**: Runs on port `27017`
- **Redis**: Runs on port `6379`

### 1. Clone the repository and install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/vedaai
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
GEMINI_API_KEY=your_gemini_api_key_here
```

Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/assignments
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 3. Run the applications

```bash
# Start backend in development mode (from backend folder)
npm run dev

# Start frontend in development mode (from frontend folder)
npm run dev
```

The frontend will run on [http://localhost:3000](http://localhost:3000). The backend runs on [http://localhost:5000](http://localhost:5000).

---

## Detailed Flows

### Queue & Background Job Flow

1. **Submission**: The teacher fills the form. The frontend performs client-side validation using Zod and sends a `POST /api/assignments` request to the backend.
2. **Enqueueing**: The backend creates an assignment record in MongoDB with `status: 'queued'`. It then pushes a job containing the assignment's MongoDB `_id` into the BullMQ `assignment-queue` hosted on Redis. The API immediately responds with the created assignment metadata.
3. **Worker Processing**: The BullMQ worker picks up the job asynchronously:
   - Sets status to `'processing'` (emits WS update).
   - Sets status to `'generating'` (emits WS update) and calls the Gemini API using the prompt compiler.
   - Sets status to `'formatting'` (emits WS update) and structures the parsed JSON data.
   - Saves the final structured questions inside the assignment's document in MongoDB, updates the status to `'completed'`, and emits the final WS event.

### WebSocket Real-time Updates Flow

- Upon submitting the form, the frontend redirects to `/progress/[id]` and establishes a Socket.io connection.
- The client sends a `join` event with the `assignmentId` room name.
- As the BullMQ worker transitions the job through states (`processing` -> `generating` -> `formatting` -> `completed`), it calls the `notifyClient(assignmentId, payload)` helper.
- The helper broadcasts a `status-update` event with the current status state to the room.
- The frontend Zustand store listens to these events, updating the step tracker UI in real time. Upon receiving the `completed` status, it immediately routes the user to the exam paper view.

---

## AI Prompting & JSON Output Format

To ensure structural parsing without direct text rendering, the Gemini API is configured with `responseMimeType: 'application/json'`. The prompt provides strict rules on section naming, MCQ options (exactly 4 options), marks per question, and difficulty tags.

Expected JSON schema returned by Gemini:
```json
{
  "sections": [
    {
      "title": "Section A: Multiple Choice Questions",
      "instruction": "Attempt all questions. Choose the most correct option.",
      "questions": [
        {
          "text": "What is the unit of electrical resistance?",
          "difficulty": "Easy",
          "marks": 1,
          "options": ["Ampere", "Ohm", "Volt", "Watt"]
        }
      ]
    }
  ]
}
```

---

## Deployment Instructions

1. **Backend**: Deploy on platforms like Render, Railway, Heroku, or AWS EC2. Make sure to configure the environment variables and ensure Redis (e.g. Upstash Redis) and MongoDB (MongoDB Atlas) connections are secure.
2. **Frontend**: Deploy the Next.js app on Vercel or Netlify. Set the `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_WS_URL` to point to the deployed backend.
