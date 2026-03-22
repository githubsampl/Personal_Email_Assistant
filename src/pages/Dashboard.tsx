import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Send, Sparkles, User, Bot, 
  Terminal, RotateCcw,
  MessageSquare, Loader2
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { runAgentLoop } from '../services/agentService';
import { EmailCard } from '../components/EmailCard';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Dashboard: React.FC = () => {
  const { 
    accessToken, chatHistory, addChatMessage, clearChat, chats, currentChatId
  } = useAppStore();

  const currentChatTitle = chats.find(c => c.id === currentChatId)?.title || "New Chat";

  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

  const [input, setInput] = useState('');
  const [showClearedTooltip, setShowClearedTooltip] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thought, setThought] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const SUGGESTED_PROMPTS = [
    "Which hackathons am I registered for?",
    "Show me bank transaction emails",
    "Any job interview calls this week?",
    "Summarize my travel bookings",
    "What urgent emails need my attention?"
  ];

  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromptIndex((prev) => (prev + 1) % SUGGESTED_PROMPTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isThinking, thought]);

  const handleSubmit = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault();
    const finalInput = overrideInput || input;
    if (!finalInput.trim() || isThinking || !accessToken) return;

    if (!groqApiKey) {
      alert("Missing Groq API Key in .env file.");
      return;
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: finalInput,
      timestamp: new Date().toISOString()
    };

    addChatMessage(userMsg);
    setInput('');
    setIsThinking(true);
    setThought(`Consulting Groq (Llama 3.3)...`);

    try {
      const response = await runAgentLoop({
        apiKey: groqApiKey,
        accessToken,
        userQuery: finalInput,
        history: chatHistory,
        onProgress: (msg: string) => setThought(msg)
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: response.answer,
        timestamp: new Date().toISOString(),
        emails: response.emails,
        isGreeting: response.isGreeting,
        actionItems: response.actionItems,
        keyFindings: response.keyFindings,
        followUpOptions: response.followUpOptions,
        classification: response.classification
      };

      addChatMessage(assistantMsg);
    } catch (error: any) {
      console.error(error);
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `**Error:** ${error.message || "Failed to process query. Please check your API key and connection."}`,
        timestamp: new Date().toISOString()
      };
      addChatMessage(errMsg);
    } finally {
      setIsThinking(false);
      setThought(null);
    }
  };

  const handleClearChat = () => {
    clearChat();
    setShowClearedTooltip(true);
    setTimeout(() => setShowClearedTooltip(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950 items-stretch relative">
      
      {/* Main Chat Header */}
      {chatHistory.length > 0 && (
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800/50 px-6 py-3 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate pr-4">
            {currentChatTitle}
          </span>
          <div className="relative flex-shrink-0">
            <button
              onClick={handleClearChat}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
              title="Clear Chat"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            <AnimatePresence>
              {showClearedTooltip && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs font-medium rounded-lg shadow-xl whitespace-nowrap pointer-events-none"
                >
                  Chat cleared
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-8 space-y-8 pb-10 pt-6 scroll-smooth scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800"
      >
        {!groqApiKey ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-3xl bg-yellow-500 flex items-center justify-center text-white shadow-xl"
            >
              <Terminal className="w-8 h-8" />
            </motion.div>
            <div className="space-y-4 max-w-md">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">API Key Required</h2>
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-2xl text-sm border border-yellow-200 dark:border-yellow-900/50">
                <p className="font-semibold mb-2">Please add your Groq API key to the .env file and restart.</p>
                <div className="font-mono text-xs bg-white dark:bg-black/50 p-2 rounded-lg mt-2 overflow-x-auto text-left">
                  VITE_GROQ_API_KEY=your_key_here
                </div>
              </div>
              <a 
                href="https://console.groq.com/keys" 
                target="_blank" 
                rel="noreferrer"
                className="inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
              >
                Get a free key from Groq Console &rarr;
              </a>
            </div>
          </div>
        ) : chatHistory.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">How can I help you today?</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
                I'm Antigravity, your autonomous AI assistant powered by Groq. Ask me anything about your emails.
              </p>
            </div>
          </div>
        ) : null}

        <AnimatePresence mode="popLayout">
          {chatHistory.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex w-full",
                msg.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              <div className={cn(
                "flex items-start max-w-[90%] md:max-w-[80%] space-x-4",
                msg.role === 'user' && "flex-row-reverse space-x-reverse"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm",
                  msg.role === 'user' ? "bg-blue-600 text-white" : "bg-gray-800 dark:bg-v-gray-700 text-white"
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-3 flex-1 min-w-0">
                  <div className={cn(
                    "rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm",
                    msg.role === 'user' 
                      ? "bg-blue-600 text-white rounded-tr-none" 
                      : "bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none prose prose-sm dark:prose-invert max-w-none"
                  )}>
                    {msg.role === 'assistant' ? (
                      <div className="space-y-4">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        
                        {msg.keyFindings && msg.keyFindings.length > 0 && (
                          <div className="mt-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-xl">
                            <h4 className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-widest mb-2">Key Findings</h4>
                            <ul className="space-y-1.5">
                              {msg.keyFindings.map((kf, i) => (
                                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                  <span className="mr-2 mt-0.5 opacity-50">•</span>
                                  <span>{kf}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {msg.actionItems && msg.actionItems.length > 0 && (
                          <div className="mt-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 p-4 rounded-xl">
                            <h4 className="text-[11px] font-bold text-yellow-800 dark:text-yellow-300 flex items-center mb-2 uppercase tracking-widest">
                              <span className="mr-1.5">⚡</span> Action Required
                            </h4>
                            <ul className="space-y-1.5">
                              {msg.actionItems.map((ai, i) => (
                                <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                  <span className="mr-2 mt-0.5 opacity-50">•</span>
                                  <span>{ai}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                  </div>

                  {msg.thought && (
                    <div className="flex items-start space-x-2 text-[10px] text-gray-400 font-mono italic px-2 bg-gray-50 dark:bg-gray-950/50 py-2 rounded-lg border border-gray-100 dark:border-gray-900">
                      <Terminal className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>{msg.thought}</span>
                    </div>
                  )}

                  {msg.classification && Object.keys(msg.classification).length > 0 && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {Object.entries(msg.classification).map(([status, items]) => (
                        Array.isArray(items) && items.length > 0 && (
                          <div key={status} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800 shadow-sm">
                            <h4 className="text-[11px] font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-2 flex items-center">
                              {status.toLowerCase() === 'approved' ? '✅ ' : ''}
                              {status.toLowerCase() === 'waitlisted' ? '⏳ ' : ''}
                              {status.toLowerCase() === 'pending' ? '⏳ ' : ''}
                              {status.toLowerCase() === 'rejected' ? '❌ ' : ''}
                              {status} ({items.length})
                            </h4>
                            <ul className="space-y-1.5">
                              {items.map((item: any, i: number) => (
                                <li key={i} className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight">
                                  <span className="mr-1.5 inline-block text-gray-300">•</span>
                                  <span>{typeof item === 'string' ? item : item?.subject || item?.name || JSON.stringify(item)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )
                      ))}
                    </div>
                  )}

                  {msg.emails && msg.emails.length > 0 && (
                    <div className="mt-4 grid grid-cols-1 gap-1">
                      {msg.emails.map((email) => (
                        <EmailCard key={email.id} email={email} />
                      ))}
                    </div>
                  )}

                  {msg.followUpOptions && msg.followUpOptions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-2">
                      {msg.followUpOptions.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleSubmit(undefined, opt)}
                          className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-2xl text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors shadow-sm active:scale-95"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {isThinking && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start space-x-4"
            >
              <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-5 py-4 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-3">
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                  <span className="text-sm text-gray-500 animate-pulse">
                    {thought || "Processing..."}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="sticky bottom-0 pb-6 px-4 space-y-4">
        <div className="max-w-3xl mx-auto overflow-hidden h-10 flex items-center justify-center">
           <AnimatePresence mode="wait">
             <motion.button
               key={currentPromptIndex}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               exit={{ y: -20, opacity: 0 }}
               onClick={() => handleSubmit(undefined, SUGGESTED_PROMPTS[currentPromptIndex])}
               className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center space-x-2"
             >
               <Sparkles className="w-3 h-3" />
               <span>Try: "{SUGGESTED_PROMPTS[currentPromptIndex]}"</span>
             </motion.button>
           </AnimatePresence>
        </div>

        <form 
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto group shadow-2xl rounded-3xl overflow-hidden"
        >
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <MessageSquare className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
            placeholder="Ask anything about your emails..."
            className="block w-full pl-14 pr-24 py-5 bg-white dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 focus:border-blue-500 text-gray-900 dark:text-white placeholder-gray-500 text-sm focus:ring-0 transition-all outline-none"
          />
          <div className="absolute inset-y-0 right-3 flex items-center space-x-2">
            <button
              type="submit"
              disabled={!input.trim() || isThinking}

              className={cn(
                "flex items-center space-x-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all",
                input.trim() && !isThinking
                  ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
              )}
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
        
        <div className="flex items-center justify-center space-x-4 text-[10px] text-gray-400">
           <div className="flex items-center">
             <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
             Gmail API Connected
           </div>
           <div className="w-1 h-1 rounded-full bg-gray-600" />
           <span>Groq AI Brain</span>
        </div>
      </div>
    </div>
  );
};
