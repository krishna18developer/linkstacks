/**
 * Title fetcher with cascading fallbacks:
 * 1. Microlink API (primary)
 * 2. Jina Reader (fallback 1)
 * 3. Hostname extraction (fallback 2)
 */

interface TitleFetchResult {
  title: string;
  source: 'microlink' | 'jina' | 'hostname';
}

// Rate limiting: keep track of requests per domain
const requestCounts = new Map<string, number>();
const RATE_LIMIT_WINDOW = 30000; // 30 seconds
const MAX_REQUESTS_PER_DOMAIN = 10;

function getDomainFromUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return 'unknown';
  }
}

function isRateLimited(domain: string): boolean {
  const now = Date.now();
  const key = `${domain}-${Math.floor(now / RATE_LIMIT_WINDOW)}`;
  const count = requestCounts.get(key) || 0;
  
  if (count >= MAX_REQUESTS_PER_DOMAIN) {
    return true;
  }
  
  requestCounts.set(key, count + 1);
  
  // Clean up old entries
  setTimeout(() => {
    requestCounts.delete(key);
  }, RATE_LIMIT_WINDOW * 2);
  
  return false;
}

async function fetchWithTimeout(url: string, timeout: number = 3000): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      mode: 'cors',
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchFromMicrolink(url: string): Promise<string | null> {
  try {
    const microlinkUrl = `${process.env.NEXT_PUBLIC_MICROLINK_BASE || 'https://api.microlink.io'}?url=${encodeURIComponent(url)}`;
    const response = await fetchWithTimeout(microlinkUrl, 3000);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Try different title fields in order of preference
    const title = data.title || data.meta?.title || data.data?.title;
    
    if (title && typeof title === 'string' && title.trim()) {
      return title.trim();
    }
    
    return null;
  } catch (error) {
    console.warn('Microlink fetch failed:', error);
    return null;
  }
}

async function fetchFromJinaReader(url: string): Promise<string | null> {
  try {
    // Ensure URL has protocol
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const jinaUrl = `${process.env.NEXT_PUBLIC_JINA_READER_BASE || 'https://r.jina.ai'}/${fullUrl}`;
    
    const response = await fetchWithTimeout(jinaUrl, 5000);
    
    if (!response.ok) {
      return null;
    }
    
    const html = await response.text();
    
    // Extract title from HTML using regex
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    
    if (titleMatch && titleMatch[1]) {
      const title = titleMatch[1].trim();
      if (title && title !== 'Untitled') {
        return title;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Jina Reader fetch failed:', error);
    return null;
  }
}

function extractHostname(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    return urlObj.hostname;
  } catch {
    return 'Unknown';
  }
}

export async function fetchTitle(url: string): Promise<TitleFetchResult> {
  const domain = getDomainFromUrl(url);
  
  // Check rate limiting
  if (isRateLimited(domain)) {
    console.warn(`Rate limited for domain: ${domain}`);
    return {
      title: extractHostname(url),
      source: 'hostname'
    };
  }
  
  // Try Microlink first
  const microlinkTitle = await fetchFromMicrolink(url);
  if (microlinkTitle) {
    return {
      title: microlinkTitle,
      source: 'microlink'
    };
  }
  
  // Try Jina Reader as fallback
  const jinaTitle = await fetchFromJinaReader(url);
  if (jinaTitle) {
    return {
      title: jinaTitle,
      source: 'jina'
    };
  }
  
  // Final fallback to hostname
  return {
    title: extractHostname(url),
    source: 'hostname'
  };
}

// Utility function to get a client ID for anonymous users
export function getClientId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let clientId = localStorage.getItem('linkstacks_client_id');
  if (!clientId) {
    clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('linkstacks_client_id', clientId);
  }
  return clientId;
}
