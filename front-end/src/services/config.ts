// Define API base URL based on environment
export const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// API endpoints configuration
export const apiEndpoints = {
  // Direct backend URLs (most reliable)
  direct: {
    components: `${apiBaseUrl}/components`,
    subscriptions: `${apiBaseUrl}/subscriptions`,
    plans: `${apiBaseUrl}/plans`,
    auth: `${apiBaseUrl}/auth`,
  },
  // Proxied URLs through Next.js
  proxied: {
    components: '/api/components',
    subscriptions: '/api/subscriptions', 
    plans: '/api/plans',
    auth: '/api/auth',
  }
};

// Fallback endpoints in order of preference
export const getEndpointFallbacks = (resource: string) => [
  apiEndpoints.direct[resource as keyof typeof apiEndpoints.direct],
  `/${resource}`,
  apiEndpoints.proxied[resource as keyof typeof apiEndpoints.proxied],
  `/api/v1/${resource}`
].filter(Boolean);

// Other configuration exports
