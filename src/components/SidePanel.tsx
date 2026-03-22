import React, { useState } from 'react';
import type { Email } from '../store/useAppStore';
import { useAppStore } from '../store/useAppStore';
import { X, ExternalLink, RefreshCw, Archive, Link as LinkIcon } from 'lucide-react';
import { classifyEmail } from '../services/claudeService';
import { format } from 'date-fns';

interface SidePanelProps {
  email: Email;
  onClose: () => void;
}

export const SidePanel: React.FC<SidePanelProps> = ({ email, onClose }) => {
  const { claudeApiKey, updateEmail, removeEmail } = useAppStore();
  const [isReclassifying, setIsReclassifying] = useState(false);

  const handleReclassify = async () => {
    if (!claudeApiKey) {
      alert("Gemini API Key missing");
      return;
    }
    try {
      setIsReclassifying(true);
      const newClassification = await classifyEmail(claudeApiKey, email);
      if (newClassification) {
        updateEmail(email.id, newClassification);
      } else {
        alert("Failed to parse Gemini response.");
      }
    } catch (error) {
      alert("Error calling Gemini.");
    } finally {
      setIsReclassifying(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'TO_REGISTER': return 'text-indigo-700 bg-indigo-100 border-indigo-200 dark:text-indigo-300 dark:bg-indigo-900/40 dark:border-indigo-800';
      case 'APPROVED': return 'text-green-700 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/40 dark:border-green-800';
      case 'WAITLISTED': return 'text-yellow-700 bg-yellow-100 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/40 dark:border-yellow-800';
      case 'REJECTED': return 'text-red-700 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/40 dark:border-red-800';
      default: return 'text-gray-700 bg-gray-100 border-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:border-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'TO_REGISTER': return 'To Register';
      case 'WAITLISTED': return 'Waitlisted / Pending';
      default: return status;
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-900/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 pr-4">
            {email.subject}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* Classification Banner */}
          <div className="mb-8 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800/50 p-5 flex flex-col space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1 uppercase tracking-wider">Gemini Classification</h3>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(email.status)}`}>
                  {getStatusLabel(email.status)}
                </span>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={handleReclassify}
                  disabled={isReclassifying}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isReclassifying ? 'animate-spin' : ''}`} />
                  Re-classify
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
              <div>
                <span className="text-gray-500 dark:text-gray-400 block mb-1">Extracted Event Name</span>
                <span className="font-medium text-gray-900 dark:text-white">{email.eventName || 'None detected'}</span>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400 block mb-1">Event Date</span>
                <span className="font-medium text-gray-900 dark:text-white">{email.eventDate || 'None detected'}</span>
              </div>
              {email.registrationLink && (
                <div className="col-span-2 mt-1">
                  <span className="text-gray-500 dark:text-gray-400 block mb-1">Registration Link</span>
                  <a
                    href={email.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
                  >
                    <LinkIcon className="w-3.5 h-3.5 mr-1.5" />
                    {email.registrationLink.length > 50 ? email.registrationLink.slice(0, 50) + '...' : email.registrationLink}
                  </a>
                </div>
              )}
              <div className="col-span-2 mt-2">
                <span className="text-gray-500 dark:text-gray-400 block mb-1">AI Reasoning</span>
                <div className="p-3 bg-white dark:bg-gray-800 rounded border border-blue-100 dark:border-blue-800/50 text-gray-700 dark:text-gray-300 italic">
                  "{email.reason}"
                </div>
              </div>
            </div>
          </div>

          {/* Email Details */}
          <div className="space-y-6">
            <div className="flex justify-between items-start pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold border border-gray-200 dark:border-gray-600">
                  {email.senderName.charAt(0)}
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{email.senderName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">{email.senderEmail}</div>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 px-3 py-1 rounded-full whitespace-nowrap">
                {format(new Date(email.dateReceived), 'MMM d, yyyy h:mm a')}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 border-l-4 border-blue-500 pl-3">Original Message</h4>
              <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-5 rounded-xl border border-gray-200 dark:border-gray-700 whitespace-pre-wrap font-mono text-xs leading-relaxed overflow-x-auto shadow-inner">
                {email.body}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex justify-between items-center space-x-4 shrink-0">
          {email.status === 'TO_REGISTER' && email.registrationLink ? (
            <a
              href={email.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Register Now
            </a>
          ) : (
            <a
              href={`https://mail.google.com/mail/u/0/#inbox/${email.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open in Gmail
            </a>
          )}
          <button
            onClick={() => { removeEmail(email.id); onClose(); }}
            className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-600 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-colors"
          >
            <Archive className="w-4 h-4 mr-2" />
            Mark as Done (Hide)
          </button>
        </div>
        
      </div>
    </>
  );
};
