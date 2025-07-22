'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AdvancedVoiceActivityDetector, VADConfig } from '@/lib/voice-activity-detector';
import { VoiceActivityIndicator } from '@/components/voice-activity-indicator';
import { Mic, MicOff, Settings } from 'lucide-react';

export default function VADTestPage() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(-50);
  const [noiseFloor, setNoiseFloor] = useState(-50);
  const [vadConfig, setVadConfig] = useState<VADConfig>({
    voiceThreshold: 10,
    silenceThreshold: 5,
    preSpeechPadding: 300,
    postSpeechPadding: 500,
    noiseFloorAdaptation: true,
    adaptationSpeed: 0.02
  });
  
  const vadRef = useRef<AdvancedVoiceActivityDetector | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;
      
      vadRef.current = new AdvancedVoiceActivityDetector(vadConfig, {
        onSpeechStart: () => {
          setIsSpeaking(true);
          console.log('Speech started');
        },
        onSpeechEnd: () => {
          setIsSpeaking(false);
          console.log('Speech ended');
        },
        onVolumeChange: (vol) => {
          setVolume(vol);
        },
        onNoiseFloorUpdate: (nf) => {
          setNoiseFloor(nf);
          console.log('Noise floor updated:', nf);
        }
      });
      
      await vadRef.current.start(stream);
      setIsListening(true);
    } catch (error) {
      console.error('Failed to start VAD:', error);
      alert('Failed to access microphone');
    }
  };

  const stopListening = () => {
    if (vadRef.current) {
      vadRef.current.stop();
      vadRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsListening(false);
    setIsSpeaking(false);
  };

  const updateConfig = (key: keyof VADConfig, value: any) => {
    const newConfig = { ...vadConfig, [key]: value };
    setVadConfig(newConfig);
    
    if (vadRef.current) {
      vadRef.current.setConfig({ [key]: value });
    }
  };

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Voice Activity Detection Test</CardTitle>
          <CardDescription>
            Test voice activity detection in different noise environments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Controls */}
          <div className="flex items-center justify-center">
            <Button
              size="lg"
              onClick={isListening ? stopListening : startListening}
              className={isListening ? 'bg-red-500 hover:bg-red-600' : ''}
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-5 w-5" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-5 w-5" />
                  Start Listening
                </>
              )}
            </Button>
          </div>

          {/* Voice Activity Indicator */}
          <div className="flex justify-center">
            <VoiceActivityIndicator
              isActive={isListening}
              isSpeaking={isSpeaking}
              volume={volume}
              noiseFloor={noiseFloor}
              className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
            />
          </div>

          {/* Real-time Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Current Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono">{volume.toFixed(1)} dB</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-100"
                    style={{ width: `${Math.max(0, Math.min(100, (volume + 90) * 1.11))}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Volume Above Noise Floor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono">{(volume - noiseFloor).toFixed(1)} dB</div>
                <div className="text-sm text-gray-500">
                  Threshold: {vadConfig.voiceThreshold} dB
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                VAD Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Voice Threshold (dB above noise)</Label>
                  <input
                    type="range"
                    min="5"
                    max="20"
                    value={vadConfig.voiceThreshold}
                    onChange={(e) => updateConfig('voiceThreshold', Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">{vadConfig.voiceThreshold} dB</div>
                </div>

                <div>
                  <Label>Silence Threshold (dB above noise)</Label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    value={vadConfig.silenceThreshold}
                    onChange={(e) => updateConfig('silenceThreshold', Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">{vadConfig.silenceThreshold} dB</div>
                </div>

                <div>
                  <Label>Pre-speech Padding (ms)</Label>
                  <input
                    type="range"
                    min="0"
                    max="500"
                    step="50"
                    value={vadConfig.preSpeechPadding}
                    onChange={(e) => updateConfig('preSpeechPadding', Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">{vadConfig.preSpeechPadding} ms</div>
                </div>

                <div>
                  <Label>Post-speech Padding (ms)</Label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={vadConfig.postSpeechPadding}
                    onChange={(e) => updateConfig('postSpeechPadding', Number(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-500">{vadConfig.postSpeechPadding} ms</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={vadConfig.noiseFloorAdaptation}
                    onChange={(e) => updateConfig('noiseFloorAdaptation', e.target.checked)}
                  />
                  <span>Adaptive Noise Floor</span>
                </label>

                {vadConfig.noiseFloorAdaptation && (
                  <div className="flex-1">
                    <Label>Adaptation Speed</Label>
                    <input
                      type="range"
                      min="0.01"
                      max="0.1"
                      step="0.01"
                      value={vadConfig.adaptationSpeed}
                      onChange={(e) => updateConfig('adaptationSpeed', Number(e.target.value))}
                      className="w-full"
                    />
                    <div className="text-sm text-gray-500">{vadConfig.adaptationSpeed}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Testing Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>1. Click "Start Listening" to begin voice activity detection</p>
              <p>2. Try speaking in different environments (quiet, noisy, background music)</p>
              <p>3. Adjust the thresholds to find optimal settings for your environment</p>
              <p>4. The noise floor will automatically adapt to background noise levels</p>
              <p>5. Green indicators show when speech is detected</p>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
