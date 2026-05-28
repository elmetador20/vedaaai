# VedaAI – AI Assessment Creator

VedaAI is a production-grade, full-stack application that enables teachers to create assignments and generate well-structured, print-ready question papers using Gemini AI. The application implements background job processing via BullMQ/Redis and real-time status updates via WebSockets (Socket.io) to deliver a responsive, SaaS-like user experience.

---

## 1. Architecture Overview

VedaAI is built as a decoupled, multi-tiered application designed for scalability, rate-limit resilience, and real-time responsiveness.

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

### System Components:
1. **Next.js Client (Frontend)**: A responsive interface featuring Zustand state management, Zod schemas, and a custom Socket.io real-time listener room.
2. **Express Server (Backend)**: Provides Rest APIs for assignment management, initiates BullMQ job sequences, and mounts the Socket.io WebSocket server.
3. **MongoDB Database**: Stores client assignment metadata, question arrays, answer keys, explanations, and raw extracted document texts.
4. **Upstash Redis Cluster**: Orchestrates background task synchronization and serves as the state backplane for BullMQ.
5. **BullMQ Background Worker**: Processes high-latency generation jobs asynchronously, implementing transient retry policies and rate-limit backoffs.
6. **Gemini AI Service**: Leverages `gemini-2.5-flash` and `gemini-2.0-flash` models with schema validation for structured response generation.

---

## 2. Our Technical Approach

To achieve a production-ready application, we made key architectural choices to handle standard distributed-systems challenges:

### A. Rate Limiting & Queue Resilience (Gemini Cooldown)
* **Challenge**: The Gemini API enforces a strict rate limit per minute. If multiple users generate assessments simultaneously, standard API requests would crash or fail.
* **Our Solution**: We decoupled the generation logic using **BullMQ**. If Gemini throws a rate-limit error (e.g., HTTP 429), the worker enters a transient cooldown using an exponential backoff retry policy `{ attempts: 5, backoff: { type: 'fixed', delay: 60000 } }`. 
* **Soft Deletions Handling**: If a user deletes an assignment while the generation task is still queued in Redis, the worker catches the missing document gracefully, cancels the job, and avoids redundant external API calls or database crashes.

### B. Context-Bound Document Assessments (Browser-Side PDF Extraction)
* **Challenge**: When uploading PDFs, sending raw binary files to Gemini wastes input token bandwidth and can result in generic question generation.
* **Our Solution**: We integrated `pdfjs-dist` on the frontend. When a PDF is selected, it is parsed page-by-page directly in the browser. The raw text is extracted and stored in the database (`fileContent`), and Gemini is given a strict prompt constraint instructing it to generate questions **exclusively** from the extracted text.

### C. Client-Side PDF Generation
* **Challenge**: Standard browser `window.print()` triggers system print dialogues, which often render headers, footers, and inconsistent paddings depending on the browser settings.
* **Our Solution**: We implemented browser-level PDF compilation using `html2canvas-pro` and `jspdf`. Clicking "Save as PDF" captures the DOM elements of the A4 question paper, renders them onto a canvas at high resolution, and builds a clean paginated PDF saved directly to the user's disk.

### D. Pixel-Perfect Figma Implementation
* **Responsive Drawer & Tabs**: Implemented a floating mobile tab bar, custom icon assets (`/home2.png`, `/Calendar.png`, etc.) with state-based active styling (using CSS brightness-invert filters), and a slide-out hamburger drawer for mobile viewports.
* **Adaptive Empty States**: Designed visual-first empty states that render graphic files (`/center.png` and `/text.png`) instead of unstyled textual placeholders, and dynamically hide search/filter bars when the system is empty.

---

## 3. Setup Instructions

### Prerequisites
Make sure you have Node.js (v18+), MongoDB, and Redis installed and running.
* **MongoDB**: Runs on port `27017` (local development) or MongoDB Atlas (production).
* **Redis**: Runs locally on port `6379` or via Upstash Redis.

### 1. Install Dependencies
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
MONGO_URI=mongodb+srv://ahmedsharique250:Sharique250@cluster0.tkbpp5p.mongodb.net/?appName=Cluster0
REDIS_URL=rediss://default:gQAAAAAAAhDsAAIgcDI5YTdlOWRhNWRjMzE0NjBhYjVjY2M3ZWZjMjYyNDZmZA@simple-roughy-135404.upstash.io:6379
REDIS_PORT=6379
GEMINI_API_KEY=your_gemini_api_key
FRONTEND_URL=http://localhost:3000
```

Create a `.env.local` file in the `frontend/` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_WS_URL=http://localhost:5000
```

### 3. Start Development Servers
```bash
# In the backend directory
npm run dev

# In the frontend directory
npm run dev
```

The frontend will run on [http://localhost:3000](http://localhost:3000) and the backend runs on [http://localhost:5000](http://localhost:5000).

---

## 4. Deployment Instructions

### Backend Deployment (e.g. Railway, Render)
1. Set the root directory of the service to `/backend`.
2. Add your environment variables:
   - `MONGO_URI` (MongoDB Atlas connection string)
   - `REDIS_URL` (Upstash Redis URL)
   - `GEMINI_API_KEY` (Gemini API token)
   - `FRONTEND_URL` (Your deployed frontend domain for CORS handling)

### Frontend Deployment (e.g. Vercel)
1. Configure your build settings in Vercel to build the `/frontend` subfolder.
2. In Vercel Project Settings, add the environment variables:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.railway.app`
   - `NEXT_PUBLIC_WS_URL` = `https://your-backend.railway.app`
3. Vercel will automatically compile, run `npm run build`, and host the site.
