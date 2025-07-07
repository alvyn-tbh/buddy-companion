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
  async getUsageStats(options: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    apiType?: string;
  } = {}): Promise<{
    totalCost: number;
    usageByType: Record<string, number>;
    usageByUser: Record<string, number>;
    dailyUsage: Array<{ date: string; cost: number }>;
  }> {
    try {
      const supabase = await createClient();
      let query = supabase
        .from('api_usage')
        .select('*');

      if (options.startDate) {
        query = query.gte('timestamp', options.startDate.toISOString());
      }
      if (options.endDate) {
        query = query.lte('timestamp', options.endDate.toISOString());
      }
      if (options.userId) {
        query = query.eq('user_id', options.userId);
      }
      if (options.apiType) {
        query = query.eq('api_type', options.apiType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching usage stats:', error);
        return {
          totalCost: 0,
          usageByType: {},
          usageByUser: {},
          dailyUsage: [],
        };
      }

      // Calculate statistics
      const totalCost = data.reduce((sum: number, record: { usage_dollars: number }) => sum + Number(record.usage_dollars), 0);
      
      const usageByType = data.reduce((acc: Record<string, number>, record: { api_type: string; usage_dollars: number }) => {
        acc[record.api_type] = (acc[record.api_type] || 0) + Number(record.usage_dollars);
        return acc;
      }, {} as Record<string, number>);

      const usageByUser = data.reduce((acc: Record<string, number>, record: { user_id: string; usage_dollars: number }) => {
        if (record.user_id) {
          acc[record.user_id] = (acc[record.user_id] || 0) + Number(record.usage_dollars);
        }
        return acc;
      }, {} as Record<string, number>);

      // Group by day
      const dailyUsage = data.reduce((acc: Record<string, number>, record: { timestamp: string; usage_dollars: number }) => {
        const date = new Date(record.timestamp).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + Number(record.usage_dollars);
        return acc;
      }, {} as Record<string, number>);

      const dailyUsageArray = Object.entries(dailyUsage)
        .map(([date, cost]) => ({ date, cost: cost as number }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        totalCost,
        usageByType,
        usageByUser,
        dailyUsage: dailyUsageArray,
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