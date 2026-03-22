import React from 'react';
import { EmailCard } from './EmailCard';
import type { Email, Status } from '../store/useAppStore';

interface ColumnProps {
  title: string;
  status: Status;
  emails: Email[];
  colorClass: string;
  darkColorClass: string;
  icon: React.ReactNode;
  onCardClick: (email: Email) => void;
}

export const Column: React.FC<ColumnProps> = ({ title, emails, colorClass, darkColorClass, icon, onCardClick }) => {
  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl h-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className={`p-4 ${colorClass} ${darkColorClass} flex justify-between items-center border-b border-gray-200/50 dark:border-gray-700/50 transition-colors duration-200`}>
        <div className="flex items-center font-semibold text-gray-800 dark:text-gray-200">
          {icon}
          <span className="ml-2">{title}</span>
        </div>
        <div className="bg-white/50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-sm font-medium">
          {emails.length}
        </div>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scrollbar">
        {emails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-6 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <span className="opacity-50">{icon}</span>
            </div>
            <p className="text-sm">No emails match this status</p>
          </div>
        ) : (
          emails.map((email) => (
            <EmailCard key={email.id} email={email} onClick={onCardClick} />
          ))
        )}
      </div>
    </div>
  );
};
