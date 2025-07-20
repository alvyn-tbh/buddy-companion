'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { UserProfile } from './user-profile';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

export default function Header(props: { title: string }) {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {props.title}
            </span>
          </Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Main Navigation Links */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/features" 
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/how-it-works" 
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                How It Works
              </Link>
              {/* Services Dropdown */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={() => setDropdownOpen(!isDropdownOpen)}
                  className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1"
                  style={{ minHeight: 44 }}
                >
                  Services
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isDropdownOpen && (
                  <div ref={dropdownRef} className="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <Link href="/corporate" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        Corporate Companion
                      </Link>
                      <Link href="/travel" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        Travel Companion
                      </Link>
                      <Link href="/emotional" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        Emotional Companion
                      </Link>
                      <Link href="/culture" className="block px-4 py-2 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                        Culture & Communication
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* User Profile / Login Button */}
            <div className="ml-4">
              <UserProfile />
            </div>
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="h-10 w-10"
              style={{ minWidth: 44, minHeight: 44 }}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/features" 
                className="block px-3 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ minHeight: 44 }}
              >
                Features
              </Link>
              <Link 
                href="/how-it-works" 
                className="block px-3 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ minHeight: 44 }}
              >
                How It Works
              </Link>
              {/* Mobile Services Section */}
              <div className="px-3 py-2">
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Services
                </div>
                <div className="space-y-1">
                  <Link 
                    href="/corporate" 
                    className="block px-3 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md text-sm transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ minHeight: 44 }}
                  >
                    Corporate Companion
                  </Link>
                  <Link 
                    href="/travel" 
                    className="block px-3 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md text-sm transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ minHeight: 44 }}
                  >
                    Travel Companion
                  </Link>
                  <Link 
                    href="/emotional" 
                    className="block px-3 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md text-sm transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ minHeight: 44 }}
                  >
                    Emotional Companion
                  </Link>
                  <Link 
                    href="/culture" 
                    className="block px-3 py-3 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md text-sm transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ minHeight: 44 }}
                  >
                    Culture & Communication
                  </Link>
                </div>
              </div>
              {/* Mobile User Profile */}
              <div className="border-t border-gray-200 pt-4">
                <UserProfile />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
