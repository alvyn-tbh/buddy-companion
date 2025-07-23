# Azure Text-to-Speech Avatar Setup Guide

This guide will help you set up Azure Text-to-Speech Avatar service for the speech-to-video conversation feature.

## Prerequisites

- Azure account with active subscription
- Azure Speech Service resource
- Node.js 18+ installed
- Modern web browser (Chrome, Edge, or Safari recommended)

## Step 1: Create Azure Speech Service Resource

1. Sign in to the [Azure Portal](https://portal.azure.com)
2. Click "Create a resource"
3. Search for "Speech" and select "Speech" by Microsoft
4. Click "Create"
5. Fill in the required details:
   - **Subscription**: Select your Azure subscription
   - **Resource group**: Create new or select existing
   - **Region**: Choose a region that supports Text-to-Speech Avatar (recommended: `westus2`, `eastus`, `westeurope`)
   - **Name**: Give your resource a unique name
   - **Pricing tier**: Select Standard S0 (required for Avatar feature)
6. Click "Review + create" and then "Create"

## Step 2: Get Your API Keys

1. Once the resource is created, go to your Speech resource
2. In the left menu, click on "Keys and Endpoint"
3. Copy **KEY 1** or **KEY 2** (either will work)
4. Note down the **Location/Region** (e.g., `westus2`)

## Step 3: Configure Environment Variables

1. In your project root, create or update the `.env.local` file:

```bash
# Azure Speech Service
NEXT_PUBLIC_AZURE_SPEECH_KEY=your_speech_key_here
NEXT_PUBLIC_AZURE_SPEECH_REGION=your_region_here

# OpenAI API (for GPT processing)
OPENAI_API_KEY=your_openai_api_key_here
```

2. Replace the placeholders:
   - `your_speech_key_here`: Your Azure Speech Service key from Step 2
   - `your_region_here`: Your Azure region (e.g., `westus2`)
   - `your_openai_api_key_here`: Your OpenAI API key

## Step 4: Verify Browser Compatibility

The speech-to-video feature requires:
- **Microphone access** for speech recognition
- **WebRTC support** for real-time communication
- **Modern browser** with Web Speech API support

Supported browsers:
- Google Chrome 90+
- Microsoft Edge 90+
- Safari 14.1+

## Step 5: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/speech-to-video-demo`

3. Check the setup status indicator at the top of the page

4. If everything is configured correctly, you should see:
   - ✅ Azure Speech Service configured
   - ✅ OpenAI API configured
   - ✅ Browser supports speech recognition

## Available Avatar Options

### Characters
- `lisa` (default)
- `jenny`
- `jason`
- `aria`
- `guy`
- `emma`

### Styles
- `casual-sitting` (default)
- `formal-standing`
- `technical-sitting`
- `graceful-standing`

### Voices
- `en-US-JennyNeural` (default)
- `en-US-AriaNeural`
- `en-US-GuyNeural`
- `en-US-JasonNeural`
- `en-US-EmmaNeural`

## Troubleshooting

### "Azure Speech Service not configured"
- Double-check your environment variables
- Ensure you're using the correct key and region
- Restart your development server after updating `.env.local`

### "Speech recognition not supported"
- Use a supported browser (Chrome, Edge, or Safari)
- Ensure your browser has microphone permissions
- Check that you're using HTTPS (or localhost for development)

### "Avatar initialization timeout"
- Check your internet connection
- Verify your Azure region supports Text-to-Speech Avatar
- Ensure your Speech Service resource is Standard S0 tier

### "Microphone access denied"
- Click the microphone icon in your browser's address bar
- Grant permission for the site to access your microphone
- Refresh the page after granting permission

## Cost Considerations

Azure Text-to-Speech Avatar pricing:
- Standard tier: ~$15 per hour of synthesized video
- Neural voices: ~$16 per 1 million characters
- Speech recognition: ~$1 per hour

Monitor your usage in the Azure Portal to avoid unexpected charges.

## Security Best Practices

1. **Never commit API keys to version control**
   - Use `.env.local` for local development
   - Use environment variables in production

2. **Implement rate limiting**
   - Limit API calls per user
   - Add authentication for production use

3. **Use CORS properly**
   - Configure allowed origins
   - Restrict API access to your domain

## Additional Resources

- [Azure Text-to-Speech Avatar Documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/what-is-text-to-speech-avatar)
- [Real-time Avatar Synthesis](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/real-time-synthesis-avatar)
- [Custom Avatar Creation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/custom-avatar-create)
- [Avatar Gestures with SSML](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/avatar-gestures-with-ssml)

## Support

If you encounter issues not covered in this guide:
1. Check the browser console for detailed error messages
2. Review the Azure Speech Service logs in the Azure Portal
3. Open an issue on the project repository with:
   - Error messages
   - Browser and version
   - Steps to reproduce 