'use client';

import { useEffect } from 'react';

export function WebRTCCompatibilityLoader() {
  useEffect(() => {
    // Load the comprehensive WebRTC compatibility system as soon as the component mounts
    import('@/lib/webrtc-compatibility').then(() => {
      console.log('🔧 WebRTC compatibility system loaded from layout');
    });
  }, []);

  return null;
}