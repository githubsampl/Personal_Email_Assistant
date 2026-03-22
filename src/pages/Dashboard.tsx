import React, { useState, useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { Email, Status } from '../store/useAppStore';
import { Column } from '../components/Column';
import { CheckCircle, Clock, XCircle, Megaphone, RefreshCw, Search, Download, CalendarDays, Filter } from 'lucide-react';
import { SidePanel } from '../components/SidePanel';
import { fetchLatestEmails, filterEmailsByKeywords } from '../services/gmailService';
import { classifyEmailsInBatches } from '../services/claudeService';

// Skeleton card for loading states
const SkeletonCard: React.FC = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
    </div>
    <div className="flex items-center mb-3 space-x-2">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
    </div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mt-1.5"></div>
  </div>
);

// Skeleton column for loading states
const SkeletonColumn: React.FC<{ title: string; colorClass: string; darkColorClass: string; icon: React.ReactNode }> = ({ title, colorClass, darkColorClass, icon }) => (
  <div className="flex flex-col bg-gray-50 dark:bg-gray-800/50 rounded-xl h-full overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors duration-200">
    <div className={`p-4 ${colorClass} ${darkColorClass} flex justify-between items-center border-b border-gray-200/50 dark:border-gray-700/50`}>
      <div className="flex items-center font-semibold text-gray-800 dark:text-gray-200">
        {icon}
        <span className="ml-2">{title}</span>
      </div>
      <div className="bg-white/50 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 px-2.5 py-0.5 rounded-full text-sm font-medium">
        —
      </div>
    </div>
    <div className="flex-1 p-3 space-y-3">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  </div>
);

const STATUS_OPTIONS: { value: 'ALL' | Status; label: string; color: string }[] = [
  { value: 'ALL', label: 'All Statuses', color: 'text-gray-500' },
  { value: 'TO_REGISTER', label: 'To Register', color: 'text-indigo-600 dark:text-indigo-400' },
  { value: 'APPROVED', label: 'Approved', color: 'text-green-600 dark:text-green-400' },
  { value: 'WAITLISTED', label: 'Waitlisted', color: 'text-yellow-600 dark:text-yellow-400' },
  { value: 'REJECTED', label: 'Rejected', color: 'text-red-600 dark:text-red-400' },
];

export const Dashboard: React.FC = () => {
  const { 
    emails, setEmails, isLoading, isClassifying, 
    setLoading, setClassifying, accessToken, claudeApiKey, keywords,
    visibleCategories
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [syncProgress, setSyncProgress] = useState<{current: number, total: number} | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | Status>('ALL');

  const handleSync = async () => {
    if (!accessToken) {
      alert("Please login first.");
      return;
    }
    if (!claudeApiKey) {
      alert("Please set your Gemini API Key in Settings first.");
      return;
    }

    try {
      setLoading(true);
      
      const rawEmails = await fetchLatestEmails(accessToken, 50);
      
      const existingIds = new Set(emails.map(e => e.id));
      const newEmails = rawEmails.filter(e => !existingIds.has(e.id));
      const relevantEmails = filterEmailsByKeywords(newEmails, keywords);

      if (relevantEmails.length === 0) {
        setLoading(false);
        return;
      }

      setLoading(false);
      setClassifying(true);
      setSyncProgress({ current: 0, total: relevantEmails.length });

      const classifiedEmails = await classifyEmailsInBatches(
        claudeApiKey, 
        relevantEmails,
        (_batch, current, total) => {
          setSyncProgress({ current, total });
        }
      );

      setEmails([...classifiedEmails, ...emails]);
      
    } catch (error) {
      console.error(error);
      alert('Failed to sync emails. Check console.');
    } finally {
      setLoading(false);
      setClassifying(false);
      setSyncProgress(null);
    }
  };

  const handleExportCSV = () => {
    if (emails.length === 0) return;
    
    const headers = ['Event Name', 'Status', 'Sender', 'Date', 'Event Date', 'Reason', 'Registration Link'];
    const csvContent = [
      headers.join(','),
      ...emails.map(e => [
        `"${(e.eventName || e.subject)?.replace(/"/g, '""')}"`,
        e.status,
        `"${e.senderName?.replace(/"/g, '""')}"`,
        `"${new Date(e.dateReceived).toLocaleDateString()}"`,
        `"${e.eventDate || ''}"`,
        `"${e.reason?.replace(/"/g, '""') || ''}"`,
        `"${e.registrationLink || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'classified_emails.csv';
    link.click();
  };

  const filteredEmails = useMemo(() => {
    let result = emails;
    
    // Search filter
    if (searchQuery) {
      const lowerQ = searchQuery.toLowerCase();
      result = result.filter(e => 
        e.subject.toLowerCase().includes(lowerQ) || 
        e.senderName.toLowerCase().includes(lowerQ) ||
        (e.eventName && e.eventName.toLowerCase().includes(lowerQ))
      );
    }
    
    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter(e => e.status === statusFilter);
    }
    
    // Date range filter
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      result = result.filter(e => new Date(e.dateReceived) >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      result = result.filter(e => new Date(e.dateReceived) <= to);
    }
    
    return result;
  }, [emails, searchQuery, statusFilter, dateFrom, dateTo]);

  const toRegister = filteredEmails.filter(e => e.status === 'TO_REGISTER');
  const approved = filteredEmails.filter(e => e.status === 'APPROVED');
  const waitlisted = filteredEmails.filter(e => e.status === 'WAITLISTED');
  const rejected = filteredEmails.filter(e => e.status === 'REJECTED');

  const showSkeleton = isLoading && emails.length === 0;

  // Count visible columns for responsive grid
  const visibleCount = [visibleCategories.TO_REGISTER, visibleCategories.APPROVED, visibleCategories.WAITLISTED, visibleCategories.REJECTED].filter(Boolean).length;
  const gridCols = visibleCount <= 2 ? `md:grid-cols-${visibleCount}` : visibleCount === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4';

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Actions */}
      <div className="mb-4 flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
        
        <div className="flex items-center space-x-2 w-full lg:w-auto flex-wrap gap-y-2">
          {/* Search */}
          <div className="relative flex-1 lg:w-56 min-w-[180px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
              placeholder="Search events or senders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative min-w-[140px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-4 w-4 text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | Status)}
              className="block w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors appearance-none cursor-pointer"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="hidden xl:flex items-center space-x-2">
            <CalendarDays className="h-4 w-4 text-gray-400 flex-shrink-0" />
            <input
              type="date"
              className="block w-36 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              title="Filter from date"
            />
            <span className="text-gray-400 text-sm">to</span>
            <input
              type="date"
              className="block w-36 px-2 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              title="Filter to date"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(''); setDateTo(''); }}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="flex space-x-3 w-full lg:w-auto flex-shrink-0">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          
          <button
            onClick={handleSync}
            disabled={isLoading || isClassifying}
            className="inline-flex flex-1 lg:flex-none justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${(isLoading || isClassifying) ? 'animate-spin' : ''}`} />
            {isLoading ? 'Fetching...' : isClassifying ? `Classifying ${syncProgress?.current || 0}/${syncProgress?.total || 0}...` : 'Sync New'}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      {isClassifying && syncProgress && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">
            <span>Classifying new emails...</span>
            <span>{Math.round((syncProgress.current / syncProgress.total) * 100)}%</span>
          </div>
          <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5">
            <div 
              className="bg-blue-600 dark:bg-blue-400 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${(syncProgress.current / syncProgress.total) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className={`flex-1 grid grid-cols-1 ${gridCols} gap-4 overflow-hidden pb-4`}>
        {showSkeleton ? (
          <>
            <SkeletonColumn title="To Register" colorClass="bg-indigo-50" darkColorClass="dark:bg-indigo-900/20" icon={<Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />} />
            <SkeletonColumn title="Approved" colorClass="bg-green-50" darkColorClass="dark:bg-green-900/20" icon={<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />} />
            <SkeletonColumn title="Waitlisted / Pending" colorClass="bg-yellow-50" darkColorClass="dark:bg-yellow-900/20" icon={<Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />} />
            <SkeletonColumn title="Rejected" colorClass="bg-red-50" darkColorClass="dark:bg-red-900/20" icon={<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />} />
          </>
        ) : (
          <>
            {visibleCategories.TO_REGISTER && (
              <Column 
                title="To Register" 
                status="TO_REGISTER" 
                emails={toRegister} 
                colorClass="bg-indigo-50"
                darkColorClass="dark:bg-indigo-900/20"
                icon={<Megaphone className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                onCardClick={setSelectedEmail}
              />
            )}
            {visibleCategories.APPROVED && (
              <Column 
                title="Approved" 
                status="APPROVED" 
                emails={approved} 
                colorClass="bg-green-50"
                darkColorClass="dark:bg-green-900/20"
                icon={<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />}
                onCardClick={setSelectedEmail}
              />
            )}
            {visibleCategories.WAITLISTED && (
              <Column 
                title="Waitlisted / Pending" 
                status="WAITLISTED" 
                emails={waitlisted} 
                colorClass="bg-yellow-50"
                darkColorClass="dark:bg-yellow-900/20"
                icon={<Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />}
                onCardClick={setSelectedEmail}
              />
            )}
            {visibleCategories.REJECTED && (
              <Column 
                title="Rejected" 
                status="REJECTED" 
                emails={rejected} 
                colorClass="bg-red-50"
                darkColorClass="dark:bg-red-900/20"
                icon={<XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />}
                onCardClick={setSelectedEmail}
              />
            )}
          </>
        )}
      </div>

      {selectedEmail && (
        <SidePanel 
          email={selectedEmail} 
          onClose={() => setSelectedEmail(null)} 
        />
      )}
    </div>
  );
};
