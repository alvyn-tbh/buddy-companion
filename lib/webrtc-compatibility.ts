/**
 * WebRTC Compatibility Utility
 * Ensures RTCPeerConnection.getConfiguration is available for Azure Speech SDK
 */

// Import webrtc-adapter first
import 'webrtc-adapter';

/**
 * Ensures RTCPeerConnection.getConfiguration is available
 * This must be called before any Azure Speech SDK code loads
 */
export function ensureWebRTCCompatibility(): void {
  if (typeof window === 'undefined' || typeof RTCPeerConnection === 'undefined') {
    return;
  }

  console.log('🔍 WebRTC Compatibility Check: Testing RTCPeerConnection.getConfiguration...');
  
  try {
    // Test if getConfiguration exists
    const testPc = new RTCPeerConnection();
    
    if (typeof testPc.getConfiguration === 'function') {
      console.log('✅ RTCPeerConnection.getConfiguration is available');
      testPc.close();
      return;
    }
    
    testPc.close();
    console.warn('⚠️ RTCPeerConnection.getConfiguration is missing, applying compatibility patch...');
    
    // Store the original constructor
    const OriginalRTCPeerConnection = window.RTCPeerConnection;
    
    // Create a patched constructor
    function PatchedRTCPeerConnection(this: RTCPeerConnection, configuration?: RTCConfiguration) {
      // Create instance with original constructor
      const pc = new OriginalRTCPeerConnection(configuration);
      
      // Store configuration for getConfiguration method
      let storedConfig: RTCConfiguration = configuration || {};
      
      // Add getConfiguration if it doesn't exist
      if (typeof pc.getConfiguration !== 'function') {
        Object.defineProperty(pc, 'getConfiguration', {
          value: function() {
            return {
              iceServers: storedConfig.iceServers || [],
              iceTransportPolicy: storedConfig.iceTransportPolicy || 'all',
              bundlePolicy: storedConfig.bundlePolicy || 'balanced',
              rtcpMuxPolicy: storedConfig.rtcpMuxPolicy || 'require',
              certificates: storedConfig.certificates || []
            } as RTCConfiguration;
          },
          writable: false,
          enumerable: false,
          configurable: true
        });
      }
      
      // Also patch setConfiguration if it exists to update our stored config
      const originalSetConfiguration = pc.setConfiguration;
      if (typeof originalSetConfiguration === 'function') {
        Object.defineProperty(pc, 'setConfiguration', {
          value: function(newConfig: RTCConfiguration) {
            storedConfig = { ...storedConfig, ...newConfig };
            return originalSetConfiguration.call(this, newConfig);
          },
          writable: false,
          enumerable: false,
          configurable: true
        });
      }
      
      return pc;
    }
    
    // Copy prototype and static methods
    PatchedRTCPeerConnection.prototype = OriginalRTCPeerConnection.prototype;
    Object.setPrototypeOf(PatchedRTCPeerConnection, OriginalRTCPeerConnection);
    
    // Copy all static properties and methods
    for (const prop of Object.getOwnPropertyNames(OriginalRTCPeerConnection)) {
      if (prop !== 'prototype' && prop !== 'length' && prop !== 'name') {
        try {
          (PatchedRTCPeerConnection as any)[prop] = (OriginalRTCPeerConnection as any)[prop];
        } catch (e) {
          // Some properties might be read-only
        }
      }
    }
    
    // Replace the global constructor
    (window as any).RTCPeerConnection = PatchedRTCPeerConnection;
    
    // Also patch the prototype directly as a fallback
    if (!OriginalRTCPeerConnection.prototype.getConfiguration) {
      Object.defineProperty(OriginalRTCPeerConnection.prototype, 'getConfiguration', {
        value: function(this: RTCPeerConnection) {
          // Return a basic configuration if called on existing instances
          return {
            iceServers: [],
            iceTransportPolicy: 'all',
            bundlePolicy: 'balanced',
            rtcpMuxPolicy: 'require',
            certificates: []
          } as RTCConfiguration;
        },
        writable: true,
        enumerable: false,
        configurable: true
      });
    }
    
    // Verify the patch worked
    const verifyPc = new RTCPeerConnection();
    if (typeof verifyPc.getConfiguration === 'function') {
      console.log('✅ Successfully patched RTCPeerConnection.getConfiguration');
      
      // Test that it actually works
      try {
        const config = verifyPc.getConfiguration();
        console.log('✅ getConfiguration returns:', config);
      } catch (e) {
        console.error('❌ getConfiguration throws error:', e);
      }
    } else {
      console.error('❌ Failed to patch RTCPeerConnection.getConfiguration');
    }
    verifyPc.close();
    
  } catch (error) {
    console.error('❌ Error during WebRTC compatibility check:', error);
  }
}

// Auto-apply the compatibility fix when this module is imported
ensureWebRTCCompatibility();

// Also ensure it runs before any dynamic script loading
if (typeof window !== 'undefined') {
  // Re-apply the patch after a short delay to catch any late-loading code
  setTimeout(ensureWebRTCCompatibility, 100);
  
  // Monitor for Speech SDK loading
  const originalAppendChild = document.head.appendChild;
  document.head.appendChild = function(node: Node) {
    const result = originalAppendChild.call(this, node);
    
    // If it's a script tag loading the Speech SDK, ensure compatibility after it loads
    if (node instanceof HTMLScriptElement && 
        (node.src.includes('csspeech') || node.src.includes('speech.sdk'))) {
      node.addEventListener('load', () => {
        console.log('🔄 Speech SDK script loaded, re-applying WebRTC compatibility...');
        ensureWebRTCCompatibility();
      });
    }
    
    return result;
  };
} 