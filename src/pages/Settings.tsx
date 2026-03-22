import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Key, Tag, Plus, X, PlayCircle, Loader2, Save, Eye } from 'lucide-react';
import { classifyEmail } from '../services/claudeService';

export const Settings: React.FC = () => {
  const { claudeApiKey, setClaudeApiKey, keywords, setKeywords, visibleCategories, setVisibleCategories } = useAppStore();
  
  const [keyInput, setKeyInput] = useState(claudeApiKey);
  const [newKeyword, setNewKeyword] = useState('');
  
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testResult, setTestResult] = useState<string>('');

  const handleSaveKey = () => {
    setClaudeApiKey(keyInput);
    alert('API Key saved to your local browser storage.');
  };

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim().toLowerCase())) {
      setKeywords([...keywords, newKeyword.trim().toLowerCase()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const handleToggleCategory = (category: 'TO_REGISTER' | 'APPROVED' | 'WAITLISTED' | 'REJECTED') => {
    setVisibleCategories({
      ...visibleCategories,
      [category]: !visibleCategories[category],
    });
  };

  const handleTestApi = async () => {
    if (!keyInput) {
      alert("Please enter a Gemini API key first.");
      return;
    }
    
    setTestStatus('loading');
    setTestResult('');
    
    try {
      const sampleEmail = {
        subject: "Congratulations! You've been selected for the AI Hackathon",
        senderName: "Hackathon Team",
        senderEmail: "team@hackathon.com",
        body: "We are thrilled to let you know that your application was approved. We will see you next weekend on October 25th."
      };
      
      const res = await classifyEmail(keyInput, sampleEmail);
      
      if (res) {
        setTestResult(JSON.stringify(res, null, 2));
        setTestStatus('success');
      } else {
        setTestResult('Failed to parse response or returned null.');
        setTestStatus('error');
      }
    } catch (error: any) {
      setTestResult(error?.message || 'Unknown error occurred');
      setTestStatus('error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="bg-white dark:bg-gray-800 px-6 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6 rounded-t-xl border-x border-t transition-colors duration-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Application Settings</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Configure your API keys and categorization filters. All data is kept local in your browser.
        </p>
      </div>

      {/* Gemini API Key Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center mb-4">
            <Key className="h-5 w-5 mr-2 text-gray-400" />
            Gemini API Configuration
          </h3>
          
          <div className="max-w-xl">
            <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Gemini API Key
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input
                type="password"
                id="api-key"
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border-gray-300 dark:border-gray-600 border bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
                placeholder="AIza..."
              />
              <button
                type="button"
                onClick={handleSaveKey}
                className="inline-flex items-center px-4 py-2 border border-transparent border-l-0 rounded-r-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Key
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Stored securely in localStorage. Used only to classify fetched emails.
            </p>
          </div>

          {/* Test Gemini API */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Test Connection</h4>
            <div className="flex items-start space-x-4">
              <button
                onClick={handleTestApi}
                disabled={testStatus === 'loading'}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {testStatus === 'loading' ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-gray-500" />
                ) : (
                  <PlayCircle className="h-4 w-4 mr-2 text-blue-500" />
                )}
                Run Sample Test
              </button>
            </div>
            
            {testResult && (
              <div className={`mt-4 p-4 rounded-md text-sm font-mono overflow-auto max-h-48 border ${
                testStatus === 'success' 
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800' 
                  : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
              }`}>
                <pre>{testResult}</pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keywords Setup Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center mb-4">
            <Tag className="h-5 w-5 mr-2 text-gray-400" />
            Email Filter Keywords
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Only emails matching one of these keywords in their Subject will be fetched and processed.
          </p>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {keywords.map((keyword) => (
              <span 
                key={keyword} 
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300"
              >
                {keyword}
                <button
                  type="button"
                  onClick={() => handleRemoveKeyword(keyword)}
                  className="flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 hover:text-blue-500 dark:hover:text-blue-200 focus:outline-none"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddKeyword} className="max-w-xs flex items-center">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              className="flex-1 block w-full min-w-0 rounded-l-md sm:text-sm border-gray-300 dark:border-gray-600 border focus:ring-blue-500 focus:border-blue-500 px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors"
              placeholder="Add new keyword..."
            />
            <button
              type="submit"
              disabled={!newKeyword.trim()}
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-md bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Category Visibility Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm sm:rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white flex items-center mb-4">
            <Eye className="h-5 w-5 mr-2 text-gray-400" />
            Dashboard Categories
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Toggle which classification columns are visible on the Dashboard.
          </p>
          
          <div className="space-y-4">
            {([
              { key: 'TO_REGISTER' as const, label: 'To Register', color: 'bg-indigo-500' },
              { key: 'APPROVED' as const, label: 'Approved', color: 'bg-green-500' },
              { key: 'WAITLISTED' as const, label: 'Waitlisted / Pending', color: 'bg-yellow-500' },
              { key: 'REJECTED' as const, label: 'Rejected', color: 'bg-red-500' },
            ]).map((cat) => (
              <label key={cat.key} className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center">
                  <span className={`w-3 h-3 rounded-full ${cat.color} mr-3`}></span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {cat.label}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={visibleCategories[cat.key]}
                    onChange={() => handleToggleCategory(cat.key)}
                  />
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 dark:peer-checked:bg-blue-500"></div>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
};
