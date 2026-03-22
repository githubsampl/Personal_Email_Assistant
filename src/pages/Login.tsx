import React, { useEffect, useState } from 'react';
import { Mail, AlertCircle, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { initGoogleApi, requestGmailAccess, fetchUserProfile } from '../services/authService';

export const Login: React.FC = () => {
  const { setAuth } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Check if client ID is configured
    const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
    if (!clientId) {
      setError('Please configure VITE_GMAIL_CLIENT_ID in your .env file');
      setIsInitializing(false);
      return;
    }

    // Initialize Google API
    initGoogleApi(clientId)
      .then(() => setIsInitializing(false))
      .catch((err) => {
        console.error('Failed to init Google API:', err);
        setError('Failed to initialize Google Services. Make sure you are online.');
        setIsInitializing(false);
      });
  }, []);

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const clientId = import.meta.env.VITE_GMAIL_CLIENT_ID;
      
      const token = await requestGmailAccess(clientId);
      const profile = await fetchUserProfile(token);
      
      setAuth(token, {
        name: profile.name,
        email: profile.email,
        picture: profile.picture
      });
      
    } catch (err: any) {
      console.error('Login error:', err);
      // User closed the popup, or real error
      if (err?.error !== 'popup_closed_by_user' && err?.error !== 'access_denied') {
         setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
            <Mail className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Personal Email Assistant
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Smart event registration and waitlist tracking
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100 dark:border-gray-700 transition-colors duration-200">
          
          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-start text-sm">
              <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col items-center">
            <button
              onClick={handleLogin}
              disabled={loading || isInitializing || !!error?.includes('VITE_GMAIL_CLIENT_ID')}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || isInitializing ? (
                <Loader2 className="w-5 h-5 animate-spin mr-3 text-gray-400" />
              ) : (
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              {isInitializing ? 'Loading...' : 'Connect Google Workspace'}
            </button>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
              Requires Gmail read-only access to automatically classify your registration emails.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
