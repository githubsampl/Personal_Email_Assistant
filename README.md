# Personal Email Assistant

An AI-powered dashboard that connects to your Gmail, finds registration or event emails, and uses the Gemini API to classify them as Approved, Waitlisted, or Rejected.

## Features
- **Gmail Integration:** OAuth login to securely read your inbox.
- **AI Classification:** Uses Google GenAI's Gemini 2.5 Flash to accurately determine email status and extract event details.
- **Kanban Dashboard:** Clean, responsive UI with filtering, searching, and CSV Export.
- **100% Client-Side:** No backend database. All tokens and cached classifications live in your browser's localStorage.

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- A Google Cloud Project with the Gmail API enabled
- An Google GenAI API Key

### 2. Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com).
2. Create a new project.
3. Enable the **Gmail API**.
4. Set up the **OAuth Consent Screen** (User type: External, add yourself as a Test User).
5. Scopes to add: `https://www.googleapis.com/auth/gmail.readonly`
6. Go to Credentials > Create Credentials > **OAuth client ID**.
7. Application type: **Web application**.
8. Authorized JavaScript origins: `http://localhost:5173` (and any deployment URLs).
9. Copy the **Client ID**. Note: You don't need the Client Secret for client-side implicit flows using Google Identity Services.

### 3. Environment Variables
Create a `.env` file in the root of the project with:

```env
VITE_GMAIL_CLIENT_ID=your_google_client_id_here
```

*(Note: The Gemini API key is entered directly in the app's Settings page contextually to avoid committing it.)*

### 4. Running the App
```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Tech Stack
- React + Vite + TypeScript
- Tailwind CSS
- Zustand (State Management)
- Lucide React (Icons)
- Google Identity Services
- Google GenAI SDK (`@google/genai`)
