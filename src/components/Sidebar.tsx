import { Link, useLocation } from 'react-router-dom';
import { Plus, MessageSquare, Trash2, LogOut, Sun, Moon, Sparkles, X, Settings } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { isToday, isYesterday, differenceInDays } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const { chats, currentChatId, loadChat, createNewChat, deleteChat, userProfile, logout, darkMode, toggleDarkMode } = useAppStore();
  const location = useLocation();

  const handleNewChat = () => {
    createNewChat();
    // Navigate home if we are in settings
    if (onClose) onClose();
  };

  const handleLoadChat = (id: string) => {
    loadChat(id);
    if (onClose) onClose();
  };

  const todayChats = chats.filter(c => isToday(new Date(c.updatedAt)));
  const yesterdayChats = chats.filter(c => isYesterday(new Date(c.updatedAt)));
  const previousChats = chats.filter(c => {
    const d = new Date(c.updatedAt);
    return !isToday(d) && !isYesterday(d) && differenceInDays(new Date(), d) <= 7;
  });

  const renderGroup = (title: string, groupChats: typeof chats) => {
    if (groupChats.length === 0) return null;
    return (
      <div className="mb-6">
        <h3 className="px-3 text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">{title}</h3>
        <div className="space-y-0.5">
          {groupChats.map(chat => (
            <div 
              key={chat.id}
              className={cn(
                "group relative flex items-center px-3 py-2 text-sm rounded-xl cursor-pointer transition-colors",
                currentChatId === chat.id && location.pathname === '/'
                  ? "bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white border-l-2 border-blue-500 rounded-l-none"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
              )}
              onClick={() => handleLoadChat(chat.id)}
            >
              <MessageSquare className="w-4 h-4 mr-3 flex-shrink-0 opacity-50" />
              <span className="truncate flex-1 font-medium">{chat.title}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all ml-1 flex-shrink-0"
                title="Delete Chat"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#f9f9f9] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-hidden text-gray-900 dark:text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-sm font-black tracking-tighter uppercase">Antigravity</span>
        </div>
        
        {/* Mobile Close */}
        <button className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg" onClick={onClose}>
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* New Chat Button */}
      <div className="px-3 pb-4">
        <Link to="/" onClick={handleNewChat} className="block">
          <button className="w-full flex items-center justify-between px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold shadow-sm transition-all group">
            <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">New Chat</span>
            <Plus className="w-4 h-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </button>
        </Link>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-2 pb-4 scroll-smooth">
        {chats.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400 italic">
            No previous chats yet
          </div>
        ) : (
          <>
            {renderGroup("Today", todayChats)}
            {renderGroup("Yesterday", yesterdayChats)}
            {renderGroup("Previous 7 Days", previousChats)}
          </>
        )}
      </div>

      {/* Footer / User Profile */}
      <div className="p-4 bg-white/50 dark:bg-gray-950/50 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <Link 
            to="/settings" 
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Settings"
            onClick={onClose}
          >
            <Settings className="w-5 h-5" />
          </Link>
          <button
            onClick={toggleDarkMode}
            className="text-gray-500 hover:text-gray-900 dark:hover:text-white p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Toggle Theme"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
        
        {userProfile && (
          <div className="flex items-center justify-between group bg-white dark:bg-gray-900 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-3 overflow-hidden">
              <img src={userProfile.picture} alt="" className="w-8 h-8 rounded-full ring-2 ring-gray-100 dark:ring-gray-800" />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-bold truncate line-clamp-1">{userProfile.name}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{userProfile.email}</span>
              </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex-shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
