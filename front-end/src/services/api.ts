import axios from 'axios';

// Define the correct backend API URL
// In development, use Next.js API route to proxy requests and avoid CORS issues
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
  : '/api'; // This will use Next.js rewrites to proxy to the backend

console.log('Using API URL:', API_BASE_URL, '(Environment:', process.env.NODE_ENV, ')');

// Create an Axios instance with the correct base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Add explicit CORS headers
    'Accept': 'application/json, text/plain, */*',
  },
  withCredentials: false, // Set to false when using proxy
  timeout: 15000, // Increased timeout to 15 seconds
});

// Add request interceptor for debugging
api.interceptors.request.use(config => {
  // Make sure URL has leading slash if needed
  if (config.url && !config.url.startsWith('/') && !config.url.includes('http')) {
    config.url = '/' + config.url;
  }
  console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
}, error => {
  console.error('API Request Error:', error);
  return Promise.reject(error);
});

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    
    // Check if response is HTML instead of JSON (common error when hitting wrong endpoint)
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML response instead of JSON. This likely means the API URL is incorrect.');
      throw new Error('Received HTML response instead of expected JSON. Check API URL configuration.');
    }
    
    return response;
  },
  error => {
    console.error('API Error:', error.message);
    
    // Enhanced error handling for specific error types
    if (error.code === 'ECONNABORTED') {
      console.error('Request timeout - server took too long to respond');
      error.message = 'Request timeout. The server is taking too long to respond.';
    } else if (error.response) {
      const contentType = error.response.headers['content-type'];
      if (contentType && contentType.includes('text/html')) {
        console.error('Received HTML error response instead of JSON. Check if API URL is pointing to the backend server.');
      }
      
      console.error(`Error Response: Status ${error.response.status}`, error.response.data);
      
      // Don't modify error messages for 500 errors to preserve debugging info
      if (error.response.status === 500) {
        console.error('Internal server error. This might indicate missing API endpoints.');
      } else if (error.response.status === 404) {
        console.error('Resource not found. API endpoint might not be implemented yet.');
      } else if (error.response.status === 403) {
        error.message = 'Access denied. Please check your permissions.';
      } else if (error.response.status === 401) {
        error.message = 'Authentication required. Please log in.';
      }
    } else if (error.request) {
      console.error('No response received from server. The server might be down or unreachable.');
      console.error(`Attempted to connect to: ${error.config?.baseURL}${error.config?.url}`);
      
      // Add CORS-specific error detection
      if (error.message.includes('Network Error') || error.message.includes('CORS')) {
        console.error('This appears to be a CORS error. Check that the backend server has CORS properly configured.');
        console.error('Backend should allow origin:', window?.location?.origin || 'unknown');
        error.message = 'Network error. Please check your connection and try again.';
      }
    }
    
    return Promise.reject(error);
  }
);

// Export the API instance
export default api;

// Export the base URL for other services that might need it
export const apiBaseUrl = API_BASE_URL;
