/**
 * WebRTC Polyfill for Azure Speech SDK
 * This module provides a more aggressive approach to ensure RTCPeerConnection.getConfiguration is available
 */

export function applyWebRTCPolyfill(): void {
  if (typeof window === 'undefined') return;

  console.log('🔧 Applying WebRTC polyfill for Azure Speech SDK...');

  // First, ensure RTCPeerConnection exists
  if (typeof RTCPeerConnection === 'undefined') {
    console.error('❌ RTCPeerConnection is not available in this browser');
    return;
  }

  // Store original RTCPeerConnection
  const OriginalRTCPeerConnection = window.RTCPeerConnection;
  
  // Create a wrapper class that ensures getConfiguration is always available
  class PolyfillRTCPeerConnection extends OriginalRTCPeerConnection {
    private _configuration: RTCConfiguration;

    constructor(configuration?: RTCConfiguration) {
      super(configuration);
      this._configuration = configuration || {};
      
      // Ensure getConfiguration exists
      if (!this.getConfiguration) {
        this.getConfiguration = () => this._getConfiguration();
      }
    }

    private _getConfiguration(): RTCConfiguration {
      // Try to use the native method if it exists
      if (super.getConfiguration) {
        try {
          return super.getConfiguration();
        } catch (e) {
          console.warn('Native getConfiguration failed, using fallback', e);
        }
      }

      // Return our stored configuration
      return {
        iceServers: this._configuration.iceServers || [],
        iceTransportPolicy: this._configuration.iceTransportPolicy || 'all',
        bundlePolicy: this._configuration.bundlePolicy || 'balanced',
        rtcpMuxPolicy: this._configuration.rtcpMuxPolicy || 'require',
        iceCandidatePoolSize: this._configuration.iceCandidatePoolSize || 0,
        certificates: this._configuration.certificates || []
      };
    }

    // Override setConfiguration to update our stored config
    setConfiguration(configuration: RTCConfiguration): void {
      this._configuration = { ...this._configuration, ...configuration };
      if (super.setConfiguration) {
        super.setConfiguration(configuration);
      }
    }
  }

  // Copy all static methods and properties
  const propertyNames = Object.getOwnPropertyNames(OriginalRTCPeerConnection);
  for (const prop of propertyNames) {
    if (prop !== 'prototype' && prop !== 'length' && prop !== 'name') {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(OriginalRTCPeerConnection, prop);
        if (descriptor) {
          Object.defineProperty(PolyfillRTCPeerConnection, prop, descriptor);
        }
      } catch (e) {
        // Some properties might not be accessible
      }
    }
  }

  // Replace the global RTCPeerConnection
  window.RTCPeerConnection = PolyfillRTCPeerConnection as any;

  // Also add getConfiguration to the prototype as a fallback
  if (!OriginalRTCPeerConnection.prototype.getConfiguration) {
    OriginalRTCPeerConnection.prototype.getConfiguration = function() {
      console.warn('Using prototype fallback for getConfiguration');
      return {
        iceServers: [],
        iceTransportPolicy: 'all',
        bundlePolicy: 'balanced',
        rtcpMuxPolicy: 'require',
        iceCandidatePoolSize: 0,
        certificates: []
      } as RTCConfiguration;
    };
  }

  // Test the polyfill
  try {
    const testPc = new RTCPeerConnection();
    const config = testPc.getConfiguration();
    console.log('✅ WebRTC polyfill applied successfully. getConfiguration returns:', config);
    testPc.close();
  } catch (e) {
    console.error('❌ WebRTC polyfill test failed:', e);
  }
}

// Apply the polyfill immediately when this module is imported
applyWebRTCPolyfill();

// Re-apply periodically to catch any late-loading code
if (typeof window !== 'undefined') {
  // Apply again after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyWebRTCPolyfill);
  } else {
    setTimeout(applyWebRTCPolyfill, 0);
  }
  
  // Apply again after a short delay
  setTimeout(applyWebRTCPolyfill, 500);
  setTimeout(applyWebRTCPolyfill, 1000);
}