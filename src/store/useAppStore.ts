import { create } from 'zustand';

export interface Email {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  dateReceived: string;
  body: string;
  snippet?: string;
  
  // Dynamic AI Classification (Context-aware)
  category?: string;
  aiSummary?: string;
  importantDetail?: string;
  urgency?: string;
  status?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  emails?: Email[];
  thought?: string;
  isGreeting?: boolean;
  actionItems?: string[];
  keyFindings?: string[];
  followUpOptions?: string[];
  classification?: {
    approved?: string[];
    waitlisted?: string[];
    rejected?: string[];
    [key: string]: any;
  };
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

interface AppState {
  // Auth State
  isAuthenticated: boolean;
  accessToken: string | null;
  userProfile: { name: string; email: string; picture: string } | null;
  
  // Settings
  darkMode: boolean;
  
  // Data
  chats: ChatSession[];
  currentChatId: string | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  
  // Actions
  setAuth: (token: string, profile: any) => void;
  logout: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
  createNewChat: () => void;
  loadChat: (id: string) => void;
  deleteChat: (id: string) => void;
  setLoading: (loading: boolean) => void;
  toggleDarkMode: () => void;
}

const savedChats = JSON.parse(localStorage.getItem('antigravity_chats') || '[]');
const savedDarkMode = localStorage.getItem('darkMode') === 'true';

if (savedDarkMode) {
  document.documentElement.classList.add('dark');
}

// User requested: "Every time the app loads/refreshes, automatically start a fresh empty chat"
// We do NOT load `antigravity_current_chat_id` here on purpose.

export const useAppStore = create<AppState>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  userProfile: null,
  
  darkMode: savedDarkMode,
  
  chats: savedChats,
  currentChatId: null,
  chatHistory: [], // starts empty
  isLoading: false,
  
  setAuth: (token, profile) => set({ isAuthenticated: true, accessToken: token, userProfile: profile }),
  logout: () => {
    localStorage.removeItem('antigravity_chats');
    localStorage.removeItem('antigravity_current_chat_id');
    set({ isAuthenticated: false, accessToken: null, userProfile: null, chats: [], currentChatId: null, chatHistory: [] });
  },
  
  addChatMessage: (msg) => set((state) => {
    let currentId = state.currentChatId;
    let newChats = [...state.chats];
    const now = new Date().toISOString();

    if (!currentId) {
      currentId = Date.now().toString();
      const newSession: ChatSession = {
        id: currentId,
        title: msg.content.substring(0, 40) + (msg.content.length > 40 ? '...' : ''),
        messages: [msg],
        createdAt: now,
        updatedAt: now
      };
      newChats.unshift(newSession); // Add to top
    } else {
      const chatIndex = newChats.findIndex(c => c.id === currentId);
      if (chatIndex >= 0) {
        newChats[chatIndex] = {
          ...newChats[chatIndex],
          messages: [...newChats[chatIndex].messages, msg],
          updatedAt: now
        };
      }
    }

    if (newChats.length > 50) {
      newChats = newChats.slice(0, 50);
    }

    localStorage.setItem('antigravity_chats', JSON.stringify(newChats));
    localStorage.setItem('antigravity_current_chat_id', currentId);
    
    const activeMessages = newChats.find(c => c.id === currentId)?.messages || [];
    return { chats: newChats, currentChatId: currentId, chatHistory: activeMessages };
  }),
  
  clearChat: () => set((state) => {
    if (state.currentChatId) {
      const newChats = state.chats.filter(c => c.id !== state.currentChatId);
      localStorage.setItem('antigravity_chats', JSON.stringify(newChats));
      localStorage.removeItem('antigravity_current_chat_id');
      return { chats: newChats, currentChatId: null, chatHistory: [] };
    }
    return state;
  }),

  createNewChat: () => set(() => {
    localStorage.removeItem('antigravity_current_chat_id');
    return { currentChatId: null, chatHistory: [] };
  }),

  loadChat: (id) => set((state) => {
    const chat = state.chats.find(c => c.id === id);
    if (!chat) return state;
    localStorage.setItem('antigravity_current_chat_id', id);
    return { currentChatId: id, chatHistory: chat.messages };
  }),

  deleteChat: (id) => set((state) => {
    const newChats = state.chats.filter(c => c.id !== id);
    localStorage.setItem('antigravity_chats', JSON.stringify(newChats));
    if (state.currentChatId === id) {
      localStorage.removeItem('antigravity_current_chat_id');
      return { chats: newChats, currentChatId: null, chatHistory: [] };
    }
    return { chats: newChats };
  }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
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
}));
