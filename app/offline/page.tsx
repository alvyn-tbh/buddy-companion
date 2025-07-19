import React from 'react';
import Link from 'next/link';

export const metadata = {
  title: 'Offline - AI Companion Chatbot',
  description: 'You are currently offline. Some features may not be available.',
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M18.364 5.636l-12.728 12.728M7 12h10M7 12a5 5 0 105 5m-5-5a5 5 0 015-5"
              />
            </svg>
          </div>
        </div>

        {/* Title and Description */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          It looks like you're not connected to the internet. Some features may not be available, 
          but you can still browse previously loaded content.
        </p>

        {/* Offline Features */}
        <div className="bg-white rounded-lg p-6 shadow-lg mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            What you can still do:
          </h2>
          
          <ul className="text-left text-gray-600 space-y-2">
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Browse previously visited pages
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              View cached content and information
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Access offline-ready features
            </li>
            <li className="flex items-center">
              <svg className="w-4 h-4 text-yellow-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Messages will sync when you're back online
            </li>
          </ul>
        </div>

        {/* Quick Navigation */}
        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Return to Home
          </Link>
          
          <div className="grid grid-cols-2 gap-3">
            <Link 
              href="/corporate"
              className="bg-white text-indigo-600 py-2 px-4 rounded-lg font-medium border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Work Support
            </Link>
            <Link 
              href="/travel"
              className="bg-white text-indigo-600 py-2 px-4 rounded-lg font-medium border border-indigo-200 hover:bg-indigo-50 transition-colors"
            >
              Travel Help
            </Link>
          </div>
        </div>

        {/* Connection Status */}
        <div className="mt-8 text-sm text-gray-500">
          <p>
            <span className="inline-block w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>
            Connection lost - your data will sync automatically when reconnected
          </p>
        </div>

        {/* Auto-refresh hint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Auto-refresh when connection is restored
              window.addEventListener('online', function() {
                setTimeout(function() {
                  window.location.reload();
                }, 1000);
              });
              
              // Update connection status
              function updateConnectionStatus() {
                const status = document.querySelector('.connection-status');
                if (status) {
                  if (navigator.onLine) {
                    status.innerHTML = '<span class="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>Connected - refreshing...';
                    setTimeout(() => window.location.reload(), 2000);
                  } else {
                    status.innerHTML = '<span class="inline-block w-2 h-2 bg-red-400 rounded-full mr-2 animate-pulse"></span>Connection lost - your data will sync automatically when reconnected';
                  }
                }
              }
              
              window.addEventListener('online', updateConnectionStatus);
              window.addEventListener('offline', updateConnectionStatus);
            `,
          }}
        />
      </div>
    </div>
  );
}