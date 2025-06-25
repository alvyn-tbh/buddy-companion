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
- **🤖 Advanced AI Integration** - Powered by OpenAI GPT models with streaming responses
- **🔊 High-Quality TTS** - OpenAI TTS with multiple voices and quality options
- **📝 Text Chat Interface** - Traditional chat with markdown support and streaming responses
- **🎨 Modern UI** - Built with [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS](https://tailwindcss.com)
- **⚡ Performance Optimized** - Built with the latest [Next.js](https://nextjs.org) App Router
- **🔧 Extensible Architecture** - Easy to add new AI providers and features

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
   OPENAI_API_KEY=your_openai_api_key_here
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
