# VedaAI Assessment Creator

A full-stack, AI-powered assessment creator designed to simplify the workflow for teachers. It allows educators to input parameters (due date, difficulty, subjects) and automatically generates structured question papers using LLMs.

This project was built to satisfy the VedaAI Full Stack Engineering Assignment.

#### Frontend : https://vedaai-assessment-creator-frontend.vercel.app/

## 🚀 Key Features

*   **Intelligent AI Generation:** Converts user input into a highly structured prompt to generate strictly formatted JSON from the Gemini API. Avoids raw text dumping.
*   **Asynchronous Job Processing:** Heavy AI generation tasks are entirely decoupled from the main request thread using a worker architecture, preventing HTTP timeouts.
*   **Real-time WebSockets:** Utilizes `Socket.io` to instantly notify the client when their assessment has finished generating or failed, eliminating the need for manual polling.
*   **Robust Frontend State:** Built with **Zustand** for lightweight, predictable global state management across the multi-step creation wizard and dashboard.
*   **Figma-Matched UI/UX:** Responsive, clean interface directly inspired by the provided Figma designs.
*   **PDF Export:** Includes tailored `@media print` CSS so teachers can hit "Download / Print" and receive a cleanly formatted, ready-to-distribute exam paper without messy web artifacts.
*   **Error Resiliency:** Built-in exponential backoff retry mechanisms for gracefully handling LLM API rate limits.

## 🏗️ Architecture Overview

The system is split into two primary components communicating via REST and WebSockets:

### Frontend (Next.js + TypeScript)
*   **Framework:** Next.js (App Router bypassed for SPAs, client-side rendering)
*   **State Management:** Zustand
*   **Styling:** Custom CSS implementing the design system
*   **Real-time:** Socket.io-client

### Backend (Node.js + Express)
*   **Language:** TypeScript
*   **Database:** MongoDB (via Mongoose)
*   **Queue/Workers:** Architecture ready for BullMQ + Redis. (Currently optimized for in-process async execution for ease of local development and testing on Windows, but the modular worker pattern remains intact).
*   **AI Integration:** `@google/genai` (Gemini 2.5 Flash)

### Request Lifecycle
1.  **Submit:** Client submits assessment parameters to the `/api/assignments` endpoint.
2.  **Queue:** The backend saves the assignment with a `queued` status and pushes a job to the asynchronous generation queue. It immediately returns a `201 Created`.
3.  **Process:** The worker picks up the job, builds the contextual prompt, and communicates with the Gemini API to request a strict JSON output.
4.  **Complete:** The worker updates the MongoDB document with the parsed result sections (or marks it `failed`).
5.  **Notify:** The backend emits an event via Socket.io to the specific room for that assignment ID. The frontend instantly re-fetches the updated data and transitions the UI from the "Generating..." spinner to the rendered exam paper.

## ⚙️ Local Setup Instructions

### Prerequisites
*   Node.js (v18+)
*   MongoDB Cluster URL (e.g., Atlas)
*   Gemini API Key

### 1. Clone & Install
\`\`\`bash
git clone <your-repo-url>
cd VedaAI-main

# Install dependencies for both backend and frontend workspaces
npm install
\`\`\`

### 2. Environment Variables
Create a `.env` file in `apps/backend/`:
\`\`\`env
PORT=5001
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/vedaai
GEMINI_API_KEY=your_gemini_api_key
REDIS_URL=redis://127.0.0.1:6379 # Optional: If BullMQ is enabled
FRONTEND_ORIGIN=http://localhost:3000
\`\`\`

Create a `.env.local` file in `apps/frontend/`:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001
\`\`\`

### 3. Run Development Servers
You will need two terminal windows.

**Terminal 1 (Backend):**
\`\`\`bash
cd apps/backend
npm run dev
\`\`\`

**Terminal 2 (Frontend):**
\`\`\`bash
cd apps/frontend
npm run dev
\`\`\`

Navigate to `http://localhost:3000` to view the application.

## 💎 Bonus Features Implemented (High Signal)
*   **Download as PDF:** Optimized print stylesheet to render the UI as a physical exam paper.
*   **Action Bar & Regeneration:** Graceful error handling allowing the user to simply click "Regenerate" if the LLM fails or hits a rate limit.
*   **Dynamic Tagging:** Color-coded difficulty badges (Easy, Moderate, Hard) injected into the UI dynamically based on the AI response.
