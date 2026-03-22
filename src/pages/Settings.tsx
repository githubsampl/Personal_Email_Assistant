import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Trash2, Mail } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Settings: React.FC = () => {
  const { 
    userProfile, clearChat, chatHistory 
  } = useAppStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-gray-500 dark:text-gray-400">Configure your autonomous assistant.</p>
      </motion.div>

      {/* Gmail Connection */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Gmail Access</h3>
              <p className="text-xs text-gray-500">Authorized as {userProfile?.email}</p>
            </div>
          </div>
          <button className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center">
            <RefreshCcw className="w-3 h-3 mr-1.5" />
            Reconnect
          </button>
        </div>
        <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30 rounded-2xl p-4">
           <p className="text-xs text-green-700 dark:text-green-400 leading-relaxed">
             Antigravity uses read-only access to analyze your emails securely.
           </p>
        </div>
      </section>

      {/* Data Management */}
      <section className="bg-white dark:bg-gray-900 rounded-3xl border border-red-50 dark:border-red-900/20 p-8 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Data Privacy</h3>
            <p className="text-xs text-gray-500">
              {chatHistory.length} messages in memory.
            </p>
          </div>
          <button 
            onClick={clearChat}
            disabled={chatHistory.length === 0}
            className="flex items-center space-x-2 px-5 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe Memory</span>
          </button>
        </div>
      </section>
    </div>
  );
};
