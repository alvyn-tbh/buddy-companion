'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

export default function Header(props: { title: string, chat_url: string, features_url: string, how_it_works_url: string }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node) &&
      buttonRef.current &&
      !buttonRef.current.contains(event.target as Node)
    ) {
      setDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{props.title}</span>
          </Link>
          <div className="hidden md:block relative">
            <div className="ml-10 flex items-center space-x-4">
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Services
                </button>
                {isDropdownOpen && (
                  <div ref={dropdownRef} className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                    <Link href="/corporate" className="block px-4 py-2 text-gray-600 hover:bg-indigo-100">
                      Corporate Companion
                    </Link>
                    <Link href="/travel" className="block px-4 py-2 text-gray-600 hover:bg-indigo-100">
                      Travel Companion
                    </Link>
                    <Link href="/emotional" className="block px-4 py-2 text-gray-600 hover:bg-indigo-100">
                      Emotional Companion
                    </Link>
                    <Link href="/culture" className="block px-4 py-2 text-gray-600 hover:bg-indigo-100">
                      Culture & Communication Companion
                    </Link>
                  </div>
                )}
              </div>
              <Link href={props.features_url} className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</Link>
              <Link href={props.how_it_works_url} className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">How it works</Link>
              <Link href={props.chat_url} className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                Try Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
