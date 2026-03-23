# Antigravity: Personal Email Assistant

An autonomous AI-powered dashboard that acts as your personal email assistant, inspired by Claude.ai's MCP Gmail connector. It connects securely to your Gmail instance, understands natural language queries, and uses a highly-optimized 5-Phase reasoning pipeline (powered by the blazing-fast free **Groq API**) to accurately locate, read, and summarize your emails without hitting context limits.

## ✨ Core Features
- **5-Phase Agent Architecture:** Executes a precise `Think → Fetch → Read → Reason → Respond` reasoning loop. This securely isolates targeted metadata fetching from full HTML-stripped body extraction, fitting massive inboxes effortlessly into Groq's fast token limit window.
- **ChatGPT-Style Interactive Sidebar:** Automatically saves all active conversations dynamically. Includes a sleek collapsible sidebar grouping historical threads chronologically by Today, Yesterday, and Previous 7 Days.
- **Dynamic Response Components:** The assistant autonomously renders actionable UI components, including bulleted **Key Findings** tables, highlighted **Action Items (⚡)**, and intelligent, clickable **Follow-Up Prompt Chips**.
- **100% Client-Side Architecture:** No backend server or central database required. All authentication flows, access tokens, and chat history reside securely inside your local browser memory.

## Setup Instructions

### 1. Prerequisites
- Node.js installed locally
- A Google Cloud Project with the Gmail API enabled
- A free Groq API Key (from `console.groq.com`)

### 2. Environment Variables
Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=gsk_your_groq_api_token_here
VITE_GMAIL_CLIENT_ID=your_google_cloud_oauth_client_id_here
```

### 3. Running the App
```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Tech Stack
- Frontend: **React + Vite + TypeScript**
- Styling: **Tailwind CSS + Framer Motion**
- Intelligence: **Groq API (Llama 3.3 70B)**
- Data Management: **Zustand**
- Icons: **Lucide React**
- Auth: **Google Identity Services (Gmail API)**
