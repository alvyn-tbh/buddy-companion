import { NextRequest, NextResponse } from 'next/server';

// Enable Edge Runtime for better performance
export const runtime = 'edge';

// Cache configuration for edge
export const revalidate = 60; // Revalidate every 60 seconds

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

interface AnalyticsResponse {
  success: boolean;
  message: string;
  processed: number;
  cached: boolean;
  edge: boolean;
  timestamp: number;
}

/**
 * Edge Analytics API - Optimized for global performance
 * 
 * Features:
 * - Edge Runtime for global distribution
 * - Smart caching and batching
 * - Streaming responses for real-time data
 * - Performance monitoring integration
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    const events: AnalyticsEvent[] = Array.isArray(body) ? body : [body];
    
    // Validate events
    const validEvents = events.filter(event => 
      event.event && 
      event.timestamp && 
      typeof event.properties === 'object'
    );

    if (validEvents.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No valid events provided',
          edge: true,
          timestamp: Date.now()
        },
        { status: 400 }
      );
    }

    // Process events in batches for better performance
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < validEvents.length; i += batchSize) {
      batches.push(validEvents.slice(i, i + batchSize));
    }

    // Process batches concurrently
    const processPromises = batches.map(batch => processBatch(batch));
    const results = await Promise.allSettled(processPromises);
    
    const processed = results.reduce((count, result) => 
      result.status === 'fulfilled' ? count + result.value : count, 0
    );

    // Enhanced response with performance metrics
    const response: AnalyticsResponse = {
      success: true,
      message: `Processed ${processed} events`,
      processed,
      cached: false, // Edge runtime typically doesn't cache POST requests
      edge: true,
      timestamp: Date.now(),
    };

    // Add performance headers
    const responseHeaders = new Headers({
      'Content-Type': 'application/json',
      'X-Edge-Location': request.geo?.country || 'unknown',
      'X-Processing-Time': `${Date.now() - startTime}ms`,
      'X-Processed-Events': processed.toString(),
      'Cache-Control': 'no-store', // Don't cache analytics data
    });

    return NextResponse.json(response, { 
      status: 200,
      headers: responseHeaders
    });

  } catch (error) {
    console.error('[Edge Analytics] Error processing events:', error);
    
    const errorResponse = {
      success: false,
      message: 'Internal server error',
      processed: 0,
      cached: false,
      edge: true,
      timestamp: Date.now(),
    };

    return NextResponse.json(errorResponse, { 
      status: 500,
      headers: {
        'X-Error': 'true',
        'X-Processing-Time': `${Date.now() - startTime}ms`,
      }
    });
  }
}

/**
 * GET method for retrieving analytics data with streaming
 */
export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '100', 10);
  const streaming = searchParams.get('stream') === 'true';

  if (streaming) {
    // Return streaming response for real-time analytics
    return createStreamingResponse(userId, limit);
  }

  // Regular JSON response
  const data = await getAnalyticsData(userId, limit);
  
  return NextResponse.json({
    success: true,
    data,
    edge: true,
    timestamp: Date.now(),
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
      'X-Edge-Cache': 'MISS',
    }
  });
}

/**
 * Process a batch of analytics events
 */
async function processBatch(events: AnalyticsEvent[]): Promise<number> {
  // Simulate processing time (in real implementation, this would send to analytics service)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 10));
  
  // In a real implementation, you would:
  // - Send events to analytics service (e.g., Amplitude, Mixpanel)
  // - Store in database
  // - Forward to data warehouse
  // - Apply real-time processing rules
  
  for (const event of events) {
    // Enhance event with edge metadata
    const enhancedEvent = {
      ...event,
      edge: true,
      processed_at: Date.now(),
      version: '2.0',
    };
    
    // Log for debugging (in production, send to proper analytics service)
    console.log('[Edge Analytics] Processed event:', enhancedEvent.event);
  }
  
  return events.length;
}

/**
 * Get analytics data (simulated)
 */
async function getAnalyticsData(userId?: string | null, limit: number = 100) {
  // Simulate data retrieval
  await new Promise(resolve => setTimeout(resolve, 50));
  
  // In real implementation, query from analytics database
  const mockData = Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
    id: `event_${i}`,
    event: 'page_view',
    timestamp: Date.now() - (i * 60000),
    properties: {
      page: `/page_${i}`,
      referrer: 'https://google.com',
      device: 'desktop',
    },
    userId: userId || `user_${Math.floor(Math.random() * 1000)}`,
  }));
  
  return mockData;
}

/**
 * Create streaming response for real-time analytics
 */
function createStreamingResponse(userId?: string | null, limit: number = 100): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial data
        const initialData = await getAnalyticsData(userId, Math.min(limit, 10));
        
        for (const item of initialData) {
          const chunk = `data: ${JSON.stringify(item)}\n\n`;
          controller.enqueue(encoder.encode(chunk));
          
          // Add small delay to simulate real-time streaming
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Send completion signal
        controller.enqueue(encoder.encode('data: {"type": "complete"}\n\n'));
        controller.close();
        
      } catch (error) {
        const errorChunk = `data: ${JSON.stringify({ 
          type: 'error', 
          message: 'Stream error' 
        })}\n\n`;
        controller.enqueue(encoder.encode(errorChunk));
        controller.close();
      }
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable nginx buffering
    },
  });
}

/**
 * OPTIONS method for CORS support
 */
export async function OPTIONS(request: NextRequest): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}