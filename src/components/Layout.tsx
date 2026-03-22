import React, { useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Mail, Settings, LogOut, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Layout: React.FC = () => {
  const { userProfile, logout, emails, darkMode, toggleDarkMode } = useAppStore();
  const location = useLocation();
  
  const approvedCount = emails.filter(e => e.status === 'APPROVED').length;

  // Update browser tab title with approved count
  useEffect(() => {
    if (approvedCount > 0) {
      document.title = `(${approvedCount}) Email Assistant`;
    } else {
      document.title = 'Email Assistant';
    }
  }, [approvedCount]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white hidden sm:block">Email Assistant</span>
              </div>
              <div className="sm:-my-px sm:ml-6 flex sm:space-x-8">
                <Link 
                  to="/" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    location.pathname === '/' 
                      ? 'border-blue-500 text-gray-900 dark:text-white' 
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                  {approvedCount > 0 && (
                    <span className="ml-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {approvedCount}
                    </span>
                  )}
                </Link>
                <Link 
                  to="/settings" 
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    location.pathname === '/settings'
                      ? 'border-blue-500 text-gray-900 dark:text-white'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {userProfile && (
                <div className="flex items-center flex-shrink-0">
                  <div className="hidden sm:flex flex-col items-end mr-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{userProfile.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{userProfile.email}</span>
                  </div>
                  {userProfile.picture ? (
                    <img className="h-8 w-8 rounded-full border border-gray-200 dark:border-gray-600" src={userProfile.picture} alt="" />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-800 dark:text-blue-200 font-bold">
                      {userProfile.name.charAt(0)}
                    </div>
                  )}
                  <button
                    onClick={logout}
                    className="ml-4 p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>
    </div>
  );
};
