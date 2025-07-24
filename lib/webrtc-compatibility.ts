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
    function PatchedRTCPeerConnection(configuration?: RTCConfiguration) {
      // Create instance with original constructor
      const pc = new OriginalRTCPeerConnection(configuration);
      
      // Add getConfiguration if it doesn't exist
      if (typeof pc.getConfiguration !== 'function') {
        const storedConfig = configuration || {};
        pc.getConfiguration = function() {
          return {
            iceServers: storedConfig.iceServers || [],
            iceTransportPolicy: storedConfig.iceTransportPolicy || 'all',
            bundlePolicy: storedConfig.bundlePolicy || 'balanced',
            rtcpMuxPolicy: storedConfig.rtcpMuxPolicy || 'require',
            certificates: storedConfig.certificates || []
          } as RTCConfiguration;
        };
      }
      
      return pc;
    }
    
    // Copy static methods and properties
    Object.setPrototypeOf(PatchedRTCPeerConnection.prototype, OriginalRTCPeerConnection.prototype);
    Object.setPrototypeOf(PatchedRTCPeerConnection, OriginalRTCPeerConnection);
    
    // Copy static methods explicitly
    if (OriginalRTCPeerConnection.generateCertificate) {
      (PatchedRTCPeerConnection as unknown as typeof OriginalRTCPeerConnection).generateCertificate = OriginalRTCPeerConnection.generateCertificate;
    }
    
    // Replace the global constructor
    (window as Window & { RTCPeerConnection: typeof RTCPeerConnection }).RTCPeerConnection = PatchedRTCPeerConnection as unknown as typeof OriginalRTCPeerConnection;
    
    // Verify the patch worked
    const verifyPc = new RTCPeerConnection();
    if (typeof verifyPc.getConfiguration === 'function') {
      console.log('✅ Successfully patched RTCPeerConnection.getConfiguration');
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