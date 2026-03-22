import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Update browser tab title
  useEffect(() => {
    document.title = 'Antigravity';
  }, []);

  // Close sidebar on mobile when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden transition-colors duration-200">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 bg-[#f9f9f9] dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        ${isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        {/* Mobile Header Toggle */}
        <div className="lg:hidden h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md sticky top-0 z-30 justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-black tracking-tighter uppercase ml-2 text-gray-900 dark:text-white text-sm">Antigravity</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto w-full relative">
          <Outlet />
        </div>
      </main>

    </div>
  );
};
