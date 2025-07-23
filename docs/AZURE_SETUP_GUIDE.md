# Azure Speech Service Setup Guide

## Quick Fix for "Avatar Status: Inactive"

If you're seeing "Avatar Status: Inactive" and "Not connected", it means Azure Speech Service credentials are not configured. Follow this guide to set them up.

## Step 1: Create Azure Speech Service

1. **Go to Azure Portal**: https://portal.azure.com
2. **Create Speech Service**:
   - Click "Create a resource"
   - Search for "Speech" 
   - Select "Speech Services"
   - Click "Create"

3. **Configure the Resource**:
   - **Subscription**: Choose your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Region**: Choose from supported regions:
     - `eastus2` (East US 2) 
     - `westus2` (West US 2)
     - `southcentralus` (South Central US)
     - `northeurope` (North Europe)
     - `westeurope` (West Europe)
     - `swedencentral` (Sweden Central)
     - `southeastasia` (Southeast Asia)
   - **Name**: Choose a unique name (e.g., `my-avatar-speech-service`)
   - **Pricing Tier**: Choose based on usage (S0 for production)

4. **Click "Review + Create"** then **"Create"**

## Step 2: Get Your Credentials

1. **Go to your Speech Service resource**
2. **Click "Keys and Endpoint"** in the left menu
3. **Copy the following**:
   - **Key 1** or **Key 2** (either works)
   - **Region** (e.g., `eastus2`)

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Azure Speech Service (Required for Avatar)
NEXT_PUBLIC_AZURE_SPEECH_KEY=paste_your_key_here
NEXT_PUBLIC_AZURE_SPEECH_REGION=paste_your_region_here

# OpenAI API (Required for GPT)
OPENAI_API_KEY=your_openai_key_here
```

### Example Configuration:
```env
NEXT_PUBLIC_AZURE_SPEECH_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
NEXT_PUBLIC_AZURE_SPEECH_REGION=eastus2
OPENAI_API_KEY=sk-abcd1234...
```

## Step 4: Restart Development Server

After adding the environment variables:

```bash
# Stop the server (Ctrl+C)
# Then restart
pnpm dev
```

## Step 5: Test the Connection

1. Go to `/corporate/chat`
2. Click the **purple video icon** 🎬 in the textarea
3. You should see:
   - "Initializing..." → "Connected" → "Ready - Start speaking!"
   - A floating avatar video appears

## Troubleshooting

### Issue: "Azure Speech credentials not configured"
**Solution**: Double-check your `.env.local` file has the correct variable names and values.

### Issue: "Failed to start avatar session"
**Possible causes**:
1. **Wrong region**: Make sure your region supports Text-to-Speech Avatar
2. **Invalid key**: Verify the key is copied correctly
3. **Quota exceeded**: Check your Azure usage limits

### Issue: "Speech recognition not supported"
**Solution**: Use Chrome, Edge, or Safari. Firefox doesn't support Web Speech API.

### Issue: Avatar video doesn't appear
**Possible causes**:
1. Browser popup blocker
2. No microphone permissions
3. HTTPS required (use localhost for development)

## Supported Regions for Avatar

According to [Azure documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/text-to-speech-avatar/what-is-text-to-speech-avatar), Text-to-Speech Avatar is only available in these regions:

- **East US 2** (`eastus2`)
- **West US 2** (`westus2`) 
- **South Central US** (`southcentralus`)
- **North Europe** (`northeurope`)
- **West Europe** (`westeurope`)
- **Sweden Central** (`swedencentral`)
- **Southeast Asia** (`southeastasia`)

## Cost Estimates

Based on [Azure Speech pricing](https://azure.microsoft.com/en-us/pricing/details/cognitive-services/speech-services/):

- **Avatar Video Generation**: ~$0.004 per second of generated video
- **Text-to-Speech**: ~$4 per 1 million characters
- **Speech-to-Text**: ~$1 per hour of audio

**Example**: A 30-second avatar response costs approximately $0.12

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use different keys** for development and production
3. **Rotate keys regularly** in Azure Portal
4. **Monitor usage** to detect unauthorized access

## Testing Your Setup

Once configured, test with this flow:

1. **Click video button** 🎬
2. **Say**: "I'm feeling stressed about work"
3. **Expected result**: 
   - Avatar video appears
   - AI responds with supportive message
   - Avatar lips sync with speech

## Getting Help

If you're still having issues:

1. **Check browser console** for detailed error messages
2. **Verify region support** for Text-to-Speech Avatar
3. **Test with Speech Studio** first: https://speech.microsoft.com/
4. **Check Azure service health**: https://status.azure.com/

## Next Steps

Once working:
- Explore different avatar characters (lisa, anna, james, etc.)
- Try different voices (Jenny, Guy, Aria, etc.)
- Customize avatar styles (casual-sitting, business-sitting, etc.)
- Visit `/speech-to-video-demo` for full demonstration 