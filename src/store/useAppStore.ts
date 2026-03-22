import { create } from 'zustand';

export type Status = 'TO_REGISTER' | 'APPROVED' | 'WAITLISTED' | 'REJECTED' | 'UNCLASSIFIED';

export interface Email {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  dateReceived: string;
  body: string;
  
  // Classification fields
  eventName?: string | null;
  eventDate?: string | null;
  status: Status;
  reason?: string;
  actionRequired?: boolean;
  registrationLink?: string | null;
}

interface AppState {
  // Auth State
  isAuthenticated: boolean;
  accessToken: string | null;
  userProfile: { name: string; email: string; picture: string } | null;
  
  // Settings
  claudeApiKey: string;
  keywords: string[];
  darkMode: boolean;
  visibleCategories: { TO_REGISTER: boolean; APPROVED: boolean; WAITLISTED: boolean; REJECTED: boolean };
  
  // Data
  emails: Email[];
  isLoading: boolean;
  isClassifying: boolean;
  
  // Actions
  setAuth: (token: string, profile: any) => void;
  logout: () => void;
  setClaudeApiKey: (key: string) => void;
  setKeywords: (keywords: string[]) => void;
  setEmails: (emails: Email[]) => void;
  updateEmail: (id: string, updates: Partial<Email>) => void;
  removeEmail: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setClassifying: (classifying: boolean) => void;
  toggleDarkMode: () => void;
  setVisibleCategories: (categories: { TO_REGISTER: boolean; APPROVED: boolean; WAITLISTED: boolean; REJECTED: boolean }) => void;
}

// Load initial state from localStorage if available
const savedApiKey = localStorage.getItem('claudeApiKey') || '';
const savedKeywords = JSON.parse(localStorage.getItem('keywords') || '["registration", "application", "event", "waitlist", "confirmed", "rejected", "selected", "not selected", "congratulations", "unfortunately", "register now", "apply now", "submit", "invitation", "invite", "hackathon", "workshop", "conference", "meetup"]');
const savedEmails = JSON.parse(localStorage.getItem('emails') || '[]');
const savedDarkMode = localStorage.getItem('darkMode') === 'true';
const savedCategories = JSON.parse(localStorage.getItem('visibleCategories') || '{"TO_REGISTER":true,"APPROVED":true,"WAITLISTED":true,"REJECTED":true}');

// Apply dark mode class on load
if (savedDarkMode) {
  document.documentElement.classList.add('dark');
}

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  userProfile: null,
  
  claudeApiKey: savedApiKey,
  keywords: savedKeywords,
  darkMode: savedDarkMode,
  visibleCategories: savedCategories,
  
  emails: savedEmails,
  isLoading: false,
  isClassifying: false,
  
  setAuth: (token, profile) => set({ isAuthenticated: true, accessToken: token, userProfile: profile }),
  logout: () => {
    localStorage.removeItem('emails');
    set({ isAuthenticated: false, accessToken: null, userProfile: null, emails: [] });
  },
  
  setClaudeApiKey: (key) => {
    localStorage.setItem('claudeApiKey', key);
    set({ claudeApiKey: key });
  },
  
  setKeywords: (keywords) => {
    localStorage.setItem('keywords', JSON.stringify(keywords));
    set({ keywords });
  },
  
  setEmails: (emails) => {
    localStorage.setItem('emails', JSON.stringify(emails));
    set({ emails });
  },
  
  updateEmail: (id, updates) => set((state) => {
    const newEmails = state.emails.map(email => email.id === id ? { ...email, ...updates } : email);
    localStorage.setItem('emails', JSON.stringify(newEmails));
    return { emails: newEmails };
  }),
  
  removeEmail: (id) => set((state) => {
    const newEmails = state.emails.filter(email => email.id !== id);
    localStorage.setItem('emails', JSON.stringify(newEmails));
    return { emails: newEmails };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  setClassifying: (classifying) => set({ isClassifying: classifying }),
  
  toggleDarkMode: () => set((state) => {
    const newMode = !state.darkMode;
    localStorage.setItem('darkMode', String(newMode));
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { darkMode: newMode };
  }),
  
  setVisibleCategories: (categories) => {
    localStorage.setItem('visibleCategories', JSON.stringify(categories));
    set({ visibleCategories: categories });
  },
}));
