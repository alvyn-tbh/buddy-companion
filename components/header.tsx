'use client';

import React, { memo, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

const MemoizedHeader = memo(function Header({ title = "Buddy AI" }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Optimize navigation items with useMemo
  const navigationItems = React.useMemo(() => [
    { href: '/', label: 'Home', isActive: pathname === '/' },
    { href: '/corporate', label: 'Corporate', isActive: pathname?.startsWith('/corporate') },
    { href: '/travel', label: 'Travel', isActive: pathname?.startsWith('/travel') },
    { href: '/emotional', label: 'Emotional', isActive: pathname?.startsWith('/emotional') },
    { href: '/culture', label: 'Culture', isActive: pathname?.startsWith('/culture') },
  ], [pathname]);

  return (
    <header className="relative z-50 w-full bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            {title}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map(({ href, label, isActive }) => (
              <Link
                key={href}
                href={href}
                className={`font-medium transition-colors duration-200 ${
                  isActive
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              {navigationItems.map(({ href, label, isActive }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`font-medium transition-colors duration-200 ${
                    isActive
                      ? 'text-indigo-600 font-semibold'
                      : 'text-gray-700 hover:text-indigo-600'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});

export default MemoizedHeader;
