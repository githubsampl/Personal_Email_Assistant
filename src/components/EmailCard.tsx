import React from 'react';
import { Mail, Calendar, Info, Clock, CheckCircle, XCircle, Megaphone } from 'lucide-react';
import type { Email } from '../store/useAppStore';
import { format } from 'date-fns';

interface EmailCardProps {
  email: Email;
  onClick: (email: Email) => void;
}

export const EmailCard: React.FC<EmailCardProps> = ({ email, onClick }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'TO_REGISTER':
        return { color: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800', icon: <Megaphone className="w-3 h-3 mr-1" /> };
      case 'APPROVED':
        return { color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800', icon: <CheckCircle className="w-3 h-3 mr-1" /> };
      case 'WAITLISTED':
        return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-800', icon: <Clock className="w-3 h-3 mr-1" /> };
      case 'REJECTED':
        return { color: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800', icon: <XCircle className="w-3 h-3 mr-1" /> };
      default:
        return { color: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600', icon: <Info className="w-3 h-3 mr-1" /> };
    }
  };

  const statusConfig = getStatusConfig(email.status);

  return (
    <div 
      onClick={() => onClick(email)}
      className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1 flex-1 pr-2">
          {email.eventName || email.subject}
        </h3>
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusConfig.color} flex-shrink-0`}>
          {statusConfig.icon}
          {email.status === 'TO_REGISTER' ? 'Register' : email.status}
        </span>
      </div>

      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-1">
        <Mail className="w-3 h-3 mr-1 flex-shrink-0" />
        <span className="truncate">{email.senderName}</span>
        <span className="mx-1">•</span>
        <span>{format(new Date(email.dateReceived), 'MMM d, yyyy')}</span>
      </div>

      {email.eventDate && (
        <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-2 bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded inline-flex">
          <Calendar className="w-3 h-3 mr-1" />
          Event: {email.eventDate}
        </div>
      )}

      {email.reason && (
        <p className="text-xs text-gray-600 dark:text-gray-400 italic line-clamp-2 mt-2 border-l-2 border-gray-200 dark:border-gray-600 pl-2">
          "{email.reason}"
        </p>
      )}
    </div>
  );
};
