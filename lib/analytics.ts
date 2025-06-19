// Analytics utility for tracking user engagement

// Generate a unique visitor ID (you might want to use a more sophisticated approach)
export function generateVisitorId(): string {
  if (typeof window !== 'undefined') {
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      localStorage.setItem('visitor_id', visitorId);
    }
    return visitorId;
  }
  return 'server_visitor_' + Date.now();
}

// Generate a session ID
export function generateSessionId(): string {
  if (typeof window !== 'undefined') {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }
  return 'server_session_' + Date.now();
}

// Track service usage
export async function trackServiceUsage(serviceName: string): Promise<void> {
  try {
    const visitorId = generateVisitorId();
    const sessionId = generateSessionId();

    const response = await fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_used: serviceName,
        visitor_id: visitorId,
        session_id: sessionId,
      }),
    });

    if (!response.ok) {
      console.warn('Failed to track service usage:', serviceName);
    }
  } catch (error) {
    console.warn('Error tracking service usage:', error);
  }
}

// Track page view
export async function trackPageView(pageName: string): Promise<void> {
  await trackServiceUsage(`page_view_${pageName}`);
}

// Track chat interaction
export async function trackChatInteraction(chatType: string): Promise<void> {
  await trackServiceUsage(`chat_${chatType}`);
}

// Track feature usage
export async function trackFeatureUsage(featureName: string): Promise<void> {
  await trackServiceUsage(`feature_${featureName}`);
}

// Track API call
export async function trackApiCall(apiEndpoint: string): Promise<void> {
  await trackServiceUsage(`api_${apiEndpoint}`);
}

// Get analytics data
export async function getAnalyticsData(environment: 'dev' | 'prod' = 'prod', days: number = 30) {
  try {
    const response = await fetch(`/api/analytics/track?environment=${environment}&days=${days}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return null;
  }
}

// Get database metrics
export async function getDatabaseMetrics(environment: 'dev' | 'prod' = 'prod', days: number = 7) {
  try {
    const response = await fetch(`/api/analytics/database?environment=${environment}&days=${days}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success ? result : null;
  } catch (error) {
    console.error('Error fetching database metrics:', error);
    return null;
  }
}
