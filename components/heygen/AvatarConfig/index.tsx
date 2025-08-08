'use client';

import React, { useMemo, useState } from "react";
import {
  AvatarQuality,
  ElevenLabsModel,
  STTProvider,
  VoiceEmotion,
  StartAvatarRequest,
  VoiceChatTransport,
} from "@heygen/streaming-avatar";

import { Input } from "../Input";
import { Select } from "../Select";

import { Field } from "./Field";

import { AVATARS, STT_LANGUAGE_LIST } from "../constants";

interface AvatarConfigProps {
  onConfigChange: (config: StartAvatarRequest) => void;
  config: StartAvatarRequest;
}

export const AvatarConfig: React.FC<AvatarConfigProps> = ({
  onConfigChange,
  config,
}) => {
  const onChange = <T extends keyof StartAvatarRequest>(
    key: T,
    value: StartAvatarRequest[T],
  ) => {
    onConfigChange({ ...config, [key]: value });
  };
  const [showMore, setShowMore] = useState<boolean>(false);

  const selectedAvatar = useMemo(() => {
    const avatar = AVATARS.find(
      (avatar) => avatar.avatar_id === config.avatarName,
    );

    if (!avatar) {
      return {
        isCustom: true,
        name: "Custom Avatar ID",
        avatarId: null,
      };
    } else {
      return {
        isCustom: false,
        name: avatar.name,
        avatarId: avatar.avatar_id,
      };
    }
  }, [config.avatarName]);

  return (
    <div className="relative flex flex-col gap-4 w-[550px] py-8 max-h-full overflow-y-auto px-4">
      <Field label="Custom Knowledge Base ID">
        <Input
          placeholder="Enter custom knowledge base ID"
          value={config.knowledgeId}
          onChange={(value) => onChange("knowledgeId", value)}
        />
      </Field>
      <Field label="Avatar ID">
        <Select
          isSelected={(option) =>
            typeof option === "string"
              ? !!selectedAvatar?.isCustom
              : option.avatar_id === selectedAvatar?.avatarId
          }
          options={[...AVATARS, "CUSTOM"]}
          placeholder="Select Avatar"
          renderOption={(option) => {
            return typeof option === "string"
              ? "Custom Avatar ID"
              : option.name;
          }}
          value={
            selectedAvatar?.isCustom ? "Custom Avatar ID" : selectedAvatar?.name
          }
          onSelect={(option) => {
            if (typeof option === "string") {
              onChange("avatarName", "");
            } else {
              onChange("avatarName", option.avatar_id);
            }
          }}
        />
      </Field>
      {selectedAvatar?.isCustom && (
        <Field label="Custom Avatar ID">
          <Input
            placeholder="Enter custom avatar ID"
            value={config.avatarName}
            onChange={(value) => onChange("avatarName", value)}
          />
        </Field>
      )}
      <Field label="Language">
        <Select
          isSelected={(option) => option.value === config.language}
          options={STT_LANGUAGE_LIST}
          placeholder="Select Language"
          renderOption={(option) => option.label}
          value={STT_LANGUAGE_LIST.find((lang) => lang.value === config.language)?.label}
          onSelect={(option) => onChange("language", option.value)}
        />
      </Field>
      <Field label="Quality">
        <Select
          isSelected={(option) => option === config.quality}
          options={Object.values(AvatarQuality)}
          placeholder="Select Quality"
          renderOption={(option) => option.toUpperCase()}
          value={config.quality?.toUpperCase()}
          onSelect={(option) => onChange("quality", option)}
        />
      </Field>
      <Field label="Voice Chat Transport">
        <Select
          isSelected={(option) => option === config.voiceChatTransport}
          options={Object.values(VoiceChatTransport)}
          placeholder="Select Transport"
          renderOption={(option) => option.toUpperCase()}
          value={config.voiceChatTransport?.toUpperCase()}
          onSelect={(option) => onChange("voiceChatTransport", option)}
        />
      </Field>
      <Field label="STT Provider">
        <Select
          isSelected={(option) => option === config.sttSettings?.provider}
          options={Object.values(STTProvider)}
          placeholder="Select STT Provider"
          renderOption={(option) => option.toUpperCase()}
          value={config.sttSettings?.provider?.toUpperCase()}
          onSelect={(option) =>
            onChange("sttSettings", { ...config.sttSettings, provider: option })
          }
        />
      </Field>
      <div className="flex flex-col gap-2">
        <button
          className="text-sm text-zinc-400 hover:text-white"
          onClick={() => setShowMore(!showMore)}
        >
          {showMore ? "Show Less" : "Show More"}
        </button>
        {showMore && (
          <div className="flex flex-col gap-4">
            <Field label="Voice Model">
              <Select
                isSelected={(option) => option === config.voice?.model}
                options={Object.values(ElevenLabsModel)}
                placeholder="Select Voice Model"
                renderOption={(option) => option.toUpperCase()}
                value={config.voice?.model?.toUpperCase()}
                onSelect={(option) =>
                  onChange("voice", { ...config.voice, model: option })
                }
              />
            </Field>
            <Field label="Voice Emotion">
              <Select
                isSelected={(option) => option === config.voice?.emotion}
                options={Object.values(VoiceEmotion)}
                placeholder="Select Voice Emotion"
                renderOption={(option) => option.toUpperCase()}
                value={config.voice?.emotion?.toUpperCase()}
                onSelect={(option) =>
                  onChange("voice", { ...config.voice, emotion: option })
                }
              />
            </Field>
            <Field label="Voice Rate">
              <Input
                placeholder="Enter voice rate (0.5 - 2.0)"
                value={config.voice?.rate?.toString()}
                onChange={(value) => {
                  const rate = parseFloat(value);
                  if (!isNaN(rate) && rate >= 0.5 && rate <= 2.0) {
                    onChange("voice", { ...config.voice, rate });
                  }
                }}
              />
            </Field>
          </div>
        )}
      </div>
    </div>
  );
};
