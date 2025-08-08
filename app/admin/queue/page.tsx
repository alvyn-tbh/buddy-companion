"use client";

import { QueueDashboard } from '@/components/queue-dashboard';
import { AdminNav } from '@/components/admin-nav';

export default function QueueAdminPage() {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        window.location.href = '/admin/login';
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav onLogout={handleLogout} />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Queue Administration</h1>
            <p className="text-gray-600 mt-2">
              Monitor and manage your Bull queues, Redis connections, and system health.
            </p>
          </div>

          <QueueDashboard />
        </div>
      </div>
    </div>
  );
}
