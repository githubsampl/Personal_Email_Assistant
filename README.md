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

## Deployment
Deployed on **Vercel**. Every push to the `main` branch triggers an automatic redeploy. Ensure your Vercel project has the following environment variables configured:
- `VITE_GROQ_API_KEY`
- `VITE_GMAIL_CLIENT_ID`

> **Note:** After deploying, update the **Authorized JavaScript Origins** and **Authorized Redirect URIs** in your Google Cloud Console OAuth 2.0 client to include your Vercel deployment URL.

## Changelog

### v1.2.0 — 2026-03-24
- **Fix: Raw CSS appearing in email bodies** — Rewrote `emailParser.ts` body extraction logic to correctly detect `text/html` MIME type at every recursion level and strip all `<style>`, `<script>`, and HTML tags before passing content to the AI. Also added proper HTML entity decoding (`&nbsp;`, `&amp;`, `&lt;`, `&gt;`, `&quot;`).
- **Fix: Multipart email recursion order** — The parser now correctly prioritises `text/plain` → `multipart/*` nesting → `text/html` fallback, preventing raw HTML from leaking into responses for complex MIME structures.

### v1.1.0 — 2026-03-22
- Rebuilt AI architecture with 5-Phase `Think → Fetch → Read → Reason → Respond` pipeline.
- Added ChatGPT-style collapsible conversation sidebar with chronological grouping.
- Dynamic response components: Key Findings tables, ⚡ Action Items, Follow-Up Prompt Chips.

### v1.0.0 — 2026-03-15
- Initial release: Gmail OAuth, email fetching, Groq-powered AI chat dashboard.
