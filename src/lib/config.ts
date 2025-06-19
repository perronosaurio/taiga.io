export function getBaseUrl(): string {
  // In development, use localhost
  if (process.env.NODE_ENV === 'development') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  }
  
  // In production, use the environment variable or fallback
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://your-domain.com'
}

export function getWebhookUrl(): string {
  return `${getBaseUrl()}/api/webhook`
} 