# Speech-to-Video Troubleshooting Guide

## ⚠️ IMPORTANT: Avatar Feature Availability

The Azure Text-to-Speech Avatar feature is:
1. **Only available in specific regions**: Southeast Asia, North Europe, West Europe, Sweden Central, South Central US, East US 2, and West US 2
2. **Not included in the standard Speech SDK** - it requires special access
3. **May require additional Azure subscription features** to be enabled

If your region is `eastus` (as detected in your setup), it **does NOT support Avatar**. The system will automatically fall back to Text-to-Speech mode with a visual placeholder.

## Common Issues and Solutions

### 1. Avatar API Not Available

**Problem**: "Avatar API not available" or "AvatarConfig/AvatarSynthesizer not found"

**Solutions**:
- **Check your region**: Avatar is only supported in these regions:
  - `southeastasia`
  - `northeurope`
  - `westeurope`
  - `swedencentral`
  - `southcentralus`
  - `eastus2`
  - `westus2`
- **Your current region** (`eastus`) does NOT support Avatar
- The system will automatically use TTS fallback mode
- To use Avatar, you need to:
  1. Create a new Speech resource in a supported region
  2. Update your `.env` file with the new region and key
  3. Restart the application

### 2. Azure SDK Loading Issues

**Problem**: Azure Speech SDK fails to load or times out

**Solutions**:
- Check your internet connection - the SDK is loaded from Microsoft CDN
- Try refreshing the page (Ctrl/Cmd + Shift + R for hard refresh)
- Check browser console for CORS or network errors
- Ensure your firewall/network allows access to:
  - `https://aka.ms/csspeech/jsbrowserpackageraw`
  - `https://*.cognitiveservices.azure.com`
  - `https://*.blob.core.windows.net`

### 3. Invalid Azure Credentials

**Problem**: "Invalid Azure Speech credentials" error

**Solutions**:
1. Verify your `.env` file has the correct keys:
   ```env
   NEXT_PUBLIC_AZURE_SPEECH_KEY=your_actual_key_here
   NEXT_PUBLIC_AZURE_SPEECH_REGION=your_region_here
   ```

2. Ensure the key is at least 32 characters long
3. Check the region format (should be lowercase, e.g., `eastus`, `westus2`, `westeurope`)
4. Verify the key hasn't expired in Azure Portal
5. Make sure you're using a Speech Service key, not a generic Cognitive Services key

### 4. Avatar Connection Failed

**Problem**: Avatar fails to connect or initialize

**Solutions**:
- Check if your Azure subscription has the Avatar feature enabled
- Verify your region supports Avatar (not all regions do)
- Supported regions include: `westus2`, `westeurope`, `southeastasia`
- Try using a different avatar character or style
- Check browser compatibility (Chrome/Edge recommended)

### 5. Microphone Access Issues

**Problem**: Speech recognition not working

**Solutions**:
1. Allow microphone permissions when prompted
2. Check browser settings:
   - Chrome: `chrome://settings/content/microphone`
   - Edge: `edge://settings/content/microphone`
   - Firefox: `about:preferences#privacy`
3. Ensure no other application is using the microphone
4. Try using a different microphone or audio input device

### 6. No Avatar Video Display

**Problem**: Black screen or no video element

**Solutions**:
- Enable autoplay in browser settings
- Check if JavaScript is enabled
- Try disabling browser extensions (especially ad blockers)
- Ensure WebRTC is not blocked
- Check console for video element errors

### 7. CORS Errors

**Problem**: Cross-Origin Resource Sharing errors in console

**Solutions**:
1. Restart the Next.js development server
2. Clear browser cache and cookies
3. Check if `next.config.ts` has proper CORS headers
4. Try using a different browser or incognito mode

### 8. Speech Synthesis Not Working

**Problem**: Avatar doesn't speak or audio is missing

**Solutions**:
- Check browser audio permissions
- Ensure volume is not muted
- Try a different voice option
- Verify text-to-speech is not blocked by browser policies
- Test with shorter text first

## Debug Steps

1. **Use the Debug Panel**:
   - Navigate to `/speech-to-video-demo`
   - Click "Debug Panel" button
   - Run the debug test to identify specific issues

2. **Check Browser Console**:
   ```javascript
   // Open browser console (F12)
   // Look for errors starting with:
   // [Azure Avatar SDK]
   // [VideoAvatar]
   // [SpeechToVideo]
   ```

3. **Verify Environment Variables**:
   ```bash
   # Check if variables are loaded
   curl http://localhost:3000/api/test-speech-to-video
   ```

4. **Test Azure Credentials**:
   ```bash
   # Test token generation
   curl -X POST "https://YOUR_REGION.api.cognitive.microsoft.com/sts/v1.0/issueToken" \
     -H "Ocp-Apim-Subscription-Key: YOUR_KEY" \
     -H "Content-Length: 0"
   ```

## Browser Requirements

### Supported Browsers:
- ✅ Chrome 90+ (Recommended)
- ✅ Edge 90+ (Recommended)
- ✅ Safari 14.1+ (Limited support)
- ⚠️ Firefox (Speech recognition may not work)

### Required Features:
- WebRTC support
- Media Devices API
- Web Speech API (for recognition)
- Autoplay permissions
- JavaScript enabled

## Performance Tips

1. **Optimize Network**:
   - Use wired connection if possible
   - Ensure stable internet (minimum 1 Mbps)
   - Close unnecessary browser tabs

2. **Reduce Latency**:
   - Choose Azure region closest to you
   - Use production build for better performance
   - Enable browser hardware acceleration

3. **Avatar Settings**:
   - Start with default avatar (lisa)
   - Use standard voices first
   - Test with short sentences initially

## Getting Help

1. **Check Logs**:
   - Browser console logs
   - Network tab in DevTools
   - Application logs in terminal

2. **Azure Support**:
   - [Azure Speech Service Documentation](https://docs.microsoft.com/azure/cognitive-services/speech-service/)
   - [Avatar-specific Documentation](https://learn.microsoft.com/azure/ai-services/speech-service/text-to-speech-avatar/overview)
   - Azure Portal support tickets

3. **Community**:
   - GitHub Issues on this repository
   - Stack Overflow with tags: `azure-speech-api`, `text-to-speech`
   - Microsoft Q&A forums

## Error Codes Reference

| Error Code | Description | Solution |
|------------|-------------|----------|
| 401 | Invalid credentials | Check API key |
| 403 | Forbidden | Check subscription/region |
| 404 | Resource not found | Verify endpoint URL |
| 429 | Rate limited | Reduce request frequency |
| 500 | Server error | Try again later |
| CORS | Cross-origin blocked | Check CORS configuration |
| SDK_LOAD_FAILED | SDK loading failed | Check network/firewall |
| AVATAR_INIT_FAILED | Avatar initialization failed | Check region support |

## Fallback Mode

If Azure Avatar is not available, the system will automatically fall back to:
1. Audio-only mode using Web Speech API
2. Visual placeholder instead of video
3. All conversation features remain functional

To force fallback mode for testing:
```javascript
// In your code, set a flag or environment variable
process.env.NEXT_PUBLIC_FORCE_AVATAR_FALLBACK = 'true'
```