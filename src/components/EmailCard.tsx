import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, ChevronUp, 
  User, ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';
import type { Email } from '../store/useAppStore';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface EmailCardProps {
  email: Email;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColor = (category?: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('approved') || cat.includes('confirmed') || cat.includes('success')) return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 border border-green-200 dark:border-green-800';
    if (cat.includes('wait') || cat.includes('pending')) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800';
    if (cat.includes('reject') || cat.includes('cancel')) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 border border-red-200 dark:border-red-800';
    if (cat.includes('register') || cat.includes('apply')) return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
    if (cat.includes('bank') || cat.includes('pay') || cat.includes('transaction')) return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
  };

  const statusOrCategory = email.status || email.category;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden mb-3"
    >
      <div 
        className="p-4 cursor-pointer flex items-start justify-between"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start space-x-4 flex-1">
          <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700 flex-shrink-0">
            <User className="w-5 h-5" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 truncate max-w-[150px]">
                {email.senderName}
              </span>
              <span className="text-[10px] text-gray-400">•</span>
              <span className="text-[10px] text-gray-400">
                {format(new Date(email.dateReceived), 'MMM d, h:mm a')}
              </span>
            </div>
            
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
              {email.subject}
            </h3>

            {email.aiSummary && (
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                {email.aiSummary}
              </p>
            )}

            {statusOrCategory && (
              <div className="mt-3 flex items-center space-x-2">
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center shadow-sm",
                  getCategoryColor(statusOrCategory)
                )}>
                  {statusOrCategory.toLowerCase().includes('approved') || statusOrCategory.toLowerCase().includes('confirmed') ? '✅ ' : ''}
                  {statusOrCategory.toLowerCase().includes('wait') || statusOrCategory.toLowerCase().includes('pending') ? '⏳ ' : ''}
                  {statusOrCategory.toLowerCase().includes('reject') ? '❌ ' : ''}
                  {statusOrCategory.toLowerCase().includes('register') ? '📋 ' : ''}
                  {statusOrCategory}
                </span>
                
                {email.importantDetail && (
                  <div className="flex items-center ml-2">
                    <span className="text-[10px] bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 font-bold shadow-sm">
                      {email.importantDetail}
                    </span>
                  </div>
                )}
                
                {email.urgency?.toLowerCase() === 'high' && (
                  <div className="flex items-center ml-2" title="High Urgency">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 animate-pulse" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button className="ml-4 p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-50/50 dark:bg-gray-950/20 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="p-4 space-y-4">
              <div className="text-xs text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {email.body.substring(0, 300)}...
              </div>
              
              <div className="flex justify-end pt-2">
                <a 
                  href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  View full email on Gmail
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
