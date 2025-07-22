# Components Documentation

This document provides detailed documentation for all UI components in the AI SDK Starter project.

## Table of Contents

1. [Layout Components](#layout-components)
2. [Chat Components](#chat-components)
3. [Audio Components](#audio-components)
4. [Authentication Components](#authentication-components)
5. [Admin Components](#admin-components)
6. [UI Library Components](#ui-library-components)

## Layout Components

### Header Component

**Location:** `components/header.tsx`

**Description:** Main navigation header with user authentication status and navigation links.

**Features:**
- Responsive design with mobile menu
- User authentication status display
- Navigation links to different app sections
- Theme toggle support
- User profile dropdown

**Props:** None (uses internal state and hooks)

**Example:**
```tsx
<Header />
```

### SubHeader Component

**Location:** `components/sub-header.tsx`

**Description:** Secondary navigation header for chat interfaces with audio controls.

**Props:**
```tsx
interface SubHeaderProps {
  messages: Message[];
  isAudioEnabled: boolean;
  voice: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  onVoiceChange: (voice: string) => void;
  onAudioToggle: () => void;
  chatUrl: string;
  featuresUrl: string;
  howItWorksUrl: string;
}
```

### Footer Component

**Location:** `components/footer.tsx`

**Description:** Application footer with copyright and links.

**Props:** None

## Chat Components

### Chat Component

**Location:** `components/chat.tsx`

**Description:** Main chat interface with AI integration.

**Features:**
- Real-time message streaming
- Audio transcription support
- Text-to-speech integration
- Suggested prompts
- Auto-scrolling
- Markdown support

**State Management:**
- Uses `useChat` hook from Vercel AI SDK
- Manages thread ID for conversation continuity
- Handles audio settings

### Message Component

**Location:** `components/message.tsx`

**Description:** Individual message display with rich formatting.

**Features:**
- Markdown rendering with syntax highlighting
- Code block support
- Audio playback for assistant messages
- User/Assistant message styling
- Copy message functionality

**Props:**
```tsx
interface MessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
  };
  isPlaying?: boolean;
  onPlayAudio?: () => void;
  voice?: string;
}
```

### Messages Component

**Location:** `components/messages.tsx`

**Description:** Container for chat messages with auto-scroll.

**Props:**
```tsx
interface MessagesProps {
  messages: Message[];
  isAudioEnabled: boolean;
  voice: string;
}
```

### Textarea Component

**Location:** `components/textarea.tsx`

**Description:** Enhanced textarea for chat input with auto-resize.

**Features:**
- Auto-resize based on content
- Submit on Enter (Shift+Enter for new line)
- Character limit support
- Loading state
- Voice input integration

**Props:**
```tsx
interface TextareaProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  rows?: number;
  className?: string;
}
```

### SuggestedPrompts Component

**Location:** `components/suggested-prompts.tsx`

**Description:** Displays clickable suggested conversation starters.

**Props:**
```tsx
interface SuggestedPromptsProps {
  onSelectPrompt: (prompt: string) => void;
  prompts?: string[];
}
```

## Audio Components

### AudioPlayer Component

**Location:** `components/audio-player.tsx`

**Description:** Audio playback control for TTS output.

**Features:**
- Play/Pause control
- Loading state
- Error handling
- Voice selection
- Model selection (tts-1, tts-1-hd)

**Props:**
```tsx
interface AudioPlayerProps {
  text: string;
  isEnabled: boolean;
  className?: string;
  voice?: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  ttsModel?: 'tts-1' | 'tts-1-hd';
}
```

### AudioSettings Component

**Location:** `components/audio-settings.tsx`

**Description:** Audio configuration panel.

**Features:**
- Voice selection
- Speed control
- Volume control
- Audio format selection

**Props:**
```tsx
interface AudioSettingsProps {
  settings: {
    voice: string;
    speed: number;
    volume: number;
  };
  onSettingsChange: (settings: AudioSettings) => void;
}
```

### VoiceAvatar Component

**Location:** `components/voice-avatar.tsx`

**Description:** Animated avatar for voice interactions.

**Features:**
- Listening animation
- Speaking animation
- Status indicators
- Smooth transitions

**Props:**
```tsx
interface VoiceAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

### VoicePicker Component

**Location:** `components/voice-picker.tsx`

**Description:** Dropdown for selecting TTS voice.

**Props:**
```tsx
interface VoicePickerProps {
  value: string;
  onChange: (voice: string) => void;
  disabled?: boolean;
}
```

**Available Voices:**
- Alloy (Default)
- Echo
- Fable
- Onyx
- Nova
- Shimmer

## Authentication Components

### AuthGuard Component

**Location:** `components/auth-guard.tsx`

**Description:** Route protection wrapper.

**Features:**
- Authentication check
- Admin role verification
- Redirect on unauthorized
- Loading state

**Props:**
```tsx
interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireAdmin?: boolean;
}
```

### UserProfile Component

**Location:** `components/user-profile.tsx`

**Description:** User profile display and management.

**Features:**
- Avatar display
- Profile editing
- Account settings
- Sign out functionality

**Props:**
```tsx
interface UserProfileProps {
  user: AuthUser;
  onProfileUpdate?: (data: ProfileData) => void;
}
```

### Auth Components (Directory)

**Location:** `components/auth/`

Contains various authentication-related components:
- Login form
- Registration form
- Password reset
- OAuth buttons

## Admin Components

### AdminNav Component

**Location:** `components/admin-nav.tsx`

**Description:** Navigation sidebar for admin dashboard.

**Features:**
- User management links
- Usage statistics
- System monitoring
- Queue management

**Props:** None

### QueueDashboard Component

**Location:** `components/queue-dashboard.tsx`

**Description:** Real-time queue monitoring interface.

**Features:**
- Live queue statistics
- Job status monitoring
- Failed job management
- Queue health indicators

**State:**
- Polls queue status every 5 seconds
- Displays job counts by status
- Shows Redis connection health

## UI Library Components

### Button Component

**Location:** `components/ui/button.tsx`

**Description:** Customizable button component.

**Variants:**
- default
- destructive
- outline
- secondary
- ghost
- link

**Sizes:**
- sm
- md (default)
- lg
- icon

### Input Component

**Location:** `components/input.tsx`

**Description:** Enhanced input field.

**Features:**
- Error state
- Icon support
- Loading state
- Validation feedback

### Markdown Component

**Location:** `components/markdown.tsx`

**Description:** Markdown renderer with syntax highlighting.

**Features:**
- GitHub Flavored Markdown
- Code syntax highlighting
- Table support
- Task list support
- Custom link handling

**Props:**
```tsx
interface MarkdownProps {
  content: string;
  className?: string;
}
```

### Icons Component

**Location:** `components/icons.tsx`

**Description:** Custom SVG icon components.

**Available Icons:**
- OpenAI
- Google
- GitHub
- Vercel
- Loading spinners
- UI icons

### ProjectOverview Component

**Location:** `components/project-overview.tsx`

**Description:** Displays project information and features.

**Props:**
```tsx
interface ProjectOverviewProps {
  features?: Feature[];
  description?: string;
}
```

## Component Best Practices

### State Management
- Use hooks for local state
- Leverage context for shared state
- Keep components focused and single-purpose

### Performance
- Implement React.memo for expensive renders
- Use useCallback for event handlers
- Lazy load heavy components

### Accessibility
- Include proper ARIA labels
- Ensure keyboard navigation
- Provide focus indicators
- Support screen readers

### Styling
- Use Tailwind CSS classes
- Follow design system tokens
- Ensure responsive design
- Support dark mode

### Error Handling
- Display user-friendly error messages
- Provide fallback UI
- Log errors for debugging
- Handle loading states

## Example Implementations

### Complete Chat Interface

```tsx
import { Chat } from '@/components/chat';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function ChatPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Chat
          api="/api/corporate"
          chat_url="/chat"
          features_url="/features"
          how_it_works_url="/how-it-works"
          ttsConfig={{
            defaultVoice: 'alloy',
            speed: 1.0,
            autoPlay: true
          }}
        />
      </main>
      <Footer />
    </div>
  );
}
```

### Protected Admin Dashboard

```tsx
import { AuthGuard } from '@/components/auth-guard';
import { AdminNav } from '@/components/admin-nav';
import { QueueDashboard } from '@/components/queue-dashboard';

export default function AdminDashboard() {
  return (
    <AuthGuard requireAdmin={true} redirectTo="/login">
      <div className="flex">
        <AdminNav />
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
          <QueueDashboard />
        </main>
      </div>
    </AuthGuard>
  );
}
```

### Audio-Enabled Message Display

```tsx
import { Message } from '@/components/message';
import { useAudio } from '@/lib/hooks/use-audio';

export default function MessageList({ messages }) {
  const { playText, stopPlaying, isPlaying } = useAudio();

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isPlaying={isPlaying}
          onPlayAudio={() => playText(message.content, 'alloy')}
          voice="alloy"
        />
      ))}
    </div>
  );
}
```

---

Last updated: December 2024
