/**
 * Azure Speech Service Diagnostics Utilities
 * Based on: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/troubleshooting
 */

export interface AzureSpeechDiagnostics {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

export class AzureSpeechDiagnosticHelper {
  /**
   * Validate Azure Speech Service credentials
   */
  static validateCredentials(speechKey: string, speechRegion: string): AzureSpeechDiagnostics {
    const result: AzureSpeechDiagnostics = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Validate speech key
    if (!speechKey) {
      result.isValid = false;
      result.errors.push('Speech key is missing');
      result.suggestions.push('Set NEXT_PUBLIC_AZURE_SPEECH_KEY in your environment variables');
    } else if (speechKey.length < 32) {
      result.isValid = false;
      result.errors.push('Invalid speech key format - must be at least 32 characters');
      result.suggestions.push('Check your Azure Speech Service subscription key in the Azure portal');
    }

    // Validate speech region
    if (!speechRegion) {
      result.isValid = false;
      result.errors.push('Speech region is missing');
      result.suggestions.push('Set NEXT_PUBLIC_AZURE_SPEECH_REGION in your environment variables');
    } else if (!/^[a-z]+[a-z0-9]*$/.test(speechRegion)) {
      result.isValid = false;
      result.errors.push('Invalid region format - use lowercase without spaces (e.g., "eastus", "westus2")');
      result.suggestions.push('Check the region format in your Azure Speech Service resource');
    }

    // Check for common issues
    if (speechKey && speechKey.includes(' ')) {
      result.warnings.push('Speech key contains spaces - ensure no extra whitespace');
    }

    if (speechRegion && speechRegion.includes('-')) {
      result.warnings.push('Region format may be incorrect - use format like "eastus" not "east-us"');
    }

    return result;
  }

  /**
   * Test Azure Speech Service connectivity
   */
  static async testConnectivity(speechKey: string, speechRegion: string): Promise<AzureSpeechDiagnostics> {
    const result: AzureSpeechDiagnostics = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    try {
      console.log('🔍 [Azure Diagnostics] Testing connectivity to Azure Speech Service...');
      
      const response = await fetch(`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`, {
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': speechKey,
          'Content-type': 'application/x-www-form-urlencoded',
          'Content-Length': '0'
        }
      });

      if (!response.ok) {
        result.isValid = false;
        
        switch (response.status) {
          case 401:
            result.errors.push('Authentication failed - invalid subscription key');
            result.suggestions.push('Verify your Azure Speech Service subscription key');
            break;
          case 403:
            result.errors.push('Access forbidden - check subscription and region');
            result.suggestions.push('Ensure your subscription is active and the region is correct');
            break;
          case 404:
            result.errors.push('Service not found - invalid region');
            result.suggestions.push('Check if the region name is correct (e.g., "eastus", "westus2")');
            break;
          case 429:
            result.errors.push('Rate limit exceeded');
            result.suggestions.push('Wait a moment and try again, or check your quota limits');
            break;
          case 500:
          case 502:
          case 503:
            result.errors.push('Azure service temporarily unavailable');
            result.suggestions.push('This is likely a temporary issue - try again in a few minutes');
            break;
          default:
            result.errors.push(`HTTP ${response.status}: ${response.statusText}`);
            result.suggestions.push('Check Azure service status and your network connection');
        }
      } else {
        console.log('✅ [Azure Diagnostics] Connectivity test successful');
        result.suggestions.push('Azure Speech Service is accessible with these credentials');
      }

    } catch (error) {
      result.isValid = false;
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        result.errors.push('Network error - unable to reach Azure Speech Service');
        result.suggestions.push('Check your internet connection and firewall settings');
      } else {
        result.errors.push(`Connection test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        result.suggestions.push('Check your network connection and Azure service status');
      }
    }

    return result;
  }

  /**
   * Generate diagnostic report
   */
  static generateDiagnosticReport(speechKey: string, speechRegion: string): string {
    const credentialCheck = this.validateCredentials(speechKey, speechRegion);
    
    let report = '🔍 Azure Speech Service Diagnostic Report\n';
    report += '=========================================\n\n';
    
    report += '📋 Configuration:\n';
    report += `   Speech Key: ${speechKey ? `${speechKey.substring(0, 8)}...` : 'NOT SET'}\n`;
    report += `   Speech Region: ${speechRegion || 'NOT SET'}\n\n`;
    
    if (credentialCheck.errors.length > 0) {
      report += '❌ Errors:\n';
      credentialCheck.errors.forEach(error => {
        report += `   • ${error}\n`;
      });
      report += '\n';
    }
    
    if (credentialCheck.warnings.length > 0) {
      report += '⚠️  Warnings:\n';
      credentialCheck.warnings.forEach(warning => {
        report += `   • ${warning}\n`;
      });
      report += '\n';
    }
    
    if (credentialCheck.suggestions.length > 0) {
      report += '💡 Suggestions:\n';
      credentialCheck.suggestions.forEach(suggestion => {
        report += `   • ${suggestion}\n`;
      });
      report += '\n';
    }
    
    report += '📚 Helpful Resources:\n';
    report += '   • Azure Speech Service Documentation: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/\n';
    report += '   • Troubleshooting Guide: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/troubleshooting\n';
    report += '   • Quotas and Limits: https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-services-quotas-and-limits\n';
    
    return report;
  }

  /**
   * Check browser compatibility for speech features
   */
  static checkBrowserCompatibility(): AzureSpeechDiagnostics {
    const result: AzureSpeechDiagnostics = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // Check speech recognition support
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      result.isValid = false;
      result.errors.push('Speech recognition not supported in this browser');
      result.suggestions.push('Use Chrome, Edge, or Safari for speech recognition features');
    }

    // Check speech synthesis support
    if (!('speechSynthesis' in window)) {
      result.warnings.push('Speech synthesis not supported in this browser');
      result.suggestions.push('Speech synthesis fallback may not work properly');
    }

    // Check WebRTC support
    if (!('RTCPeerConnection' in window)) {
      result.warnings.push('WebRTC not supported - real-time features may be limited');
    }

    // Check MediaDevices support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      result.warnings.push('MediaDevices API not supported - microphone access may fail');
      result.suggestions.push('Ensure you are using HTTPS and a modern browser');
    }

    return result;
  }
}
