import { createClient } from '@/lib/supabase/server';

// OpenAI API Pricing (as of 2024)
const OPENAI_PRICING = {
  // GPT Models (per 1K tokens)
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },

  // TTS Models (per 1K characters)
  'tts-1': { input: 0.015 },
  'tts-1-hd': { input: 0.03 },

  // Whisper (per minute)
  'whisper-1': { input: 0.006 },

  // DALL-E (per image)
  'dall-e-3': { input: 0.04 },
  'dall-e-2': { input: 0.02 },
} as const;

export interface UsageData {
  user_id?: string;
  api_type: 'speech' | 'text' | 'tts' | 'transcription';
  model: string;
  tokens_used?: number;
  characters_used?: number;
  minutes_used?: number;
  images_used?: number;
  request_id?: string;
  metadata?: Record<string, unknown>;
}

export class UsageTracker {
  /**
   * Calculate cost based on OpenAI pricing
   */
  private calculateCost(data: UsageData): number {
    const pricing = OPENAI_PRICING[data.model as keyof typeof OPENAI_PRICING];
    if (!pricing) {
      console.warn(`No pricing found for model: ${data.model}`);
      return 0;
    }

    let cost = 0;

    switch (data.api_type) {
      case 'text':
        if (data.tokens_used && 'output' in pricing) {
          const inputTokens = Math.floor(data.tokens_used * 0.7); // Estimate 70% input
          const outputTokens = data.tokens_used - inputTokens;
          cost = (inputTokens * pricing.input + outputTokens * pricing.output) / 1000;
        }
        break;

      case 'tts':
        if (data.characters_used) {
          cost = (data.characters_used * pricing.input) / 1000;
        }
        break;

      case 'transcription':
        if (data.minutes_used) {
          cost = data.minutes_used * pricing.input;
        }
        break;

      case 'speech':
        // Speech-to-speech might use both transcription and TTS
        if (data.minutes_used) {
          const whisperCost = data.minutes_used * OPENAI_PRICING['whisper-1'].input;
          const ttsCost = (data.characters_used || 0) * OPENAI_PRICING['tts-1'].input / 1000;
          cost = whisperCost + ttsCost;
        }
        break;
    }

    return Math.round(cost * 1000000) / 1000000; // Round to 6 decimal places
  }

  /**
   * Track API usage
   */
  async trackUsage(data: UsageData): Promise<void> {
    try {
      const supabase = await createClient();
      const cost = this.calculateCost(data);

      if (cost <= 0) {
        console.warn('Usage cost is 0 or negative, skipping tracking');
        return;
      }

      const { error } = await supabase
        .from('api_usage')
        .insert({
          user_id: data.user_id,
          usage_dollars: cost,
          api_type: data.api_type,
          model: data.model,
          tokens_used: data.tokens_used,
          request_id: data.request_id,
          metadata: data.metadata || {},
        });

      if (error) {
        console.error('Error tracking usage:', error);
      } else {
        console.log(`Tracked usage: $${cost} for ${data.api_type} (${data.model})`);
      }

    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(): Promise<{
    totalCost: number;
    usageByType: Record<string, number>;
    usageByUser: Record<string, number>;
    dailyUsage: Array<{ date: string; cost: number }>;
  }> {
    try {
      const supabase = await createClient();

      const { data: usageData, error } = await supabase
        .from('api_usage')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching usage data:', error);
        return {
          totalCost: 0,
          usageByType: {},
          usageByUser: {},
          dailyUsage: [],
        };
      }

      if (!usageData || usageData.length === 0) {
        return {
          totalCost: 0,
          usageByType: {},
          usageByUser: {},
          dailyUsage: [],
        };
      }

      interface UsageRecord {
        usage_dollars: number;
        api_type: string;
        user_id: string;
        created_at: string;
      }

      const totalCost = usageData.reduce((sum: number, item: UsageRecord) => sum + Number(item.usage_dollars), 0);
      const usageByType = usageData.reduce((acc: Record<string, number>, item: UsageRecord) => {
        acc[item.api_type] = (acc[item.api_type] || 0) + Number(item.usage_dollars);
        return acc;
      }, {} as Record<string, number>);
      const usageByUser = usageData.reduce((acc: Record<string, number>, item: UsageRecord) => {
        const userId = item.user_id || 'unknown';
        acc[userId] = (acc[userId] || 0) + Number(item.usage_dollars);
        return acc;
      }, {} as Record<string, number>);

      const dailyUsage = usageData.reduce((acc: Record<string, number>, item: UsageRecord) => {
        const date = new Date(item.created_at).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + Number(item.usage_dollars);
        return acc;
      }, {} as Record<string, number>);

      return {
        totalCost,
        usageByType,
        usageByUser,
        dailyUsage: Object.entries(dailyUsage).map(([date, cost]) => ({ date, cost: Number(cost) })),
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        totalCost: 0,
        usageByType: {},
        usageByUser: {},
        dailyUsage: [],
      };
    }
  }
}

// Export singleton instance
export const usageTracker = new UsageTracker();
