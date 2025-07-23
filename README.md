<a href="https://ai-sdk-starter-deepinfra.vercel.app">
  <h1 align="center">Buddy AI - Intelligent Companion</h1>
</a>

<p align="center">
  An advanced AI chatbot application with real-time speech-to-speech communication, built with Next.js, the AI SDK by Vercel, and OpenAI.
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#voice-mode"><strong>Voice Mode</strong></a> ·
  <a href="#deploy-your-own"><strong>Deploy Your Own</strong></a> ·
  <a href="#running-locally"><strong>Running Locally</strong></a> ·
  <a href="#authors"><strong>Authors</strong></a>
</p>
<br/>

## Features

- **🎤 Real-time Speech-to-Speech Communication** - WebRTC-powered voice mode for natural conversations
- **🎬 Speech-to-Video Avatar** - Azure Text-to-Speech Avatar integration for lifelike video responses
- **🤖 Advanced AI Integration** - Powered by OpenAI GPT models with streaming responses
- **🔊 High-Quality TTS** - OpenAI TTS with multiple voices and quality options
- **📝 Text Chat Interface** - Traditional chat with markdown support and streaming responses
- **🎨 Modern UI** - Built with [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com)
- **⚡ Performance Optimized** - Built with the latest [Next.js](https://nextjs.org) App Router
- **🔧 Extensible Architecture** - Easy to add new AI providers and features
- **🔐 Conditional Authentication** - Optional user authentication for testing and development

## Voice Mode

### WebRTC Real-time Communication
Experience natural voice conversations with the AI assistant using our advanced WebRTC voice mode:

- **Real-time Speech Recognition** - Continuous speech-to-text using Web Speech API
- **AI Processing** - Natural language understanding and response generation
- **High-Quality Speech Synthesis** - OpenAI TTS with multiple voice options
- **Low Latency** - Optimized for real-time communication
- **Cross-platform** - Works on desktop and mobile browsers

### Voice Options
- **alloy** - Balanced, neutral voice
- **echo** - Clear, professional voice  
- **fable** - Warm, storytelling voice
- **onyx** - Deep, authoritative voice
- **nova** - Bright, energetic voice
- **shimmer** - Soft, gentle voice

### TTS Quality Levels
- **Standard (tts-1)** - Faster, lower cost
- **Premium (tts-1-hd)** - Higher quality, enhanced fidelity

## Speech-to-Video Avatar

### Azure Text-to-Speech Avatar Integration
Transform your AI conversations with lifelike video avatars:

- **🎭 Realistic Avatars** - Multiple characters with natural expressions and lip-sync
- **🔄 Continuous Conversation** - Automatic speech recognition and response loop
- **🎤 Voice Input** - Speak naturally and get video responses
- **🧠 AI Processing** - GPT-4 powered responses with context awareness
- **⚡ Real-time Synthesis** - Fast avatar video generation
- **🎨 Customizable** - Choose from different avatars, styles, and voices

### Available Avatars
- **lisa** - Professional female avatar (default)
- **jenny** - Friendly female avatar
- **jason** - Business male avatar
- **aria** - Energetic female avatar
- **guy** - Casual male avatar
- **emma** - Warm female avatar

### Setup Speech-to-Video
1. Create an Azure Speech Service resource (Standard S0 tier)
2. Get your API key and region from Azure Portal
3. Add to your `.env.local`:
   ```
   NEXT_PUBLIC_AZURE_SPEECH_KEY=your_key_here
   NEXT_PUBLIC_AZURE_SPEECH_REGION=your_region_here
   ```
4. Navigate to `/speech-to-video-demo` to try it out

For detailed setup instructions, see [Azure TTS Avatar Setup Guide](docs/AZURE_TTS_AVATAR_SETUP.md)

## Deploy Your Own

You can deploy your own version to Vercel by clicking the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?project-name=buddy-ai-companion&repository-name=buddy-companion&repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fbuddy-companion&demo-title=Buddy%20AI%20Companion&demo-url=https%3A%2F%2Fbuddy-ai-companion.vercel.app%2F&demo-description=An%20advanced%20AI%20chatbot%20with%20real-time%20speech-to-speech%20communication&products=%5B%7B%22type%22%3A%22integration%22%2C%22integrationSlug%22%3A%22openai%22%2C%22productSlug%22%3A%22api-token%22%2C%22protocol%22%3A%22ai%22%7D%5D)

## Running Locally

1. Clone the repository and install dependencies:

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

2. Set up environment variables:

   Create a `.env.local` file with the following variables:

   ```env
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here
   
   # Supabase Configuration (for authentication)
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Authentication (Optional - for testing)
   USER_AUTH=true                    # Enable user authentication
   NEXT_PUBLIC_USER_AUTH=true        # Client-side auth flag
   ```

3. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view your Buddy AI application.

## Authentication Configuration

The application supports conditional authentication using the `USER_AUTH` environment variable:

### Enable Authentication (Default)
```bash
# Set these in your .env.local
USER_AUTH=true
NEXT_PUBLIC_USER_AUTH=true
```

### Disable Authentication (For Testing)
```bash
# Set these in your .env.local
USER_AUTH=false
NEXT_PUBLIC_USER_AUTH=false
```

**Behavior:**
- `USER_AUTH=true`: Authentication required for protected routes
- `USER_AUTH=false` or not set: No authentication required (shows "Auth Disabled" indicator)

This is useful for:
- Development and testing without authentication setup
- Demo presentations
- Debugging authentication-related issues

⚠️ **Never disable authentication in production!**

## Voice Mode Setup

### Browser Requirements
- Chrome (recommended)
- Firefox
- Safari (limited support)
- Edge

### Microphone Permissions
The voice mode requires microphone access. When prompted, allow microphone permissions for the best experience.

### Usage Instructions
1. Navigate to the chat interface
2. Click "WebRTC Voice Mode OFF" to enable voice mode
3. Click "Connect" to establish WebRTC connection
4. Click "Start Listening" to begin voice recognition
5. Speak clearly into your microphone
6. The AI will respond with voice in real-time

## Project Structure

```
buddy-companion/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── corporate/     # Chat API
│   │   ├── tts/          # Text-to-speech API
│   │   └── realtime-speech/ # Real-time speech API
│   └── corporate/        # Corporate chat page
├── components/            # React components
│   ├── webrtc-voice-mode.tsx # Voice mode component
│   ├── audio-settings.tsx    # Audio settings
│   └── ui/               # UI components
├── lib/                  # Utility libraries
│   ├── tts-service.ts    # TTS service
│   └── types/           # TypeScript types
└── docs/                # Documentation
```

## API Endpoints

### Chat API
- `POST /api/corporate` - Main chat endpoint with streaming responses

### TTS API  
- `POST /api/tts` - Text-to-speech conversion
- `GET /api/tts` - Get available TTS options

### Real-time Speech API
- `POST /api/realtime-speech` - Real-time speech-to-speech processing
- `GET /api/realtime-speech` - Get API status and supported features

## Documentation

- [WebRTC Voice Mode Guide](./WEBRTC_VOICE_MODE.md) - Detailed voice mode documentation
- [Audio Features](./AUDIO_FEATURES.md) - Audio functionality overview
- [Setup Guide](./SETUP.md) - Complete setup instructions
- [Authentication Guide](./USER_AUTH_DISABLE.md) - Conditional authentication documentation

## Contributing

We welcome contributions! Please see our contributing guidelines and feel free to:

- Report bugs and issues
- Suggest new features
- Submit pull requests
- Improve documentation

## Authors

This project is maintained by the Buddy AI team and community contributors.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
