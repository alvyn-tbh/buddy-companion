import {
  AvatarQuality,
  VoiceEmotion,
  VoiceChatTransport,
  STTProvider,
  ElevenLabsModel,
  StartAvatarRequest,
} from "@heygen/streaming-avatar";

// Available public avatars from HeyGen
export const AVATARS = [
  {
    avatar_id: "Anna_public_3_20240108",
    name: "Anna (Public)",
  },
  {
    avatar_id: "Susan_public_2_20240328",
    name: "Susan",
  },
  {
    avatar_id: "Angela_public_3_20240910",
    name: "Angela",
  },
  {
    avatar_id: "Nisha_public_20240731",
    name: "Nisha",
  },
  {
    avatar_id: "Lara_public_20240731",
    name: "Lara",
  },
  {
    avatar_id: "Wayne_public_2_20240711",
    name: "Wayne",
  },
  {
    avatar_id: "Tyler-incasualsuit-20220721",
    name: "Tyler (Business)",
  },
  {
    avatar_id: "Josh_public_3_20240313",
    name: "Josh (Casual)",
  },
  {
    avatar_id: "Alex_public_4_20240603",
    name: "Alex (Casual)",
  },
];

// Default configuration for corporate wellness context
export const DEFAULT_AVATAR_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Medium,
  avatarName: AVATARS[0].avatar_id, // Anna as default for professional setting
  knowledgeId: undefined,
  voice: {
    rate: 1.0, // Normal speaking rate for corporate context
    emotion: VoiceEmotion.FRIENDLY,
    model: ElevenLabsModel.eleven_turbo_v2,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

// Voice emotions suitable for corporate wellness context
export const CORPORATE_VOICE_EMOTIONS = [
  { value: VoiceEmotion.FRIENDLY, label: "Friendly" },
  { value: VoiceEmotion.SERIOUS, label: "Professional" },
  { value: VoiceEmotion.SOOTHING, label: "Calm" },
  { value: VoiceEmotion.EXCITED, label: "Energetic" },
];

// Avatar quality options
export const QUALITY_OPTIONS = [
  { value: AvatarQuality.Low, label: "Low (faster loading)" },
  { value: AvatarQuality.Medium, label: "Medium (balanced)" },
  { value: AvatarQuality.High, label: "High (best quality)" },
];

// Language options for STT
export const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
];