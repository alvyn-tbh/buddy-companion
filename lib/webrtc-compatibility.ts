/**
 * WebRTC Compatibility Utility
 * Ensures RTCPeerConnection.getConfiguration is available for Azure Speech SDK
 */

// ---- FINAL, BULLET-PROOF PATCH ----
if (typeof window !== 'undefined' && typeof RTCPeerConnection !== 'undefined') {
  if (typeof RTCPeerConnection.prototype.getConfiguration !== 'function') {
    RTCPeerConnection.prototype.getConfiguration = function () {
      // Minimal valid configuration – enough for Azure SDK
      return {
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'balanced',
        rtcpMuxPolicy: 'require',
        certificates: []
      } as RTCConfiguration;
    };
    console.log('✅ RTCPeerConnection.prototype.getConfiguration patched globally');
  }
}

// Import webrtc-adapter first
import 'webrtc-adapter';

// Extensive debugging and aggressive patching
if (typeof window !== 'undefined') {
  console.log('🔍 WebRTC Compatibility: Starting comprehensive debugging...');
  
  // Log browser info
  console.log('🌐 Browser:', navigator.userAgent);
  console.log('🔧 RTCPeerConnection available:', typeof RTCPeerConnection !== 'undefined');
  
  if (typeof RTCPeerConnection !== 'undefined') {
    // Test the original RTCPeerConnection
    console.log('🧪 Testing original RTCPeerConnection...');
    try {
      const testPc = new RTCPeerConnection();
      console.log('✅ RTCPeerConnection created successfully');
      console.log('🔍 getConfiguration type:', typeof testPc.getConfiguration);
      console.log('🔍 getConfiguration exists:', 'getConfiguration' in testPc);
      // Removed methods logging to prevent illegal invocation error
      // Removed prototype methods logging to prevent illegal invocation error
      
      if (typeof testPc.getConfiguration === 'function') {
        console.log('✅ getConfiguration method is available');
        try {
          const config = testPc.getConfiguration();
          console.log('✅ getConfiguration() works, returned:', config);
        } catch (e) {
          console.error('❌ getConfiguration() threw error:', e);
        }
      } else {
        console.error('❌ getConfiguration method is missing!');
      }
      
      testPc.close();
    } catch (e) {
      console.error('❌ Failed to create test RTCPeerConnection:', e);
    }
  }
}

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
          (PatchedRTCPeerConnection as unknown as Record<string, unknown>)[prop] = 
            (OriginalRTCPeerConnection as unknown as Record<string, unknown>)[prop];
        } catch {
          // Some properties might be read-only, ignore silently
        }
      }
    }
    
    // Replace the global constructor
    (window as Window & { RTCPeerConnection: typeof RTCPeerConnection }).RTCPeerConnection = 
      PatchedRTCPeerConnection as unknown as typeof OriginalRTCPeerConnection;
    
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
  document.head.appendChild = function<T extends Node>(node: T): T {
    const result = originalAppendChild.call(this, node) as T;
    
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

// Global RTCPeerConnection interceptor for Azure Speech SDK
if (typeof window !== 'undefined' && typeof RTCPeerConnection !== 'undefined') {
  console.log('🔧 Setting up global RTCPeerConnection interceptor...');
  
  // Store the original constructor
  const OriginalRTCPeerConnection = window.RTCPeerConnection;
  let connectionCounter = 0;
  
  // Create an intercepting constructor
  function InterceptedRTCPeerConnection(configuration?: RTCConfiguration) {
    connectionCounter++;
    console.log(`🔄 RTCPeerConnection #${connectionCounter} created by:`, new Error().stack);
    console.log(`📋 Configuration passed:`, configuration);
    
    // Create the original instance
    const pc = new OriginalRTCPeerConnection(configuration);
    
    // Force add getConfiguration if it doesn't exist
    if (typeof pc.getConfiguration !== 'function') {
      console.warn(`⚠️ RTCPeerConnection #${connectionCounter} missing getConfiguration, patching...`);
      
      // Store the configuration for retrieval
      const storedConfig = configuration || {
        iceServers: [],
        iceTransportPolicy: 'all' as RTCIceTransportPolicy,
        bundlePolicy: 'balanced' as RTCBundlePolicy,
        rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy
      };
      
      // Add the method
      pc.getConfiguration = function() {
        console.log(`📤 getConfiguration() called on RTCPeerConnection #${connectionCounter}`);
        return storedConfig;
      };
      
      console.log(`✅ RTCPeerConnection #${connectionCounter} patched with getConfiguration`);
    } else {
      console.log(`✅ RTCPeerConnection #${connectionCounter} already has getConfiguration`);
    }
    
    // Test the method immediately
    try {
      const testConfig = pc.getConfiguration();
      console.log(`🧪 RTCPeerConnection #${connectionCounter} getConfiguration test:`, testConfig);
    } catch (e) {
      console.error(`❌ RTCPeerConnection #${connectionCounter} getConfiguration test failed:`, e);
    }
    
    return pc;
  }
  
  // Copy all static properties and methods
  Object.setPrototypeOf(InterceptedRTCPeerConnection, OriginalRTCPeerConnection);
  Object.defineProperty(InterceptedRTCPeerConnection, 'prototype', {
    value: OriginalRTCPeerConnection.prototype,
    writable: false
  });
  
  // Copy static methods
  for (const prop of Object.getOwnPropertyNames(OriginalRTCPeerConnection)) {
    if (prop !== 'prototype' && prop !== 'length' && prop !== 'name') {
      try {
        (InterceptedRTCPeerConnection as unknown as Record<string, unknown>)[prop] = 
          (OriginalRTCPeerConnection as unknown as Record<string, unknown>)[prop];
      } catch {
        // Some properties might be read-only
      }
    }
  }
  
  // Replace the global constructor
  (window as Window & { RTCPeerConnection: typeof RTCPeerConnection }).RTCPeerConnection = 
    InterceptedRTCPeerConnection as unknown as typeof OriginalRTCPeerConnection;
    
  console.log('🔄 Global RTCPeerConnection interceptor installed');
  
  // Monitor for Azure Speech SDK script loading
  const originalAppendChild = document.head.appendChild;
  document.head.appendChild = function<T extends Node>(node: T): T {
    const result = originalAppendChild.call(this, node) as T;
    
    if (node instanceof HTMLScriptElement) {
      if (node.src.includes('csspeech') || node.src.includes('speech.sdk') || node.src.includes('aka.ms')) {
        console.log('🎯 Azure Speech SDK script detected:', node.src);
        node.addEventListener('load', () => {
          console.log('📥 Azure Speech SDK loaded, verifying RTCPeerConnection...');
          // Re-test after SDK loads
          try {
            const postSdkTest = new RTCPeerConnection();
            console.log('🧪 Post-SDK RTCPeerConnection test - getConfiguration type:', typeof postSdkTest.getConfiguration);
            postSdkTest.close();
          } catch (e) {
            console.error('❌ Post-SDK RTCPeerConnection test failed:', e);
          }
        });
      }
    }
    
    return result;
  };
} 

// WINDOW-LEVEL PROPERTY INTERCEPTOR
if (typeof window !== 'undefined') {
  console.log('🔒 WINDOW INTERCEPT: Setting up window.RTCPeerConnection property interceptor');
  
  // Get the current value
  let currentRTCPeerConnection = window.RTCPeerConnection;
  
  // Define a property that always ensures getConfiguration exists
  Object.defineProperty(window, 'RTCPeerConnection', {
    get() {
      console.log('📖 WINDOW INTERCEPT: RTCPeerConnection accessed');
      return currentRTCPeerConnection;
    },
    set(newValue) {
      console.log('📝 WINDOW INTERCEPT: RTCPeerConnection being replaced, applying patches...');
      currentRTCPeerConnection = newValue;
      
      // Ensure getConfiguration exists on the new value's prototype
      if (currentRTCPeerConnection && currentRTCPeerConnection.prototype) {
        if (typeof currentRTCPeerConnection.prototype.getConfiguration !== 'function') {
          console.log('⚠️ WINDOW INTERCEPT: New RTCPeerConnection missing getConfiguration, patching...');
          currentRTCPeerConnection.prototype.getConfiguration = function() {
            console.log('📤 WINDOW INTERCEPT getConfiguration called');
            return {
              iceServers: [],
              iceTransportPolicy: 'all' as RTCIceTransportPolicy,
              bundlePolicy: 'balanced' as RTCBundlePolicy,
              rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy,
              certificates: []
            };
          };
          console.log('✅ WINDOW INTERCEPT: Patch applied to new RTCPeerConnection');
        }
      }
    },
    enumerable: true,
    configurable: true
  });
  
  console.log('✅ WINDOW INTERCEPT: Property interceptor installed');
}