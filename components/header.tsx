'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">BuddyAI | Corporate Wellness</span>
          </Link>
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link href="/features" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</Link>
              <Link href="/how-it-works" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">How it works</Link>
              <Link href="/chat" className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                Try Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
