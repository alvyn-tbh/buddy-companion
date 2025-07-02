'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Settings, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { toast } from 'sonner';
import Link from 'next/link';

interface UserProfileProps {
  className?: string;
}

export function UserProfile({ className = '' }: UserProfileProps) {
  const { user, signOut, loading } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debug logging
  console.log('UserProfile render:', { user, loading, hasUser: !!user });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignOut = async () => {
    await signOut();
    setShowDropdown(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show loading spinner while auth state is being determined
  if (loading) {
    console.log('UserProfile: Showing loading state');
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  // Show login button when user is not authenticated
  if (!user) {
    console.log('UserProfile: Showing login button - no user');
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button asChild variant="outline" size="sm">
          <Link href="/auth">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Link>
        </Button>
      </div>
    );
  }

  console.log('UserProfile: Showing user profile - user exists');
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <Button
        variant="ghost"
        className="flex items-center gap-2 p-2 h-auto"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar_url} alt={user.name || user.email} />
          <AvatarFallback>
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:block text-left">
          <div className="text-sm font-medium">{user.name || 'User'}</div>
          <div className="text-xs text-gray-500">{user.email}</div>
        </div>
        <ChevronDown className="h-4 w-4" />
      </Button>

      {showDropdown && (
        <Card className="absolute top-full right-0 mt-2 w-80 z-50 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.avatar_url} alt={user.name || user.email} />
                <AvatarFallback>
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{user.name || 'User'}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm text-gray-600">
              <div>Provider: {user.provider || 'email'}</div>
              <div>Member since: {new Date(user.created_at).toLocaleDateString()}</div>
            </div>
            
            <div className="pt-2 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => {
                  setShowDropdown(false);
                  // Add profile settings functionality here
                  toast.info('Profile settings coming soon!');
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                Profile Settings
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleSignOut}
                disabled={loading}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {loading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 