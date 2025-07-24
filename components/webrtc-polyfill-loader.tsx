'use client';

import { useEffect } from 'react';

export function WebRTCPolyfillLoader() {
  useEffect(() => {
    // Load the polyfill as soon as the component mounts
    import('@/lib/webrtc-polyfill').then(({ applyWebRTCPolyfill }) => {
      applyWebRTCPolyfill();
      console.log('🔧 WebRTC polyfill loaded from layout');
    });
  }, []);

  return null;
}