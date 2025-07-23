'use client';

import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface SetupStatusProps {
  className?: string;
}

function SetupStatus({ className = '' }: SetupStatusProps) {
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [envStatus, setEnvStatus] = useState<{
    openaiKey: boolean;
  } | null>(null);

  const azureSpeechKey = !!process.env.NEXT_PUBLIC_AZURE_SPEECH_KEY;
  const azureSpeechRegion = !!process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION;

  useEffect(() => {
    setIsClient(true);
    
    // Fetch server-side environment status
    fetch('/api/test-env')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('Environment status fetched:', data);
        console.log('OPENAI_API_KEY from API:', data.environment?.OPENAI_API_KEY);
        const openaiKeyStatus = data.environment?.OPENAI_API_KEY === true;
        console.log('Setting openaiKey to:', openaiKeyStatus);
        setEnvStatus({
          openaiKey: openaiKeyStatus
        });
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch environment status:', error);
        setEnvStatus({
          openaiKey: false
        });
        setIsLoading(false);
      });
  }, []);

  // Use client-side status if available, otherwise assume false for SSR consistency
  const openaiKey = envStatus?.openaiKey || false;

  const services = [
    {
      name: 'Azure Speech Service',
      configured: azureSpeechKey && azureSpeechRegion,
      required: true,
      description: 'Required for Speech-to-Video Avatar',
      details: `Key: ${azureSpeechKey ? '✓' : '✗'}, Region: ${azureSpeechRegion ? process.env.NEXT_PUBLIC_AZURE_SPEECH_REGION : '✗'}`,
      setupUrl: '/docs/AZURE_SETUP_GUIDE.md'
    },
    {
      name: 'OpenAI API',
      configured: isClient ? openaiKey : false, // Always false during SSR for consistency
      required: true,
      description: 'Required for GPT responses',
      details: !isClient || isLoading ? 'Checking...' : (openaiKey ? 'Configured' : 'Missing OPENAI_API_KEY'),
      setupUrl: 'https://platform.openai.com/api-keys'
    }
  ];

  const allRequired = services.filter(s => s.required).every(s => s.configured);

  // Always show during SSR, then hide if configured after client hydration
  if (allRequired && isClient) {
    return null; // Don't show if everything is configured
  }

  return (
    <Card className={`p-4 border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
            🔧 Setup Required for Speech-to-Video
          </h3>
          <div className="space-y-3">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {service.configured ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">{service.name}</span>
                    {service.required && (
                      <Badge variant="destructive" className="text-xs">
                        Required
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                    {service.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 ml-6 font-mono" suppressHydrationWarning>
                    {service.details}
                  </p>
                </div>
                {!service.configured && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => window.open(service.setupUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Setup
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Quick Start:</strong> 
              {' '}Create an Azure Speech Service in the{' '}
              <a 
                href="https://portal.azure.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:no-underline"
              >
                Azure Portal
              </a>
              {' '}and add the credentials to your <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.env.local</code> file.
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

export default SetupStatus;
export { SetupStatus };
